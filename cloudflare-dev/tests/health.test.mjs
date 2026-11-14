import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker.mjs';

const request = (path = '/health', method = 'GET') =>
  new Request(`https://dev.example${path}`, { method });
const env = {
  DB: { prepare: () => ({ bind: () => ({ first: async () => ({ version: '0001_initial' }) }) }) },
  BUCKET: { list: async () => ({ objects: [] }) }
};
test('health verifies both bindings without cache', async () => {
  const response = await worker.fetch(request(), env);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal((await response.json()).ok, true);
});
test('missing bindings or schema fail closed without leaking internal error', async () => {
  for (const broken of [{}, { ...env, DB: { prepare() { throw new Error('SECRET'); } } },
    { ...env, BUCKET: { list() { throw new Error('SECRET'); } } },
    { ...env, DB: { prepare: () => ({ bind: () => ({ first: async () => null }) }) } }]) {
    const response = await worker.fetch(request(), broken);
    assert.equal(response.status, 503);
    assert.equal((await response.json()).ok, false);
  }
});
test('no business or write API is exposed', async () => {
  assert.equal((await worker.fetch(request('/api/bookings'), env)).status, 404);
  const response = await worker.fetch(request('/health', 'POST'), env);
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Allow'), 'GET');
});
