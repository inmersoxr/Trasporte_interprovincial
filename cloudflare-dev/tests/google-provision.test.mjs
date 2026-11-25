import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
test('Google activation preserves absent secrets, rejects partial pairs and never logs credential payloads',()=>{const r=spawnSync('python',['tests/google-provision.py'],{cwd:new URL('../',import.meta.url),encoding:'utf8'});assert.equal(r.status,0,r.stderr);});

import {returnPath} from '../account/return-path.mjs';
test('Google login returns to company tools without accepting external or API destinations',()=>{assert.equal(returnPath('/company/?operator=one'),'/company/?operator=one');assert.equal(returnPath('/business/?operator=one'),'/business/?operator=one');for(const v of ['//evil.example/','https://evil.example/','/standard-api/auth/logout','/company/../../standard-api/auth/logout'])assert.equal(returnPath(v),null);});
