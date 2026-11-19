-- Development Standard only; no demo ledger migration or payment integration.
CREATE TABLE IF NOT EXISTS standard_sessions (
 token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS standard_commands (
 user_id TEXT NOT NULL REFERENCES users(id), request_id TEXT NOT NULL,
 kind TEXT NOT NULL, fingerprint TEXT NOT NULL, entity_id TEXT NOT NULL,
 PRIMARY KEY(user_id,request_id)
);
CREATE TABLE IF NOT EXISTS standard_route_vehicles (
 offer_id TEXT PRIMARY KEY REFERENCES route_offers(id),
 vehicle_id TEXT NOT NULL REFERENCES vehicles(id)
);
CREATE TABLE IF NOT EXISTS standard_vehicle_slots (
 id TEXT PRIMARY KEY, vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
 starts_at INTEGER NOT NULL, ends_at INTEGER NOT NULL CHECK(ends_at>starts_at),
 departure_id TEXT UNIQUE REFERENCES departures(id), booking_id TEXT UNIQUE REFERENCES bookings(id),
 active INTEGER NOT NULL DEFAULT 1 CHECK(active IN(0,1))
);
CREATE INDEX IF NOT EXISTS idx_standard_slots ON standard_vehicle_slots(vehicle_id,active,starts_at,ends_at);
CREATE TRIGGER IF NOT EXISTS standard_vehicle_no_overlap BEFORE INSERT ON standard_vehicle_slots
WHEN NEW.active=1 AND EXISTS(SELECT 1 FROM standard_vehicle_slots s WHERE s.vehicle_id=NEW.vehicle_id
 AND s.active=1 AND s.starts_at<NEW.ends_at AND s.ends_at>NEW.starts_at)
BEGIN SELECT RAISE(ABORT,'vehicle_conflict'); END;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0002_standard');
