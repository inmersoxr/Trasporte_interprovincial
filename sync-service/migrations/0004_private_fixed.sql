ALTER TABLE standard_route_vehicles ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 240 CHECK(duration_minutes BETWEEN 1 AND 2880);
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0004_private_fixed');
