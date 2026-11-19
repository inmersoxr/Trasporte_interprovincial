import test from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
test('Recovery verifier restores the current integrated schema and checks inventory in temporary SQLite',()=>{
 const script=`import importlib.util,pathlib,sqlite3,json
root=pathlib.Path.cwd()
spec=importlib.util.spec_from_file_location('recovery',root/'verify-d1-restore.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
db=sqlite3.connect(':memory:')
for p in sorted((root.parent/'sync-service/migrations').glob('*.sql')):db.executescript(p.read_text())
db.executescript("INSERT INTO users(id,display_name) VALUES('u','Prueba');INSERT INTO operators(id,legal_name,display_name,status,data_scope) VALUES('o','Prueba','Prueba','approved','qa');INSERT INTO vehicles(id,operator_id,type,model,capacity,status) VALUES('v','o','van','Prueba',2,'active');INSERT INTO route_offers(id,operator_id,origin,destination,service_type,vehicle_type,price_cents) VALUES('r','o','Cuenca','Guayaquil','shared','van',1500);INSERT INTO departures(id,offer_id,vehicle_id,depart_at) VALUES('d','r','v','2099-01-01T00:00:00.000Z');INSERT INTO bookings(id,customer_id,offer_id,departure_id,mode,service_at,passenger_count,amount_cents,status) VALUES('b','u','r','d','shared','2099-01-01T00:00:00.000Z',1,1500,'confirmed');INSERT INTO standard_booking_details(booking_id,operator_id,vehicle_id) VALUES('b','o','v');")
print(json.dumps(m.restore_and_verify(('\\n'.join(db.iterdump())).encode())))`;
 const r=JSON.parse(execFileSync('python',['-c',script],{cwd:new URL('../',import.meta.url),encoding:'utf8'}));assert.equal(r.integrity,'ok');assert.equal(r.foreignKeys,'ok');assert.equal(r.rowCounts.bookings,1);
});
