CREATE TABLE organization_invitation_context(invite_id TEXT PRIMARY KEY REFERENCES premium_invites(id),created_by TEXT NOT NULL REFERENCES users(id),contact_phone TEXT NOT NULL DEFAULT '',driver_id TEXT REFERENCES standard_drivers(id),branch_id TEXT REFERENCES premium_branches(id),previous_driver_id TEXT REFERENCES standard_drivers(id));
CREATE TABLE organization_invitation_roles(invite_id TEXT NOT NULL REFERENCES organization_invitation_context(invite_id),role TEXT NOT NULL REFERENCES organization_role_definitions(role),PRIMARY KEY(invite_id,role));
CREATE TABLE organization_invitation_vehicles(invite_id TEXT NOT NULL REFERENCES organization_invitation_context(invite_id),vehicle_id TEXT NOT NULL REFERENCES vehicles(id),PRIMARY KEY(invite_id,vehicle_id));
CREATE TABLE organization_team_assertions(actor_id TEXT NOT NULL REFERENCES users(id),request_id TEXT NOT NULL,operator_id TEXT NOT NULL REFERENCES operators(id),target_id TEXT REFERENCES users(id),expected_revision INTEGER,operation TEXT NOT NULL CHECK(operation IN('invite','member','revoke')),PRIMARY KEY(actor_id,request_id));
CREATE TRIGGER organization_team_write_permission BEFORE INSERT ON organization_team_assertions WHEN NOT EXISTS(SELECT 1 FROM organization_capabilities c WHERE c.user_id=NEW.actor_id AND c.operator_id=NEW.operator_id AND c.capability IN('*','team.manage')) BEGIN SELECT RAISE(ABORT,'organization_team_access'); END;
CREATE TRIGGER organization_member_edit_revision BEFORE INSERT ON organization_team_assertions WHEN NEW.operation IN('member','revoke') AND (NOT EXISTS(SELECT 1 FROM memberships m WHERE m.user_id=NEW.target_id AND m.operator_id=NEW.operator_id) OR COALESCE((SELECT revision FROM organization_membership_settings WHERE user_id=NEW.target_id AND operator_id=NEW.operator_id),0)<>NEW.expected_revision) BEGIN SELECT RAISE(ABORT,'organization_member_revision'); END;
CREATE TRIGGER organization_owner_protected BEFORE INSERT ON organization_team_assertions WHEN NEW.operation='revoke' AND EXISTS(SELECT 1 FROM memberships WHERE user_id=NEW.target_id AND operator_id=NEW.operator_id AND role='owner') BEGIN SELECT RAISE(ABORT,'organization_member_owner'); END;
CREATE TABLE organization_invite_claims(invite_id TEXT PRIMARY KEY REFERENCES organization_invitation_context(invite_id),user_id TEXT NOT NULL REFERENCES users(id),claimed_at INTEGER NOT NULL);
CREATE TRIGGER organization_invite_claim_valid BEFORE INSERT ON organization_invite_claims WHEN NOT EXISTS(SELECT 1 FROM premium_invites i JOIN organization_invitation_context x ON x.invite_id=i.id JOIN users u ON u.id=NEW.user_id AND u.status='active' WHERE i.id=NEW.invite_id AND i.used_by IS NULL AND i.revoked_at IS NULL AND i.expires_at>NEW.claimed_at AND EXISTS(SELECT 1 FROM organization_capabilities c WHERE c.operator_id=i.operator_id AND c.user_id=x.created_by AND c.capability IN('*','team.manage')) AND (x.driver_id IS NULL OR EXISTS(SELECT 1 FROM standard_drivers dr WHERE dr.id=x.driver_id AND dr.operator_id=i.operator_id AND (dr.user_id IS NULL OR dr.user_id=NEW.user_id))) AND (x.driver_id IS NULL OR NOT EXISTS(SELECT 1 FROM standard_drivers dr WHERE dr.operator_id=i.operator_id AND dr.user_id=NEW.user_id AND dr.id<>x.driver_id)) AND (i.vehicle_id IS NULL OR x.driver_id IS NULL OR EXISTS(SELECT 1 FROM vehicles v WHERE v.id=i.vehicle_id AND (v.default_driver_id IS x.previous_driver_id OR v.default_driver_id=x.driver_id))) AND (i.vehicle_id IS NULL OR NOT EXISTS(SELECT 1 FROM premium_assignments a WHERE a.vehicle_id=i.vehicle_id AND a.driver_user_id IS NOT NULL AND a.driver_user_id<>NEW.user_id))) BEGIN SELECT RAISE(ABORT,'organization_invite_claim'); END;
CREATE TRIGGER organization_invitation_vehicle_scope BEFORE INSERT ON organization_invitation_vehicles WHEN NOT EXISTS(SELECT 1 FROM premium_invites i JOIN vehicles v ON v.operator_id=i.operator_id WHERE i.id=NEW.invite_id AND v.id=NEW.vehicle_id) BEGIN SELECT RAISE(ABORT,'organization_resource_scope'); END;
CREATE TRIGGER organization_invitation_context_scope BEFORE INSERT ON organization_invitation_context WHEN NOT EXISTS(SELECT 1 FROM premium_invites i WHERE i.id=NEW.invite_id AND (NEW.driver_id IS NULL OR EXISTS(SELECT 1 FROM standard_drivers d WHERE d.id=NEW.driver_id AND d.operator_id=i.operator_id)) AND (NEW.branch_id IS NULL OR EXISTS(SELECT 1 FROM premium_branches b WHERE b.id=NEW.branch_id AND b.operator_id=i.operator_id))) BEGIN SELECT RAISE(ABORT,'organization_resource_scope'); END;
CREATE TABLE organization_capability_assertions(id TEXT PRIMARY KEY,actor_id TEXT NOT NULL REFERENCES users(id),operator_id TEXT NOT NULL REFERENCES operators(id),capability TEXT NOT NULL);
CREATE TRIGGER organization_capability_at_commit BEFORE INSERT ON organization_capability_assertions WHEN NOT EXISTS(SELECT 1 FROM organization_capabilities WHERE user_id=NEW.actor_id AND operator_id=NEW.operator_id AND capability IN('*',NEW.capability)) BEGIN SELECT RAISE(ABORT,'organization_permission_changed'); END;
CREATE TABLE organization_service_assertions(id TEXT PRIMARY KEY,actor_id TEXT NOT NULL REFERENCES users(id),operator_id TEXT NOT NULL REFERENCES operators(id),vehicle_id TEXT NOT NULL REFERENCES vehicles(id),departure_id TEXT REFERENCES departures(id));
CREATE TRIGGER organization_service_at_commit BEFORE INSERT ON organization_service_assertions WHEN NOT (NEW.departure_id IS NOT NULL AND EXISTS(SELECT 1 FROM organization_departure_operation WHERE user_id=NEW.actor_id AND operator_id=NEW.operator_id AND departure_id=NEW.departure_id) OR NEW.departure_id IS NULL AND EXISTS(SELECT 1 FROM organization_vehicle_operation WHERE user_id=NEW.actor_id AND operator_id=NEW.operator_id AND vehicle_id=NEW.vehicle_id)) BEGIN SELECT RAISE(ABORT,'organization_permission_changed'); END;

