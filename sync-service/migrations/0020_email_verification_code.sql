-- Additive: existing mailbox links and verified credentials remain valid.
ALTER TABLE auth_email_actions ADD COLUMN pending_password_hash TEXT;
ALTER TABLE auth_email_actions ADD COLUMN code_hash TEXT;
ALTER TABLE auth_email_actions ADD COLUMN code_attempts INTEGER NOT NULL DEFAULT 0;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0020_email_verification_code');
