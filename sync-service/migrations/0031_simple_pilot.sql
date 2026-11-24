DROP TRIGGER standard_alpha_departure_guard;
CREATE TRIGGER standard_alpha_departure_guard BEFORE INSERT ON departures
WHEN NOT (EXISTS(SELECT 1 FROM pilot_vehicles pv JOIN pilot_operators z ON z.operator_id=pv.operator_id JOIN vehicles v ON v.id=pv.vehicle_id JOIN operators o ON o.id=v.operator_id WHERE pv.vehicle_id=NEW.vehicle_id AND z.enabled=1 AND v.status='active' AND o.status='approved' AND EXISTS(SELECT 1 FROM route_offers r WHERE r.id=NEW.offer_id AND r.operator_id=v.operator_id AND r.active=1))) AND NOT EXISTS(SELECT 1 FROM route_offers r JOIN operators o ON o.id=r.operator_id JOIN vehicles v ON v.id=NEW.vehicle_id
 WHERE r.id=NEW.offer_id AND r.active=1 AND o.status='approved' AND v.status='active' AND v.operator_id=o.id
 AND (o.data_scope='qa' OR EXISTS(SELECT 1 FROM standard_operator_profiles p JOIN standard_documented_operators d ON d.operator_id=p.operator_id WHERE p.operator_id=o.id AND p.review_state='approved')
 AND EXISTS(SELECT 1 FROM standard_documented_vehicles WHERE id=v.id)))
BEGIN SELECT RAISE(ABORT,'operator_not_ready'); END;
DROP TRIGGER standard_alpha_booking_vehicle_guard;
CREATE TRIGGER standard_alpha_booking_vehicle_guard BEFORE INSERT ON standard_booking_details
WHEN NOT (EXISTS(SELECT 1 FROM pilot_vehicles pv JOIN pilot_operators z ON z.operator_id=pv.operator_id JOIN vehicles v ON v.id=pv.vehicle_id JOIN operators o ON o.id=v.operator_id WHERE pv.vehicle_id=NEW.vehicle_id AND z.enabled=1 AND v.status='active' AND o.status='approved' AND v.operator_id=NEW.operator_id)) AND NOT EXISTS(SELECT 1 FROM vehicles v JOIN operators o ON o.id=v.operator_id WHERE v.id=NEW.vehicle_id AND v.operator_id=NEW.operator_id AND v.status='active'
 AND (o.data_scope='qa' OR EXISTS(SELECT 1 FROM standard_documented_vehicles WHERE id=v.id)))
BEGIN SELECT RAISE(ABORT,'operator_not_ready'); END;
DROP TRIGGER standard_alpha_custom_guard;
CREATE TRIGGER standard_alpha_custom_guard BEFORE INSERT ON standard_custom_bookings
WHEN NOT (EXISTS(SELECT 1 FROM pilot_vehicles pv JOIN pilot_operators z ON z.operator_id=pv.operator_id JOIN vehicles v ON v.id=pv.vehicle_id JOIN operators o ON o.id=v.operator_id WHERE pv.vehicle_id=NEW.vehicle_id AND z.enabled=1 AND v.status='active' AND o.status='approved' AND v.operator_id=NEW.operator_id)) AND NOT EXISTS(SELECT 1 FROM operators o JOIN vehicles v ON v.operator_id=o.id WHERE o.id=NEW.operator_id AND v.id=NEW.vehicle_id AND o.status='approved' AND v.status='active'
 AND (o.data_scope='qa' OR EXISTS(SELECT 1 FROM standard_operator_profiles p JOIN standard_documented_operators d ON d.operator_id=p.operator_id WHERE p.operator_id=o.id AND p.review_state='approved')
 AND EXISTS(SELECT 1 FROM standard_documented_vehicles WHERE id=v.id)))
BEGIN SELECT RAISE(ABORT,'operator_not_ready'); END;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0031_simple_pilot');