DROP TRIGGER standard_custom_request_notice;
CREATE TRIGGER standard_custom_request_notice AFTER INSERT ON standard_private_specs
BEGIN
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target)
 SELECT NEW.request_id||':'||m.user_id||':'||o.id,m.user_id,o.id,'custom_request','Nueva solicitud de transporte',r.origin||' → '||r.destination||' · '||NEW.people||' pasajeros','/standard/?manage=1&panel=reservations&section=requests&operator='||o.id
 FROM private_requests r JOIN standard_custom_enrollments e ON e.enabled=1 AND e.available=1
 JOIN operators o ON o.id=e.operator_id AND o.status='approved' AND o.data_scope='alpha'
 JOIN memberships m ON m.operator_id=o.id AND EXISTS(SELECT 1 FROM organization_capabilities cap WHERE cap.user_id=m.user_id AND cap.operator_id=m.operator_id AND cap.capability IN('*','trips.write'))
 WHERE r.id=NEW.request_id AND EXISTS(SELECT 1 FROM json_each(e.origins_json) WHERE value=r.origin)
 AND EXISTS(SELECT 1 FROM standard_documented_operators WHERE operator_id=o.id)
 AND EXISTS(SELECT 1 FROM standard_operator_profiles WHERE operator_id=o.id AND review_state='approved')
 AND EXISTS(SELECT 1 FROM vehicles v JOIN standard_documented_vehicles d ON d.id=v.id WHERE v.operator_id=o.id AND v.status='active'
 AND v.capacity>=NEW.people AND (NEW.vehicle_type='any' OR v.type=NEW.vehicle_type) AND v.id IN(SELECT value FROM json_each(e.vehicles_json))
 AND EXISTS(SELECT 1 FROM (SELECT CASE WHEN NEW.immediate=1 THEN unixepoch('now')*1000+300000 ELSE unixepoch(r.requested_at)*1000 END AS candidate_at UNION SELECT q.ends_at FROM standard_vehicle_slots q WHERE q.vehicle_id=v.id AND q.active=1) gap WHERE gap.candidate_at>=CASE WHEN NEW.immediate=1 THEN unixepoch('now')*1000+300000 ELSE unixepoch(r.requested_at)*1000 END AND gap.candidate_at<=unixepoch(r.requested_at)*1000 AND NOT EXISTS(SELECT 1 FROM standard_vehicle_slots x WHERE x.vehicle_id=v.id AND x.active=1 AND x.starts_at<gap.candidate_at+NEW.duration_minutes*60000 AND x.ends_at>gap.candidate_at)));
