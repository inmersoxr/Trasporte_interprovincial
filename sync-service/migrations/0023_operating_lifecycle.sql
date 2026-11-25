ALTER TABLE standard_tracking ADD COLUMN mode TEXT NOT NULL DEFAULT 'simulator' CHECK(mode IN('simulator','operations'));
ALTER TABLE standard_drivers ADD COLUMN user_id TEXT REFERENCES users(id);
CREATE UNIQUE INDEX standard_driver_account ON standard_drivers(operator_id,user_id) WHERE user_id IS NOT NULL;
CREATE TRIGGER standard_driver_account_valid BEFORE UPDATE OF user_id ON standard_drivers
WHEN NEW.user_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM memberships WHERE operator_id=NEW.operator_id AND user_id=NEW.user_id AND role='driver')
BEGIN SELECT RAISE(ABORT,'assignment_conflict'); END;
CREATE TRIGGER platform_entitlement_created AFTER INSERT ON platform_subscriptions
WHEN EXISTS(SELECT 1 FROM operators WHERE id=NEW.operator_id AND data_scope='alpha')
BEGIN
 INSERT INTO premium_tenants(operator_id,plan,active) VALUES(NEW.operator_id,'premium_dev',CASE WHEN NEW.plan='premium' AND NEW.status IN('active','trial') THEN 1 ELSE 0 END)
 ON CONFLICT(operator_id) DO UPDATE SET plan=excluded.plan,active=excluded.active;
END;
CREATE TRIGGER platform_entitlement_updated AFTER UPDATE ON platform_subscriptions
WHEN EXISTS(SELECT 1 FROM operators WHERE id=NEW.operator_id AND data_scope='alpha')
BEGIN
 INSERT INTO premium_tenants(operator_id,plan,active) VALUES(NEW.operator_id,'premium_dev',CASE WHEN NEW.plan='premium' AND NEW.status IN('active','trial') THEN 1 ELSE 0 END)
 ON CONFLICT(operator_id) DO UPDATE SET plan=excluded.plan,active=excluded.active;
END;
CREATE TRIGGER standard_driver_account_insert BEFORE INSERT ON standard_drivers
WHEN NEW.user_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM memberships WHERE operator_id=NEW.operator_id AND user_id=NEW.user_id AND role='driver')
BEGIN SELECT RAISE(ABORT,'assignment_conflict'); END;
CREATE TRIGGER standard_driver_account_revoke AFTER DELETE ON memberships
BEGIN UPDATE standard_drivers SET user_id=NULL WHERE operator_id=OLD.operator_id AND user_id=OLD.user_id; END;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0023_operating_lifecycle');
