-- Enforce assignment integrity inside the transaction, including revoke/assign races.
CREATE TRIGGER premium_assignment_insert_valid BEFORE INSERT ON premium_assignments
WHEN NOT EXISTS(SELECT 1 FROM vehicles v JOIN premium_branches b ON b.operator_id=v.operator_id WHERE v.id=NEW.vehicle_id AND v.operator_id=NEW.operator_id AND b.id=NEW.branch_id)
 OR (NEW.driver_user_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM memberships m WHERE m.user_id=NEW.driver_user_id AND m.operator_id=NEW.operator_id AND m.role='driver'))
BEGIN SELECT RAISE(ABORT,'assignment_conflict'); END;
CREATE TRIGGER premium_assignment_update_valid BEFORE UPDATE ON premium_assignments
WHEN NOT EXISTS(SELECT 1 FROM vehicles v JOIN premium_branches b ON b.operator_id=v.operator_id WHERE v.id=NEW.vehicle_id AND v.operator_id=NEW.operator_id AND b.id=NEW.branch_id)
 OR (NEW.driver_user_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM memberships m WHERE m.user_id=NEW.driver_user_id AND m.operator_id=NEW.operator_id AND m.role='driver'))
BEGIN SELECT RAISE(ABORT,'assignment_conflict'); END;
CREATE TRIGGER premium_member_removed AFTER DELETE ON memberships
BEGIN UPDATE premium_assignments SET driver_user_id=NULL WHERE operator_id=OLD.operator_id AND driver_user_id=OLD.user_id; END;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0012_premium_integrity');
