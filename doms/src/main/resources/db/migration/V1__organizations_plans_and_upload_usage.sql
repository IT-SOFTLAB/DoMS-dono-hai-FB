CREATE TABLE IF NOT EXISTS organizations (
 id BIGSERIAL PRIMARY KEY, name VARCHAR(120) NOT NULL, slug VARCHAR(120) NOT NULL,
 active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT uk_organizations_name UNIQUE(name), CONSTRAINT uk_organizations_slug UNIQUE(slug)
);
CREATE TABLE IF NOT EXISTS plans (
 id BIGSERIAL PRIMARY KEY, name VARCHAR(80) NOT NULL, slug VARCHAR(80) NOT NULL,
 monthly_upload_limit_bytes BIGINT NOT NULL CHECK(monthly_upload_limit_bytes >= 0), active BOOLEAN NOT NULL DEFAULT TRUE,
 CONSTRAINT uk_plans_slug UNIQUE(slug)
);
INSERT INTO plans(name,slug,monthly_upload_limit_bytes,active) VALUES
 ('Silver','silver',5368709120,TRUE),('Gold','gold',8589934592,TRUE),('Diamond','diamond',16106127360,TRUE)
ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, monthly_upload_limit_bytes=EXCLUDED.monthly_upload_limit_bytes;

CREATE TABLE IF NOT EXISTS users (
 id BIGSERIAL PRIMARY KEY,
 full_name VARCHAR(255) NOT NULL,
 email VARCHAR(255) NOT NULL,
 contact_number VARCHAR(255),
 job_title VARCHAR(255),
 department VARCHAR(255),
 address VARCHAR(255),
 password VARCHAR(255) NOT NULL,
 role VARCHAR(255) NOT NULL,
 enabled BOOLEAN NOT NULL,
 created_at TIMESTAMP NOT NULL,
 document_limit INTEGER NOT NULL,
 documents_used INTEGER NOT NULL,
 current_plan VARCHAR(255) NOT NULL,
 token_version BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS uk_users_email ON users(email);

ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id BIGINT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_start_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date DATE;
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan_id);
DO $$ BEGIN ALTER TABLE users ADD CONSTRAINT fk_users_organization FOREIGN KEY(organization_id) REFERENCES organizations(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE users ADD CONSTRAINT fk_users_plan FOREIGN KEY(plan_id) REFERENCES plans(id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS monthly_upload_usage (
 id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id), period_start DATE NOT NULL,
 period_end DATE NOT NULL, used_bytes BIGINT NOT NULL DEFAULT 0 CHECK(used_bytes >= 0), version BIGINT NOT NULL DEFAULT 0,
 CONSTRAINT uk_usage_user_period UNIQUE(user_id,period_start)
);
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON monthly_upload_usage(user_id,period_start);
