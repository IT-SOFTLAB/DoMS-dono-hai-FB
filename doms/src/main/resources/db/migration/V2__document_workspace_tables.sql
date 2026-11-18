-- Core workspace tables were missing from the original migration set.
-- Keep user-owned records scoped to their owner and preserve existing records.

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL REFERENCES users(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_categories_user_name_ci
    ON categories (user_id, LOWER(name));
CREATE INDEX IF NOT EXISTS idx_categories_user_name
    ON categories (user_id, name);

CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL REFERENCES users(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS uk_departments_user_name_ci
    ON departments (user_id, LOWER(name));
CREATE INDEX IF NOT EXISTS idx_departments_user_name
    ON departments (user_id, name);

CREATE TABLE IF NOT EXISTS folders (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    parent_id BIGINT REFERENCES folders(id),
    owner_id BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_folders_owner_name
    ON folders (owner_id, name);

CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255),
    file_path VARCHAR(255),
    file_type VARCHAR(255),
    file_size BIGINT,
    description VARCHAR(255),
    document_code VARCHAR(255) UNIQUE,
    category VARCHAR(255),
    department VARCHAR(255),
    document_date VARCHAR(255),
    tags VARCHAR(255),
    reference_number VARCHAR(255),
    document_owner VARCHAR(255),
    confidentiality VARCHAR(255),
    document_status VARCHAR(255),
    fiscal_year VARCHAR(255),
    storage_location VARCHAR(255),
    uploaded_at TIMESTAMP,
    deleted_at TIMESTAMP,
    content_hash VARCHAR(64),
    current_version INTEGER DEFAULT 1,
    folder_id BIGINT REFERENCES folders(id),
    uploaded_by BIGINT REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by
    ON documents (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_folder
    ON documents (folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at
    ON documents (deleted_at);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at
    ON documents (uploaded_at DESC);

CREATE TABLE IF NOT EXISTS document_versions (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES documents(id),
    version_number INTEGER NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(255),
    file_size BIGINT,
    content_hash VARCHAR(64),
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    change_note VARCHAR(255),
    CONSTRAINT uk_document_versions_document_number UNIQUE (document_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_document_versions_document
    ON document_versions (document_id, version_number DESC);

CREATE TABLE IF NOT EXISTS document_shares (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES documents(id),
    shared_by BIGINT NOT NULL REFERENCES users(id),
    shared_to BIGINT NOT NULL REFERENCES users(id),
    permission VARCHAR(20) NOT NULL,
    shared_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_document_shares_document_recipient UNIQUE (document_id, shared_to)
);
CREATE INDEX IF NOT EXISTS idx_document_shares_recipient
    ON document_shares (shared_to);

CREATE TABLE IF NOT EXISTS document_notes (
    id BIGSERIAL PRIMARY KEY,
    description VARCHAR(2000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    document_id BIGINT NOT NULL REFERENCES documents(id),
    user_id BIGINT NOT NULL REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_document_notes_user_created
    ON document_notes (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    document_id BIGINT,
    document_code VARCHAR(255),
    document_name VARCHAR(255),
    action VARCHAR(30) NOT NULL,
    details VARCHAR(1000),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
    ON audit_logs (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS subscription_request (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    plan VARCHAR(255) NOT NULL,
    document_credits INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    payment_method VARCHAR(255) NOT NULL,
    status VARCHAR(255) NOT NULL,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_subscription_request_user_status
    ON subscription_request (user_id, status);
