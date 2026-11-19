CREATE TABLE standard_operator_profiles (
 operator_id TEXT PRIMARY KEY REFERENCES operators(id), kind TEXT NOT NULL CHECK(kind IN('individual','company')),
 responsible_name TEXT NOT NULL, phone TEXT NOT NULL, contact_email TEXT NOT NULL, base_city TEXT NOT NULL, address TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 1, review_state TEXT NOT NULL DEFAULT 'draft' CHECK(review_state IN('draft','submitted','approved','changes_requested','suspended')),
 review_note TEXT NOT NULL DEFAULT '', reviewed_by TEXT REFERENCES users(id), submitted_at TEXT, reviewed_at TEXT,
 last_request TEXT NOT NULL, fingerprint TEXT NOT NULL, last_nonce TEXT NOT NULL
);
CREATE TABLE standard_drivers (
 id TEXT PRIMARY KEY, operator_id TEXT NOT NULL REFERENCES operators(id), full_name TEXT NOT NULL, phone TEXT NOT NULL,
 identity_number TEXT NOT NULL, license_number TEXT NOT NULL, license_category TEXT NOT NULL, license_expires_on TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN('active','inactive')), revision INTEGER NOT NULL DEFAULT 1,
 last_request TEXT NOT NULL, fingerprint TEXT NOT NULL, last_nonce TEXT NOT NULL,
 UNIQUE(operator_id,license_number)
);
CREATE TABLE standard_vehicle_details (
 vehicle_id TEXT PRIMARY KEY REFERENCES vehicles(id), driver_id TEXT NOT NULL REFERENCES standard_drivers(id),
 brand TEXT NOT NULL, year INTEGER NOT NULL CHECK(year BETWEEN 1980 AND 2100), color TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1,
 last_request TEXT NOT NULL, fingerprint TEXT NOT NULL, last_nonce TEXT NOT NULL
);
CREATE UNIQUE INDEX idx_standard_vehicle_plate ON vehicles(plate) WHERE plate IS NOT NULL AND plate<>'';
CREATE TABLE standard_operator_documents (
 id TEXT PRIMARY KEY, operator_id TEXT NOT NULL REFERENCES operators(id), kind TEXT NOT NULL,
 subject_type TEXT NOT NULL CHECK(subject_type IN('operator','vehicle','driver')), subject_id TEXT NOT NULL,
 object_key TEXT NOT NULL UNIQUE, content_type TEXT NOT NULL, size INTEGER NOT NULL CHECK(size BETWEEN 1 AND 5242880),
 filename TEXT NOT NULL, content_hash TEXT NOT NULL, expires_on TEXT, uploaded_by TEXT NOT NULL REFERENCES users(id),
 request_id TEXT NOT NULL, fingerprint TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(operator_id,request_id)
);
CREATE INDEX idx_standard_documents_subject ON standard_operator_documents(operator_id,subject_type,subject_id,kind);
CREATE VIEW standard_documented_vehicles AS
 SELECT v.id,v.operator_id FROM vehicles v JOIN standard_vehicle_details x ON x.vehicle_id=v.id JOIN standard_drivers d ON d.id=x.driver_id
 WHERE v.plate IS NOT NULL AND v.plate<>'' AND d.operator_id=v.operator_id AND d.status='active'
 AND d.license_expires_on>=date('now','-5 hours')
 AND EXISTS(SELECT 1 FROM standard_operator_documents a WHERE a.operator_id=v.operator_id AND a.subject_type='driver' AND a.subject_id=d.id AND a.kind='license' AND a.expires_on>=date('now','-5 hours'))
 AND EXISTS(SELECT 1 FROM standard_operator_documents a WHERE a.operator_id=v.operator_id AND a.subject_type='vehicle' AND a.subject_id=v.id AND a.kind='registration' AND (a.expires_on IS NULL OR a.expires_on>=date('now','-5 hours')))
 AND EXISTS(SELECT 1 FROM standard_operator_documents a WHERE a.operator_id=v.operator_id AND a.subject_type='vehicle' AND a.subject_id=v.id AND a.kind='insurance' AND a.expires_on>=date('now','-5 hours'))
 AND EXISTS(SELECT 1 FROM standard_operator_documents a WHERE a.operator_id=v.operator_id AND a.subject_type='vehicle' AND a.subject_id=v.id AND a.kind='inspection' AND a.expires_on>=date('now','-5 hours'));
CREATE VIEW standard_documented_operators AS
 SELECT p.operator_id FROM standard_operator_profiles p
 WHERE EXISTS(SELECT 1 FROM standard_operator_documents a WHERE a.operator_id=p.operator_id AND a.subject_type='operator' AND a.subject_id=p.operator_id AND a.kind='identity' AND (a.expires_on IS NULL OR a.expires_on>=date('now','-5 hours')))
 AND EXISTS(SELECT 1 FROM standard_operator_documents a WHERE a.operator_id=p.operator_id AND a.subject_type='operator' AND a.subject_id=p.operator_id AND a.kind='authorization' AND (a.expires_on IS NULL OR a.expires_on>=date('now','-5 hours')))
 AND EXISTS(SELECT 1 FROM standard_documented_vehicles v WHERE v.operator_id=p.operator_id);
