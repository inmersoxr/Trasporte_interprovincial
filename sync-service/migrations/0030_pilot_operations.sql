ALTER TABLE standard_recurring_schedules ADD COLUMN frequency TEXT NOT NULL DEFAULT 'weekly' CHECK(frequency IN('daily','weekly','monthly'));
ALTER TABLE standard_recurring_schedules ADD COLUMN monthly_day INTEGER CHECK(monthly_day BETWEEN 1 AND 31);
CREATE TABLE pilot_operators(operator_id TEXT PRIMARY KEY REFERENCES operators(id),branch_id TEXT NOT NULL REFERENCES premium_branches(id),enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN(0,1)),enabled_by TEXT NOT NULL REFERENCES users(id),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE pilot_vehicles(vehicle_id TEXT PRIMARY KEY REFERENCES vehicles(id),operator_id TEXT NOT NULL REFERENCES operators(id),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
ALTER TABLE premium_invites ADD COLUMN vehicle_id TEXT REFERENCES vehicles(id);
ALTER TABLE premium_invites ADD COLUMN label TEXT NOT NULL DEFAULT '';
ALTER TABLE premium_invites ADD COLUMN revoked_at INTEGER;
DROP TRIGGER standard_alpha_route_guard;
CREATE TRIGGER standard_alpha_route_guard BEFORE INSERT ON route_offers
WHEN NOT (EXISTS(SELECT 1 FROM pilot_operators z JOIN operators po ON po.id=z.operator_id WHERE z.operator_id=NEW.operator_id AND z.enabled=1 AND po.status='approved')) AND NEW.active=1 AND NOT EXISTS(SELECT 1 FROM operators o WHERE o.id=NEW.operator_id AND o.status='approved'
 AND (o.data_scope='qa' OR EXISTS(SELECT 1 FROM standard_operator_profiles p JOIN standard_documented_operators d ON d.operator_id=p.operator_id WHERE p.operator_id=o.id AND p.review_state='approved')))
BEGIN SELECT RAISE(ABORT,'operator_not_ready'); END;
DROP TRIGGER standard_alpha_booking_guard;
CREATE TRIGGER standard_alpha_booking_guard BEFORE INSERT ON bookings
WHEN NOT (EXISTS(SELECT 1 FROM route_offers r JOIN pilot_operators z ON z.operator_id=r.operator_id JOIN operators o ON o.id=r.operator_id WHERE r.id=NEW.offer_id AND z.enabled=1 AND r.active=1 AND o.status='approved')) AND NOT EXISTS(SELECT 1 FROM route_offers r JOIN operators o ON o.id=r.operator_id WHERE r.id=NEW.offer_id AND r.active=1 AND o.status='approved'
 AND (o.data_scope='qa' OR EXISTS(SELECT 1 FROM standard_operator_profiles p JOIN standard_documented_operators d ON d.operator_id=p.operator_id WHERE p.operator_id=o.id AND p.review_state='approved')))
BEGIN SELECT RAISE(ABORT,'operator_not_ready'); END;
DROP TRIGGER standard_alpha_departure_guard;
CREATE TRIGGER standard_alpha_departure_guard BEFORE INSERT ON departures
WHEN NOT (EXISTS(SELECT 1 FROM pilot_vehicles pv JOIN pilot_operators z ON z.operator_id=pv.operator_id JOIN vehicles v ON v.id=pv.vehicle_id JOIN operators o ON o.id=v.operator_id JOIN premium_assignments pa ON pa.vehicle_id=v.id JOIN memberships m ON m.operator_id=v.operator_id AND m.user_id=pa.driver_user_id AND m.role='driver' JOIN users u ON u.id=m.user_id WHERE pv.vehicle_id=NEW.vehicle_id AND z.enabled=1 AND v.status='active' AND o.status='approved' AND u.status='active' AND v.plate IS NOT NULL AND EXISTS(SELECT 1 FROM route_offers r WHERE r.id=NEW.offer_id AND r.operator_id=v.operator_id AND r.active=1))) AND NOT EXISTS(SELECT 1 FROM route_offers r JOIN operators o ON o.id=r.operator_id JOIN vehicles v ON v.id=NEW.vehicle_id
 WHERE r.id=NEW.offer_id AND r.active=1 AND o.status='approved' AND v.status='active' AND v.operator_id=o.id
 AND (o.data_scope='qa' OR EXISTS(SELECT 1 FROM standard_operator_profiles p JOIN standard_documented_operators d ON d.operator_id=p.operator_id WHERE p.operator_id=o.id AND p.review_state='approved')
 AND EXISTS(SELECT 1 FROM standard_documented_vehicles WHERE id=v.id)))
BEGIN SELECT RAISE(ABORT,'operator_not_ready'); END;
DROP TRIGGER standard_alpha_booking_vehicle_guard;
CREATE TRIGGER standard_alpha_booking_vehicle_guard BEFORE INSERT ON standard_booking_details
WHEN NOT (EXISTS(SELECT 1 FROM pilot_vehicles pv JOIN pilot_operators z ON z.operator_id=pv.operator_id JOIN vehicles v ON v.id=pv.vehicle_id JOIN operators o ON o.id=v.operator_id JOIN premium_assignments pa ON pa.vehicle_id=v.id JOIN memberships m ON m.operator_id=v.operator_id AND m.user_id=pa.driver_user_id AND m.role='driver' JOIN users u ON u.id=m.user_id WHERE pv.vehicle_id=NEW.vehicle_id AND z.enabled=1 AND v.status='active' AND o.status='approved' AND u.status='active' AND v.plate IS NOT NULL AND v.operator_id=NEW.operator_id)) AND NOT EXISTS(SELECT 1 FROM vehicles v JOIN operators o ON o.id=v.operator_id WHERE v.id=NEW.vehicle_id AND v.operator_id=NEW.operator_id AND v.status='active'
 AND (o.data_scope='qa' OR EXISTS(SELECT 1 FROM standard_documented_vehicles WHERE id=v.id)))
BEGIN SELECT RAISE(ABORT,'operator_not_ready'); END;
DROP TRIGGER standard_alpha_custom_guard;
CREATE TRIGGER standard_alpha_custom_guard BEFORE INSERT ON standard_custom_bookings
WHEN NOT (EXISTS(SELECT 1 FROM pilot_vehicles pv JOIN pilot_operators z ON z.operator_id=pv.operator_id JOIN vehicles v ON v.id=pv.vehicle_id JOIN operators o ON o.id=v.operator_id JOIN premium_assignments pa ON pa.vehicle_id=v.id JOIN memberships m ON m.operator_id=v.operator_id AND m.user_id=pa.driver_user_id AND m.role='driver' JOIN users u ON u.id=m.user_id WHERE pv.vehicle_id=NEW.vehicle_id AND z.enabled=1 AND v.status='active' AND o.status='approved' AND u.status='active' AND v.plate IS NOT NULL AND v.operator_id=NEW.operator_id)) AND NOT EXISTS(SELECT 1 FROM operators o JOIN vehicles v ON v.operator_id=o.id WHERE o.id=NEW.operator_id AND v.id=NEW.vehicle_id AND o.status='approved' AND v.status='active'
 AND (o.data_scope='qa' OR EXISTS(SELECT 1 FROM standard_operator_profiles p JOIN standard_documented_operators d ON d.operator_id=p.operator_id WHERE p.operator_id=o.id AND p.review_state='approved')
 AND EXISTS(SELECT 1 FROM standard_documented_vehicles WHERE id=v.id)))
BEGIN SELECT RAISE(ABORT,'operator_not_ready'); END;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0030_pilot_operations');
