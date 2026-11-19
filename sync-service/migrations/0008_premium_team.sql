CREATE TABLE premium_branches (
 id TEXT PRIMARY KEY,operator_id TEXT NOT NULL REFERENCES operators(id),name TEXT NOT NULL,city TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX premium_branches_tenant ON premium_branches(operator_id);
CREATE TABLE premium_invites (
 id TEXT PRIMARY KEY,operator_id TEXT NOT NULL REFERENCES operators(id),token_hash TEXT NOT NULL UNIQUE,
 role TEXT NOT NULL CHECK(role IN('admin','dispatcher','driver')),expires_at INTEGER NOT NULL,
 used_by TEXT REFERENCES users(id),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE premium_assignments (
 vehicle_id TEXT PRIMARY KEY REFERENCES vehicles(id),operator_id TEXT NOT NULL REFERENCES operators(id),
 branch_id TEXT NOT NULL REFERENCES premium_branches(id),driver_user_id TEXT REFERENCES users(id)
);
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0008_premium_team');
