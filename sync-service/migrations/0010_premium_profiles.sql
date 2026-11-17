CREATE TABLE premium_media (
 id TEXT PRIMARY KEY,operator_id TEXT NOT NULL REFERENCES operators(id),object_key TEXT NOT NULL UNIQUE,
 content_type TEXT NOT NULL,bytes INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE premium_profiles (
 operator_id TEXT PRIMARY KEY REFERENCES operators(id),title TEXT NOT NULL,tagline TEXT NOT NULL DEFAULT '',
 bio TEXT NOT NULL DEFAULT '',accent TEXT NOT NULL DEFAULT '#f6c928',website TEXT NOT NULL DEFAULT '',
 logo_media_id TEXT REFERENCES premium_media(id),cover_media_id TEXT REFERENCES premium_media(id),
 published INTEGER NOT NULL DEFAULT 0 CHECK(published IN(0,1)),revision INTEGER NOT NULL,
 last_request TEXT NOT NULL,fingerprint TEXT NOT NULL,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0010_premium_profiles');
