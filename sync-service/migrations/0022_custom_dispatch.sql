CREATE TABLE standard_custom_enrollments (
 operator_id TEXT PRIMARY KEY REFERENCES operators(id),enabled INTEGER NOT NULL CHECK(enabled IN(0,1)),available INTEGER NOT NULL CHECK(available IN(0,1)),
 origins_json TEXT NOT NULL CHECK(json_valid(origins_json)),vehicles_json TEXT NOT NULL CHECK(json_valid(vehicles_json)),revision INTEGER NOT NULL DEFAULT 1,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,last_request TEXT NOT NULL
);
ALTER TABLE standard_private_specs ADD COLUMN immediate INTEGER NOT NULL DEFAULT 0 CHECK(immediate IN(0,1));
ALTER TABLE standard_private_offers ADD COLUMN pickup_at TEXT;
CREATE TABLE standard_notifications (
 id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),operator_id TEXT REFERENCES operators(id),kind TEXT NOT NULL,
 title TEXT NOT NULL,body TEXT NOT NULL,target TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,read_at TEXT,push_sent_at TEXT,
 attempts INTEGER NOT NULL DEFAULT 0,next_attempt INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX standard_notifications_user ON standard_notifications(user_id,created_at,id);
CREATE TABLE standard_push_subscriptions (
 endpoint TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Selected price, vehicle and pickup are checked again in the same transaction.
DROP TRIGGER standard_custom_selection;
CREATE TRIGGER standard_custom_selection BEFORE INSERT ON standard_custom_bookings
WHEN NOT EXISTS(SELECT 1 FROM private_requests r JOIN standard_private_specs s ON s.request_id=r.id
 JOIN standard_private_offers f ON f.request_id=r.id JOIN vehicles v ON v.id=f.vehicle_id JOIN operators o ON o.id=f.operator_id
 WHERE r.id=NEW.request_id AND r.customer_id=NEW.customer_id AND r.status IN('requested','receiving_offers')
 AND unixepoch(s.expires_at)>unixepoch('now') AND unixepoch(COALESCE(f.pickup_at,r.requested_at))>unixepoch('now')
 AND f.id=NEW.offer_id AND f.status='available' AND f.operator_id=NEW.operator_id AND f.vehicle_id=NEW.vehicle_id
 AND f.price_cents=NEW.amount_cents AND f.duration_minutes=NEW.duration_minutes AND COALESCE(f.pickup_at,r.requested_at)=NEW.service_at
 AND v.operator_id=o.id AND v.status='active' AND v.capacity>=s.people AND o.status='approved'
 AND (s.vehicle_type='any' OR s.vehicle_type=v.type) AND f.duration_minutes>=s.duration_minutes
 AND ((o.data_scope='qa' AND EXISTS(SELECT 1 FROM route_offers ro WHERE ro.operator_id=o.id AND ro.origin=r.origin AND ro.active=1))
 OR EXISTS(SELECT 1 FROM standard_custom_enrollments e WHERE e.operator_id=o.id AND e.enabled=1 AND e.available=1
 AND EXISTS(SELECT 1 FROM json_each(e.origins_json) WHERE value=r.origin) AND EXISTS(SELECT 1 FROM json_each(e.vehicles_json) WHERE value=v.id))))
BEGIN SELECT RAISE(ABORT,'offer_unavailable'); END;
CREATE TRIGGER standard_custom_request_notice AFTER INSERT ON standard_private_specs
BEGIN
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target)
 SELECT NEW.request_id||':'||m.user_id||':'||o.id,m.user_id,o.id,'custom_request','Nueva solicitud de transporte',r.origin||' → '||r.destination||' · '||NEW.people||' pasajeros','/standard/?manage=1&panel=reservations&section=requests&operator='||o.id
 FROM private_requests r JOIN standard_custom_enrollments e ON e.enabled=1 AND e.available=1
 JOIN operators o ON o.id=e.operator_id AND o.status='approved' AND o.data_scope='alpha'
 JOIN memberships m ON m.operator_id=o.id AND m.role IN('owner','admin','dispatcher')
 WHERE r.id=NEW.request_id AND EXISTS(SELECT 1 FROM json_each(e.origins_json) WHERE value=r.origin)
 AND EXISTS(SELECT 1 FROM standard_documented_operators WHERE operator_id=o.id)
 AND EXISTS(SELECT 1 FROM standard_operator_profiles WHERE operator_id=o.id AND review_state='approved')
 AND EXISTS(SELECT 1 FROM vehicles v JOIN standard_documented_vehicles d ON d.id=v.id WHERE v.operator_id=o.id AND v.status='active'
 AND v.capacity>=NEW.people AND (NEW.vehicle_type='any' OR v.type=NEW.vehicle_type) AND v.id IN(SELECT value FROM json_each(e.vehicles_json))
 AND EXISTS(SELECT 1 FROM (SELECT CASE WHEN NEW.immediate=1 THEN unixepoch('now')*1000+300000 ELSE unixepoch(r.requested_at)*1000 END AS candidate_at UNION SELECT q.ends_at FROM standard_vehicle_slots q WHERE q.vehicle_id=v.id AND q.active=1) gap WHERE gap.candidate_at>=CASE WHEN NEW.immediate=1 THEN unixepoch('now')*1000+300000 ELSE unixepoch(r.requested_at)*1000 END AND gap.candidate_at<=unixepoch(r.requested_at)*1000 AND NOT EXISTS(SELECT 1 FROM standard_vehicle_slots x WHERE x.vehicle_id=v.id AND x.active=1 AND x.starts_at<gap.candidate_at+NEW.duration_minutes*60000 AND x.ends_at>gap.candidate_at)));
END;
CREATE TRIGGER standard_custom_offer_notice AFTER INSERT ON standard_private_offers
BEGIN
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target)
 SELECT NEW.id||':quote',r.customer_id,NEW.operator_id,'custom_offer','Recibiste una cotización',o.display_name||' · USD '||printf('%.2f',NEW.price_cents/100.0),'/standard/?private=1'
 FROM private_requests r JOIN operators o ON o.id=NEW.operator_id WHERE r.id=NEW.request_id;
END;
CREATE TRIGGER standard_booking_notice AFTER INSERT ON standard_booking_details
BEGIN
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target)
 SELECT NEW.booking_id||':buyer',b.customer_id,NEW.operator_id,'booking','Reserva confirmada','Tu boleto de prueba ya está disponible.','/standard/?ticket='||b.id FROM bookings b WHERE b.id=NEW.booking_id;
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target)
 SELECT NEW.booking_id||':'||m.user_id,m.user_id,NEW.operator_id,'booking','Nueva reserva','Consulta los pasajeros y prepara el embarque.','/standard/?manage=1&panel=reservations&operator='||NEW.operator_id FROM memberships m WHERE m.operator_id=NEW.operator_id AND m.role IN('owner','admin','dispatcher');
END;
CREATE TRIGGER standard_cancellation_notice AFTER UPDATE OF status ON bookings WHEN NEW.status='cancelled' AND OLD.status<>'cancelled'
BEGIN
 INSERT OR IGNORE INTO standard_notifications(id,user_id,kind,title,body,target) VALUES(NEW.id||':cancel',NEW.customer_id,'cancel','Reserva cancelada','Consulta el estado y el reembolso de prueba en tu cuenta.','/standard/?ticket='||NEW.id);
END;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0022_custom_dispatch');
