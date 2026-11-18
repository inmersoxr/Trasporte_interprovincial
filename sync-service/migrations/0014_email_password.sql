CREATE TABLE auth_email_accounts (
 email_hash TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
 password_hash TEXT NOT NULL,verified_at INTEGER NOT NULL,version INTEGER NOT NULL DEFAULT 1,last_nonce TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE auth_email_actions (
 token_hash TEXT PRIMARY KEY,email_hash TEXT NOT NULL,email TEXT NOT NULL,purpose TEXT NOT NULL CHECK(purpose IN('verify','reset')),
 user_id TEXT REFERENCES users(id),display_name TEXT,version INTEGER,expires_at INTEGER NOT NULL,used_at INTEGER,claim_nonce TEXT
);
CREATE INDEX auth_email_actions_expiry ON auth_email_actions(expires_at);
CREATE TABLE auth_rate_limits (
 key_hash TEXT NOT NULL,bucket INTEGER NOT NULL,hits INTEGER NOT NULL,PRIMARY KEY(key_hash,bucket)
);
CREATE TABLE platform_owner_email_policy (
 singleton INTEGER PRIMARY KEY CHECK(singleton=1),email_hash TEXT NOT NULL
);
-- First platform owner is claimed only after mailbox verification of the preauthorized email.
INSERT INTO platform_owner_email_policy(singleton,email_hash) VALUES(1,'975b72480fe21fe9881015a1924452c323ac74f3864b3c58dbd1b2a6f00779ba');
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0014_email_password');
