CREATE TABLE IF NOT EXISTS standard_private_specs (
 request_id TEXT PRIMARY KEY REFERENCES private_requests(id), people INTEGER NOT NULL CHECK(people BETWEEN 1 AND 30),
 vehicle_type TEXT NOT NULL, duration_minutes INTEGER NOT NULL CHECK(duration_minutes BETWEEN 1 AND 2880), expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS standard_private_offers (
 id TEXT PRIMARY KEY,request_id TEXT NOT NULL REFERENCES private_requests(id),operator_id TEXT NOT NULL REFERENCES operators(id),
 vehicle_id TEXT NOT NULL REFERENCES vehicles(id),price_cents INTEGER NOT NULL CHECK(price_cents>0),duration_minutes INTEGER NOT NULL,
 status TEXT NOT NULL DEFAULT 'available' CHECK(status IN('available','withdrawn','selected','expired')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(request_id,operator_id,vehicle_id)
);
CREATE TRIGGER IF NOT EXISTS standard_private_request_limit BEFORE INSERT ON standard_private_specs
WHEN (SELECT COUNT(*) FROM private_requests r JOIN standard_private_specs s ON s.request_id=r.id
 WHERE r.customer_id=(SELECT customer_id FROM private_requests WHERE id=NEW.request_id)
 AND r.status IN('requested','receiving_offers') AND unixepoch(s.expires_at)>unixepoch('now'))>=10
BEGIN SELECT RAISE(ABORT,'request_limit'); END;
CREATE TABLE IF NOT EXISTS standard_custom_bookings (
 id TEXT PRIMARY KEY,request_id TEXT NOT NULL UNIQUE REFERENCES private_requests(id),offer_id TEXT NOT NULL UNIQUE REFERENCES standard_private_offers(id),
 customer_id TEXT NOT NULL REFERENCES users(id),operator_id TEXT NOT NULL REFERENCES operators(id),vehicle_id TEXT NOT NULL REFERENCES vehicles(id),
 service_at TEXT NOT NULL,duration_minutes INTEGER NOT NULL,amount_cents INTEGER NOT NULL,passengers_json TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'confirmed' CHECK(status IN('confirmed','running','completed','cancelled')),boarded_at INTEGER,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE standard_vehicle_slots ADD COLUMN custom_booking_id TEXT REFERENCES standard_custom_bookings(id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_standard_custom_slot ON standard_vehicle_slots(custom_booking_id);
CREATE TABLE IF NOT EXISTS standard_custom_events (
 id TEXT PRIMARY KEY,booking_id TEXT NOT NULL REFERENCES standard_custom_bookings(id),kind TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(booking_id,kind)
);
CREATE TRIGGER IF NOT EXISTS standard_offer_request_live BEFORE INSERT ON standard_private_offers
WHEN NOT EXISTS(SELECT 1 FROM private_requests r JOIN standard_private_specs s ON s.request_id=r.id
 WHERE r.id=NEW.request_id AND r.status IN('requested','receiving_offers') AND unixepoch(s.expires_at)>unixepoch('now'))
BEGIN SELECT RAISE(ABORT,'offer_unavailable'); END;
CREATE TRIGGER IF NOT EXISTS standard_custom_selection BEFORE INSERT ON standard_custom_bookings
WHEN NOT EXISTS(SELECT 1 FROM private_requests r JOIN standard_private_specs s ON s.request_id=r.id
 JOIN standard_private_offers o ON o.request_id=r.id JOIN vehicles v ON v.id=o.vehicle_id JOIN operators op ON op.id=o.operator_id
 WHERE r.id=NEW.request_id AND r.customer_id=NEW.customer_id AND r.status IN('requested','receiving_offers')
 AND unixepoch(s.expires_at)>unixepoch('now') AND unixepoch(r.requested_at)>unixepoch('now')
 AND o.id=NEW.offer_id AND o.status='available' AND o.operator_id=NEW.operator_id AND o.vehicle_id=NEW.vehicle_id
 AND o.price_cents=NEW.amount_cents AND o.duration_minutes=NEW.duration_minutes AND r.requested_at=NEW.service_at
 AND v.operator_id=o.operator_id AND v.status='active' AND v.capacity>=s.people AND op.status='approved'
 AND (s.vehicle_type='any' OR s.vehicle_type=v.type) AND o.duration_minutes>=s.duration_minutes
 AND EXISTS(SELECT 1 FROM route_offers ro WHERE ro.operator_id=o.operator_id AND ro.origin=r.origin AND ro.active=1))
BEGIN SELECT RAISE(ABORT,'offer_unavailable'); END;
CREATE TRIGGER IF NOT EXISTS standard_custom_cancel_not_boarded BEFORE UPDATE OF status ON standard_custom_bookings
WHEN NEW.status='cancelled' AND (OLD.boarded_at IS NOT NULL OR OLD.status IN('running','completed'))
BEGIN SELECT RAISE(ABORT,'already_boarded'); END;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0005_competitive_private');
