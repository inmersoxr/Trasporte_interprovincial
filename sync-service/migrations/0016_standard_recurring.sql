-- Recurrence creates ordinary, persistent departures in the existing calendar.
CREATE TABLE standard_recurring_schedules (
 id TEXT PRIMARY KEY,
 operator_id TEXT NOT NULL REFERENCES operators(id),
 offer_id TEXT NOT NULL REFERENCES route_offers(id),
 vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
 timezone TEXT NOT NULL CHECK(timezone='America/Guayaquil'),
 start_date TEXT NOT NULL, end_date TEXT NOT NULL CHECK(end_date>=start_date),
 weekdays_json TEXT NOT NULL CHECK(json_valid(weekdays_json)),
 times_json TEXT NOT NULL CHECK(json_valid(times_json)),
 duration_minutes INTEGER NOT NULL CHECK(duration_minutes BETWEEN 1 AND 2880),
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN('active','stopped')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_standard_recurring_operator ON standard_recurring_schedules(operator_id,created_at);
ALTER TABLE departures ADD COLUMN schedule_id TEXT REFERENCES standard_recurring_schedules(id);
CREATE UNIQUE INDEX idx_standard_recurring_occurrence ON departures(schedule_id,depart_at) WHERE schedule_id IS NOT NULL;
CREATE TRIGGER standard_recurring_departure_valid BEFORE INSERT ON departures
WHEN NEW.schedule_id IS NOT NULL AND NOT EXISTS(
 SELECT 1 FROM standard_recurring_schedules s
 JOIN operators o ON o.id=s.operator_id JOIN vehicles v ON v.id=s.vehicle_id
 JOIN route_offers r ON r.id=s.offer_id
 WHERE s.id=NEW.schedule_id AND s.status='active' AND o.status='approved' AND v.status='active'
 AND r.active=1 AND r.service_type='shared' AND r.operator_id=s.operator_id AND v.operator_id=s.operator_id
 AND s.vehicle_id=NEW.vehicle_id AND s.offer_id=NEW.offer_id
 AND date(NEW.depart_at,'-5 hours') BETWEEN s.start_date AND s.end_date)
BEGIN SELECT RAISE(ABORT,'schedule_unavailable'); END;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0016_standard_recurring');
