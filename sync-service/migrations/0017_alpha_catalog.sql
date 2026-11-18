-- Existing development publications are quarantined, never deleted or promoted by name.
ALTER TABLE operators ADD COLUMN data_scope TEXT NOT NULL DEFAULT 'qa' CHECK(data_scope IN('qa','alpha'));
CREATE INDEX idx_operators_alpha_scope ON operators(data_scope,status);
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0017_alpha_catalog');
