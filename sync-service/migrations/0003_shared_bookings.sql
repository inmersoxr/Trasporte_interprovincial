CREATE TABLE IF NOT EXISTS standard_booking_details (
 booking_id TEXT PRIMARY KEY REFERENCES bookings(id), operator_id TEXT NOT NULL REFERENCES operators(id),
 vehicle_id TEXT NOT NULL REFERENCES vehicles(id)
);
CREATE TABLE IF NOT EXISTS standard_passengers (
 booking_id TEXT NOT NULL REFERENCES bookings(id), position INTEGER NOT NULL,
 name TEXT NOT NULL, seat_number INTEGER, boarded_at INTEGER,
 PRIMARY KEY(booking_id,position)
);
CREATE TRIGGER IF NOT EXISTS standard_seat_valid BEFORE INSERT ON seat_claims
WHEN NEW.status IN('held','confirmed') AND NOT EXISTS(
 SELECT 1 FROM departures d JOIN vehicles v ON v.id=d.vehicle_id
 WHERE d.id=NEW.departure_id AND d.status='published'
 AND unixepoch(d.depart_at)>unixepoch('now') AND NEW.seat_number BETWEEN 1 AND v.capacity)
BEGIN SELECT RAISE(ABORT,'seat_unavailable'); END;
CREATE TRIGGER IF NOT EXISTS standard_cancel_not_boarded BEFORE UPDATE OF status ON bookings
WHEN NEW.status='cancelled' AND EXISTS(SELECT 1 FROM standard_passengers p WHERE p.booking_id=NEW.id AND p.boarded_at IS NOT NULL)
BEGIN SELECT RAISE(ABORT,'already_boarded'); END;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0003_shared_bookings');
