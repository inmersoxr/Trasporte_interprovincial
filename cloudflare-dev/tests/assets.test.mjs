import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';
const root = new URL('../', import.meta.url);
const sw = readFileSync(new URL('out/public/sw.js', root), 'utf8');
const handlers = {};
vm.runInNewContext(sw, { self: { addEventListener: (name, fn) => { handlers[name] = fn; } }, URL });
test('same-origin APIs bypass offline cache and HTML fallback', () => {
  for (const path of ['/api/catalog', '/standard-api/health']) {
    let intercepted = false;
    handlers.fetch({ request: { method: 'GET', url: 'https://dev.example' + path },
      respondWith() { intercepted = true; } });
    assert.equal(intercepted, false);
  }
});
test('all service worker precache files exist; copied config cannot target original demo', () => {
  const core = JSON.parse(sw.match(/const CORE = (\[[^;]+\]);/)[1].replaceAll("'", '"'));
  for (const path of core) assert.ok(existsSync(new URL('out/public/' + path.split('?')[0], root)), path);
  const config = readFileSync(new URL('out/public/shared/live-config.mjs', root), 'utf8');
  assert.ok(config.includes('location.origin'));
  assert.ok(!config.includes('chatgpt.site'));
});