CREATE TRIGGER standard_review_complete BEFORE UPDATE OF review_state ON standard_operator_profiles
WHEN NEW.review_state='approved' AND NOT EXISTS(SELECT 1 FROM standard_documented_operators WHERE operator_id=NEW.operator_id)
BEGIN SELECT RAISE(ABORT,'onboarding_incomplete'); END;
CREATE TRIGGER standard_alpha_route_guard BEFORE INSERT ON route_offers
WHEN NEW.active=1 AND NOT EXISTS(SELECT 1 FROM operators o WHERE o.id=NEW.operator_id AND o.status='approved'
 AND (o.data_scope='qa' OR EXISTS(SELECT 1 FROM standard_operator_profiles p JOIN standard_documented_operators d ON d.operator_id=p.operator_id WHERE p.operator_id=o.id AND p.review_state='approved')))
BEGIN SELECT RAISE(ABORT,'operator_not_ready'); END;
CREATE TRIGGER standard_alpha_departure_guard BEFORE INSERT ON departures
WHEN NOT EXISTS(SELECT 1 FROM route_offers r JOIN operators o ON o.id=r.operator_id JOIN vehicles v ON v.id=NEW.vehicle_id
 WHERE r.id=NEW.offer_id AND r.active=1 AND o.status='approved' AND v.status='active' AND v.operator_id=o.id
 AND (o.data_scope='qa' OR EXISTS(SELECT 1 FROM standard_operator_profiles p JOIN standard_documented_operators d ON d.operator_id=p.operator_id WHERE p.operator_id=o.id AND p.review_state='approved')
 AND EXISTS(SELECT 1 FROM standard_documented_vehicles WHERE id=v.id)))
BEGIN SELECT RAISE(ABORT,'operator_not_ready'); END;
CREATE TRIGGER standard_alpha_booking_guard BEFORE INSERT ON bookings
WHEN NOT EXISTS(SELECT 1 FROM route_offers r JOIN operators o ON o.id=r.operator_id WHERE r.id=NEW.offer_id AND r.active=1 AND o.status='approved'
 AND (o.data_scope='qa' OR EXISTS(SELECT 1 FROM standard_operator_profiles p JOIN standard_documented_operators d ON d.operator_id=p.operator_id WHERE p.operator_id=o.id AND p.review_state='approved')))
BEGIN SELECT RAISE(ABORT,'operator_not_ready'); END;
CREATE TRIGGER standard_alpha_booking_vehicle_guard BEFORE INSERT ON standard_booking_details
WHEN NOT EXISTS(SELECT 1 FROM vehicles v JOIN operators o ON o.id=v.operator_id WHERE v.id=NEW.vehicle_id AND v.operator_id=NEW.operator_id AND v.status='active'
 AND (o.data_scope='qa' OR EXISTS(SELECT 1 FROM standard_documented_vehicles WHERE id=v.id)))
BEGIN SELECT RAISE(ABORT,'operator_not_ready'); END;
CREATE TRIGGER standard_alpha_custom_guard BEFORE INSERT ON standard_custom_bookings
WHEN NOT EXISTS(SELECT 1 FROM operators o JOIN vehicles v ON v.operator_id=o.id WHERE o.id=NEW.operator_id AND v.id=NEW.vehicle_id AND o.status='approved' AND v.status='active'
 AND (o.data_scope='qa' OR EXISTS(SELECT 1 FROM standard_operator_profiles p JOIN standard_documented_operators d ON d.operator_id=p.operator_id WHERE p.operator_id=o.id AND p.review_state='approved')
 AND EXISTS(SELECT 1 FROM standard_documented_vehicles WHERE id=v.id)))
BEGIN SELECT RAISE(ABORT,'operator_not_ready'); END;
CREATE TRIGGER standard_vehicle_capacity_reserved BEFORE UPDATE OF capacity ON vehicles
WHEN NEW.capacity<OLD.capacity AND EXISTS(SELECT 1 FROM seat_claims s JOIN departures d ON d.id=s.departure_id
 WHERE d.vehicle_id=OLD.id AND d.status IN('published','boarding','running') AND s.status IN('held','confirmed') AND s.seat_number>NEW.capacity)
BEGIN SELECT RAISE(ABORT,'capacity_reserved'); END;
CREATE TRIGGER standard_vehicle_identity_locked BEFORE UPDATE OF plate ON vehicles
WHEN OLD.plate IS NOT NULL AND OLD.plate<>'' AND NEW.plate<>OLD.plate AND EXISTS(SELECT 1 FROM standard_booking_details x JOIN bookings b ON b.id=x.booking_id
 WHERE x.vehicle_id=OLD.id AND b.status='confirmed' AND b.service_at>strftime('%Y-%m-%dT%H:%M:%fZ','now'))
BEGIN SELECT RAISE(ABORT,'vehicle_identity_locked'); END;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0018_standard_onboarding');
