ALTER TABLE premium_profiles ADD COLUMN identity_draft_json TEXT;
ALTER TABLE premium_profiles ADD COLUMN identity_public_json TEXT;
ALTER TABLE premium_profiles ADD COLUMN identity_revision INTEGER NOT NULL DEFAULT 0;
ALTER TABLE premium_profiles ADD COLUMN identity_request TEXT;
CREATE TABLE standard_identity_commands(operator_id TEXT NOT NULL REFERENCES operators(id),request_id TEXT NOT NULL,fingerprint TEXT NOT NULL,revision INTEGER NOT NULL,PRIMARY KEY(operator_id,request_id));
CREATE TRIGGER standard_identity_cas BEFORE INSERT ON standard_identity_commands WHEN NOT EXISTS(SELECT 1 FROM premium_profiles WHERE operator_id=NEW.operator_id AND identity_revision=NEW.revision AND identity_request=NEW.request_id)
BEGIN SELECT RAISE(ABORT,'identity_conflict'); END;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0027_company_identity');
