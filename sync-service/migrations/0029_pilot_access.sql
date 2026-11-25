CREATE TABLE auth_phone_accounts(phone_hash TEXT PRIMARY KEY,phone TEXT NOT NULL UNIQUE,user_id TEXT NOT NULL UNIQUE REFERENCES users(id),password_hash TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,last_nonce TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE auth_pilot_users(user_id TEXT PRIMARY KEY REFERENCES users(id),contact_kind TEXT NOT NULL CHECK(contact_kind IN('email','phone')),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0029_pilot_access');
