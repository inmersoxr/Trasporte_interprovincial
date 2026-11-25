CREATE TABLE IF NOT EXISTS standard_tracking (
 id TEXT PRIMARY KEY,operator_id TEXT NOT NULL REFERENCES operators(id),
 departure_id TEXT UNIQUE REFERENCES departures(id),booking_id TEXT UNIQUE REFERENCES bookings(id),custom_booking_id TEXT UNIQUE REFERENCES standard_custom_bookings(id),
 state_json TEXT NOT NULL,revision INTEGER NOT NULL,service_status TEXT NOT NULL DEFAULT 'running' CHECK(service_status IN('running','completed')),
 CHECK((departure_id IS NOT NULL)+(booking_id IS NOT NULL)+(custom_booking_id IS NOT NULL)=1)
);
CREATE TABLE IF NOT EXISTS standard_operational_events (
 id TEXT PRIMARY KEY,operator_id TEXT NOT NULL REFERENCES operators(id),entity_kind TEXT NOT NULL,entity_id TEXT NOT NULL,event TEXT NOT NULL,
 at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_standard_booking_operator ON standard_booking_details(operator_id,booking_id);
CREATE INDEX IF NOT EXISTS idx_standard_tracking_operator ON standard_tracking(operator_id);
CREATE TRIGGER IF NOT EXISTS standard_tracking_live BEFORE INSERT ON standard_tracking
WHEN (NEW.departure_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM departures WHERE id=NEW.departure_id AND status='running'))
 OR (NEW.booking_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM bookings WHERE id=NEW.booking_id AND status='confirmed' AND departure_id IS NULL))
 OR (NEW.custom_booking_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM standard_custom_bookings WHERE id=NEW.custom_booking_id AND status='running'))
BEGIN SELECT RAISE(ABORT,'service_unavailable'); END;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0006_operations');
