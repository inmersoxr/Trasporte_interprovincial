ALTER TABLE standard_sessions ADD COLUMN expires_at INTEGER;
CREATE TABLE auth_identities (
 provider TEXT NOT NULL CHECK(provider='google'),subject TEXT NOT NULL,user_id TEXT NOT NULL REFERENCES users(id),
 email TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(provider,subject),UNIQUE(provider,user_id)
);
CREATE TABLE auth_transactions (
 state_hash TEXT PRIMARY KEY,verifier TEXT NOT NULL,nonce TEXT NOT NULL,expires_at INTEGER NOT NULL,
 link_user_id TEXT REFERENCES users(id)
);
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0011_google_identity');
