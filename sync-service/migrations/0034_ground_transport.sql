CREATE TABLE standard_transport_settings(id INTEGER PRIMARY KEY CHECK(id=1),max_capacity INTEGER NOT NULL DEFAULT 100 CHECK(max_capacity BETWEEN 1 AND 100));
INSERT INTO standard_transport_settings(id,max_capacity) VALUES(1,100);
ALTER TABLE vehicles ADD COLUMN vehicle_class TEXT CHECK(vehicle_class IS NULL OR vehicle_class IN('auto','suv','van','minivan','other','buseta','minibus','bus','double_decker'));
ALTER TABLE vehicles ADD COLUMN transport_type TEXT NOT NULL DEFAULT 'private' CHECK(transport_type IN('public','private','commercial'));
ALTER TABLE vehicles ADD COLUMN authorization_number TEXT NOT NULL DEFAULT '';
CREATE TRIGGER ground_capacity_insert BEFORE INSERT ON vehicles WHEN NEW.capacity>(SELECT max_capacity FROM standard_transport_settings WHERE id=1) BEGIN SELECT RAISE(ABORT,'vehicle_capacity_limit'); END;
CREATE TRIGGER ground_capacity_update BEFORE UPDATE OF capacity ON vehicles WHEN NEW.capacity>(SELECT max_capacity FROM standard_transport_settings WHERE id=1) AND NEW.capacity<>OLD.capacity BEGIN SELECT RAISE(ABORT,'vehicle_capacity_limit'); END;
CREATE TABLE standard_transport_organizations(operator_id TEXT PRIMARY KEY REFERENCES operators(id),organization_kind TEXT NOT NULL DEFAULT 'operator' CHECK(organization_kind IN('operator','cooperative','company','individual')),transport_type TEXT NOT NULL DEFAULT 'private' CHECK(transport_type IN('public','private','commercial')),authorization_number TEXT NOT NULL DEFAULT '',authorization_authority TEXT NOT NULL DEFAULT '',service_description TEXT NOT NULL DEFAULT '',revision INTEGER NOT NULL DEFAULT 1);
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0034_ground_transport');
