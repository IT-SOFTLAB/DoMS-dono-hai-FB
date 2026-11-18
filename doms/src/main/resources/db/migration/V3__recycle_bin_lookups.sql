ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

DROP INDEX IF EXISTS uk_categories_user_name_ci;
CREATE UNIQUE INDEX IF NOT EXISTS uk_categories_user_name_ci
    ON categories (user_id, LOWER(name)) WHERE deleted_at IS NULL;

DROP INDEX IF EXISTS uk_departments_user_name_ci;
CREATE UNIQUE INDEX IF NOT EXISTS uk_departments_user_name_ci
    ON departments (user_id, LOWER(name)) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_categories_user_deleted
    ON categories (user_id, deleted_at DESC) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_departments_user_deleted
    ON departments (user_id, deleted_at DESC) WHERE deleted_at IS NOT NULL;
