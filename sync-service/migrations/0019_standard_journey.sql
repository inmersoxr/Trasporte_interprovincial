ALTER TABLE route_offers ADD COLUMN pickup_point TEXT NOT NULL DEFAULT '';
ALTER TABLE route_offers ADD COLUMN dropoff_point TEXT NOT NULL DEFAULT '';
CREATE TABLE standard_passenger_profiles (
 user_id TEXT PRIMARY KEY REFERENCES users(id), phone TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE standard_booking_contacts (
 booking_id TEXT PRIMARY KEY REFERENCES bookings(id), passenger_phone TEXT NOT NULL, passenger_email TEXT,
 pickup_point TEXT NOT NULL, dropoff_point TEXT NOT NULL, vehicle_plate TEXT, vehicle_model TEXT NOT NULL, operator_name TEXT NOT NULL
);
ALTER TABLE standard_custom_bookings ADD COLUMN contact_phone TEXT NOT NULL DEFAULT '';
ALTER TABLE standard_custom_bookings ADD COLUMN contact_email TEXT;
ALTER TABLE standard_custom_bookings ADD COLUMN pickup_point TEXT NOT NULL DEFAULT '';
ALTER TABLE standard_custom_bookings ADD COLUMN dropoff_point TEXT NOT NULL DEFAULT '';
CREATE INDEX idx_bookings_customer_history ON bookings(customer_id,created_at DESC,id DESC);
CREATE INDEX idx_operations_history_cursor ON standard_operational_events(operator_id,at DESC,id DESC);
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0019_standard_journey');
