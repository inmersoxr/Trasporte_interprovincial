-- Premium development only; common fleet and calendar remain shared with Standard.
CREATE TABLE premium_tenants (
 operator_id TEXT PRIMARY KEY REFERENCES operators(id),
 plan TEXT NOT NULL DEFAULT 'premium_dev' CHECK(plan='premium_dev'),
 active INTEGER NOT NULL DEFAULT 1 CHECK(active IN(0,1)),
 activated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE premium_vehicle_profiles (
 vehicle_id TEXT PRIMARY KEY REFERENCES vehicles(id),
 odometer_km INTEGER NOT NULL CHECK(odometer_km>=0),
 next_service_km INTEGER CHECK(next_service_km>=0),
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER premium_odometer_monotonic BEFORE UPDATE ON premium_vehicle_profiles
WHEN NEW.odometer_km<OLD.odometer_km
BEGIN SELECT RAISE(ABORT,'odometer_decrease'); END;
CREATE TABLE premium_maintenance (
 id TEXT PRIMARY KEY, operator_id TEXT NOT NULL REFERENCES operators(id),
 vehicle_id TEXT NOT NULL REFERENCES vehicles(id), summary TEXT NOT NULL,
 starts_at INTEGER NOT NULL, ends_at INTEGER NOT NULL CHECK(ends_at>starts_at),
 estimated_cost_cents INTEGER NOT NULL DEFAULT 0 CHECK(estimated_cost_cents>=0),
 status TEXT NOT NULL DEFAULT 'open' CHECK(status IN('open','completed','cancelled')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, closed_at TEXT
);
CREATE INDEX premium_maintenance_tenant ON premium_maintenance(operator_id,starts_at);
ALTER TABLE standard_vehicle_slots ADD COLUMN maintenance_id TEXT REFERENCES premium_maintenance(id);
CREATE UNIQUE INDEX premium_maintenance_slot ON standard_vehicle_slots(maintenance_id);
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0007_premium_fleet');