END;

DROP TRIGGER standard_booking_notice;
CREATE TRIGGER standard_booking_notice AFTER INSERT ON standard_booking_details
BEGIN
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target)
 SELECT NEW.booking_id||':buyer',b.customer_id,NEW.operator_id,'booking','Reserva confirmada','Tu boleto de prueba ya está disponible.','/standard/?ticket='||b.id FROM bookings b WHERE b.id=NEW.booking_id;
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target)
 SELECT NEW.booking_id||':'||m.user_id,m.user_id,NEW.operator_id,'booking','Nueva reserva','Consulta los pasajeros y prepara el embarque.','/standard/?manage=1&panel=reservations&operator='||NEW.operator_id FROM memberships m WHERE m.operator_id=NEW.operator_id AND EXISTS(SELECT 1 FROM organization_capabilities cap WHERE cap.user_id=m.user_id AND cap.operator_id=m.operator_id AND cap.capability IN('*','bookings.all'));
END;

DROP TRIGGER standard_custom_booking_notice;
CREATE TRIGGER standard_custom_booking_notice AFTER INSERT ON standard_custom_bookings
BEGIN
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target) VALUES(NEW.id||':buyer',NEW.customer_id,NEW.operator_id,'custom_booking','Servicio reservado','Tu reserva de prueba está confirmada.','/standard/?private=1');
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target)
 SELECT NEW.id||':'||m.user_id,m.user_id,NEW.operator_id,'custom_booking','Tu cotización fue elegida','Consulta el servicio y prepara la recogida.','/standard/?manage=1&panel=reservations&operator='||NEW.operator_id FROM memberships m WHERE m.operator_id=NEW.operator_id AND EXISTS(SELECT 1 FROM organization_capabilities cap WHERE cap.user_id=m.user_id AND cap.operator_id=m.operator_id AND cap.capability IN('*','bookings.all'));
END;

DROP TRIGGER standard_cancel_operator_notice;
CREATE TRIGGER standard_cancel_operator_notice AFTER UPDATE OF status ON bookings WHEN NEW.status='cancelled' AND OLD.status<>'cancelled'
BEGIN
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target)
 SELECT NEW.id||':cancel:'||m.user_id,m.user_id,x.operator_id,'cancel','Se canceló una reserva','La disponibilidad se actualizó en el servidor.','/standard/?manage=1&panel=reservations&operator='||x.operator_id FROM standard_booking_details x JOIN memberships m ON m.operator_id=x.operator_id AND EXISTS(SELECT 1 FROM organization_capabilities cap WHERE cap.user_id=m.user_id AND cap.operator_id=m.operator_id AND cap.capability IN('*','bookings.all')) WHERE x.booking_id=NEW.id;
END;

DROP TRIGGER standard_custom_cancel_notice;
CREATE TRIGGER standard_custom_cancel_notice AFTER UPDATE OF status ON standard_custom_bookings WHEN NEW.status='cancelled' AND OLD.status<>'cancelled'
BEGIN
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target) VALUES(NEW.id||':cancel:buyer',NEW.customer_id,NEW.operator_id,'cancel','Servicio cancelado','Consulta el estado y el reembolso simulado.','/standard/?private=1');
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target) SELECT NEW.id||':cancel:'||m.user_id,m.user_id,NEW.operator_id,'cancel','Servicio cancelado','El calendario del vehículo se actualizó.','/standard/?manage=1&panel=reservations&operator='||NEW.operator_id FROM memberships m WHERE m.operator_id=NEW.operator_id AND EXISTS(SELECT 1 FROM organization_capabilities cap WHERE cap.user_id=m.user_id AND cap.operator_id=m.operator_id AND cap.capability IN('*','bookings.all'));
END;

DROP TRIGGER standard_change_operator_notice;
CREATE TRIGGER standard_change_operator_notice AFTER INSERT ON standard_service_changes
BEGIN
 INSERT OR IGNORE INTO standard_notifications(id,user_id,operator_id,kind,title,body,target) SELECT NEW.id||':operator:'||m.user_id,m.user_id,NEW.operator_id,'change','Cambio de viaje o boleto',NEW.reason,'/standard/?manage=1&panel=reservations&operator='||NEW.operator_id FROM memberships m WHERE m.operator_id=NEW.operator_id AND EXISTS(SELECT 1 FROM organization_capabilities cap WHERE cap.user_id=m.user_id AND cap.operator_id=m.operator_id AND cap.capability IN('*','bookings.all')) AND m.user_id<>NEW.actor_user_id;
END;

INSERT OR IGNORE INTO schema_migrations(version) VALUES('0040_organization_invitations');
