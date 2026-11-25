ALTER TABLE departures ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;
ALTER TABLE departures ADD COLUMN last_change TEXT;
ALTER TABLE route_offers ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;
ALTER TABLE route_offers ADD COLUMN last_change TEXT;
ALTER TABLE bookings ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;
ALTER TABLE bookings ADD COLUMN last_change TEXT;
ALTER TABLE standard_passengers ADD COLUMN cancelled_at INTEGER;
ALTER TABLE standard_recurring_schedules ADD COLUMN auto_renew INTEGER NOT NULL DEFAULT 0 CHECK(auto_renew IN(0,1));
ALTER TABLE standard_recurring_schedules ADD COLUMN renewal_error TEXT NOT NULL DEFAULT '';
ALTER TABLE standard_custom_bookings ADD COLUMN revision INTEGER NOT NULL DEFAULT 1;
ALTER TABLE standard_custom_bookings ADD COLUMN last_change TEXT;
CREATE TABLE standard_service_changes(id TEXT PRIMARY KEY,actor_user_id TEXT NOT NULL REFERENCES users(id),operator_id TEXT NOT NULL REFERENCES operators(id),entity_id TEXT NOT NULL,kind TEXT NOT NULL,reason TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TRIGGER standard_change_guard BEFORE INSERT ON standard_service_changes
WHEN (NEW.kind='departure' AND NOT EXISTS(SELECT 1 FROM departures WHERE id=NEW.entity_id AND last_change=NEW.id))
 OR (NEW.kind='route' AND NOT EXISTS(SELECT 1 FROM route_offers WHERE id=NEW.entity_id AND last_change=NEW.id))
 OR (NEW.kind IN('seats','partial_cancel','private_fixed') AND NOT EXISTS(SELECT 1 FROM bookings WHERE id=NEW.entity_id AND last_change=NEW.id))
 OR (NEW.kind='private_custom' AND NOT EXISTS(SELECT 1 FROM standard_custom_bookings WHERE id=NEW.entity_id AND last_change=NEW.id))
BEGIN SELECT RAISE(ABORT,'change_conflict'); END;
CREATE TRIGGER standard_slots_update_collision BEFORE UPDATE ON standard_vehicle_slots
WHEN NEW.active=1 AND EXISTS(SELECT 1 FROM standard_vehicle_slots s WHERE s.id<>NEW.id AND s.vehicle_id=NEW.vehicle_id AND s.active=1 AND s.starts_at<NEW.ends_at AND s.ends_at>NEW.starts_at)
BEGIN SELECT RAISE(ABORT,'vehicle_conflict'); END;
CREATE TRIGGER standard_departure_change_guard BEFORE UPDATE OF vehicle_id,depart_at ON departures
WHEN OLD.status<>'published' OR EXISTS(SELECT 1 FROM standard_passengers p JOIN bookings b ON b.id=p.booking_id WHERE b.departure_id=OLD.id AND p.boarded_at IS NOT NULL)
 OR EXISTS(SELECT 1 FROM seat_claims sc JOIN vehicles v ON v.id=NEW.vehicle_id WHERE sc.departure_id=OLD.id AND sc.status IN('held','confirmed') AND sc.seat_number>v.capacity)
 OR NOT EXISTS(SELECT 1 FROM vehicles v JOIN operators o ON o.id=v.operator_id JOIN route_offers r ON r.id=OLD.offer_id WHERE v.id=NEW.vehicle_id AND v.status='active' AND o.id=r.operator_id AND o.status='approved' AND (o.data_scope='qa' OR EXISTS(SELECT 1 FROM standard_documented_vehicles WHERE id=v.id)))
BEGIN SELECT RAISE(ABORT,'service_change_not_allowed'); END;
CREATE TRIGGER standard_cancel_seat_guard BEFORE UPDATE OF cancelled_at ON standard_passengers
WHEN NEW.cancelled_at IS NOT NULL AND OLD.boarded_at IS NOT NULL BEGIN SELECT RAISE(ABORT,'already_boarded'); END;
CREATE TRIGGER standard_board_active_seat BEFORE UPDATE OF boarded_at ON standard_passengers
WHEN NEW.boarded_at IS NOT NULL AND OLD.cancelled_at IS NOT NULL BEGIN SELECT RAISE(ABORT,'seat_cancelled'); END;
CREATE TRIGGER standard_seat_change_valid BEFORE UPDATE OF seat_number ON seat_claims
WHEN NEW.status IN('held','confirmed') AND NOT EXISTS(SELECT 1 FROM departures d JOIN vehicles v ON v.id=d.vehicle_id WHERE d.id=NEW.departure_id AND d.status='published' AND unixepoch(d.depart_at)>unixepoch('now') AND NEW.seat_number BETWEEN 1 AND v.capacity)
BEGIN SELECT RAISE(ABORT,'seat_unavailable'); END;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0024_service_changes');
CREATE TABLE standard_background_jobs (job TEXT PRIMARY KEY,last_started TEXT,last_success TEXT,failures INTEGER NOT NULL DEFAULT 0,last_error TEXT NOT NULL DEFAULT '');
CREATE TRIGGER standard_custom_booking_notice AFTER INSERT ON standard_custom_bookings
BEGIN
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target) VALUES(NEW.id||':buyer',NEW.customer_id,NEW.operator_id,'custom_booking','Servicio reservado','Tu reserva de prueba está confirmada.','/standard/?private=1');
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target)
 SELECT NEW.id||':'||m.user_id,m.user_id,NEW.operator_id,'custom_booking','Tu cotización fue elegida','Consulta el servicio y prepara la recogida.','/standard/?manage=1&panel=reservations&operator='||NEW.operator_id FROM memberships m WHERE m.operator_id=NEW.operator_id AND m.role IN('owner','admin','dispatcher');
