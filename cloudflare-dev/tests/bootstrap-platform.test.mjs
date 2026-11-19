import test from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
test('First platform owner bootstrap requires an existing active user and cannot replace existing authority',()=>{const output=execFileSync('python',['-c',`import importlib.util,sqlite3,pathlib
root=pathlib.Path(${JSON.stringify(new URL('../../',import.meta.url).pathname)})
spec=importlib.util.spec_from_file_location('bootstrap',root/'cloudflare-dev/bootstrap-platform-owner.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
db=sqlite3.connect(':memory:')
for path in sorted((root/'sync-service/migrations').glob('*.sql')): db.executescript(path.read_text())
db.execute("INSERT INTO users(id,display_name) VALUES('first','First')")
db.execute("INSERT INTO users(id,display_name) VALUES('second','Second')")
assert db.execute(module.SQL,['missing']).fetchall()==[]
assert db.execute(module.SQL,['first']).fetchall()==[('first','owner')]
assert db.execute(module.SQL,['second']).fetchall()==[]
assert db.execute("SELECT COUNT(*) FROM platform_admins").fetchone()[0]==1
assert db.execute("SELECT action FROM audit_events WHERE entity_type='platform_authority'").fetchone()[0]=='granted_owner'
print('bootstrap=PASS')`],{encoding:'utf8'});assert.match(output,/bootstrap=PASS/);});