END;
CREATE TRIGGER standard_cancel_operator_notice AFTER UPDATE OF status ON bookings WHEN NEW.status='cancelled' AND OLD.status<>'cancelled'
BEGIN
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target)
 SELECT NEW.id||':cancel:'||m.user_id,m.user_id,x.operator_id,'cancel','Se canceló una reserva','La disponibilidad se actualizó en el servidor.','/standard/?manage=1&panel=reservations&operator='||x.operator_id FROM standard_booking_details x JOIN memberships m ON m.operator_id=x.operator_id AND m.role IN('owner','admin','dispatcher') WHERE x.booking_id=NEW.id;
END;
CREATE TRIGGER standard_custom_cancel_notice AFTER UPDATE OF status ON standard_custom_bookings WHEN NEW.status='cancelled' AND OLD.status<>'cancelled'
BEGIN
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target) VALUES(NEW.id||':cancel:buyer',NEW.customer_id,NEW.operator_id,'cancel','Servicio cancelado','Consulta el estado y el reembolso simulado.','/standard/?private=1');
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target) SELECT NEW.id||':cancel:'||m.user_id,m.user_id,NEW.operator_id,'cancel','Servicio cancelado','El calendario del vehículo se actualizó.','/standard/?manage=1&panel=reservations&operator='||NEW.operator_id FROM memberships m WHERE m.operator_id=NEW.operator_id AND m.role IN('owner','admin','dispatcher');
END;
CREATE TRIGGER standard_change_operator_notice AFTER INSERT ON standard_service_changes
BEGIN
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target) SELECT NEW.id||':operator:'||m.user_id,m.user_id,NEW.operator_id,'change','Cambio de viaje o boleto',NEW.reason,'/standard/?manage=1&panel=reservations&operator='||NEW.operator_id FROM memberships m WHERE m.operator_id=NEW.operator_id AND m.role IN('owner','admin','dispatcher') AND m.user_id<>NEW.actor_user_id;
END;
