import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

// Hard guard: this verifier may create fictitious data ONLY on our new dev domain.
const base = 'https://rutasec-web-dev.drbrownlabs.workers.dev';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true, args: ['--no-sandbox'] });
const proxyServer = process.env.https_proxy || process.env.HTTPS_PROXY;
const network = proxyServer ? { proxy: { server: proxyServer } } : {};
const context = await browser.newContext({ ...network, viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: false });
const other = await browser.newContext({ ...network, viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const second = await other.newPage();
const errors = [], forbidden = [];
page.on('pageerror', error => errors.push(error.message));
for (const p of [page, second]) p.on('request', request => {
  if (/rutasec-viajes-sync|inmersoxr\.github\.io/.test(request.url())) forbidden.push(request.url());
});
const token = () => crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '');
const opKey = token(), operatorId = crypto.randomUUID();
let ride;
async function api(client, path, body, key = '') {
  const response = await client.fetch(base + path, {
    method: body ? 'POST' : 'GET', headers: key ? { Authorization: 'Bearer ' + key } : {},
    ...(body ? { data: body } : {})
  });
  return { status: response.status(), data: await response.json() };
}
try {
  assert.equal((await page.goto(base)).status(), 200);
  await page.waitForFunction(() => window.BookingApp && window.LiveTrip);
  await page.locator('#splash').waitFor({ state: 'hidden' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await second.goto(base);
  await second.waitForFunction(() => window.BookingApp);
  const health = await api(context.request, '/standard-api/health');
  assert.equal(health.status, 200); assert.equal(health.data.d1, true);
  console.log('Static Assets, mobile layout and D1 service binding: PASS');
  const manifest = await (await context.request.get(base + '/manifest.webmanifest')).json();
  assert.equal(manifest.start_url, './'); assert.equal(manifest.scope, './');
  const config = await (await context.request.get(base + '/shared/live-config.mjs')).text();
  assert.ok(config.includes('location.origin')); assert.ok(!config.includes('chatgpt.site'));
  for (const id of ['results', 'mytrip', 'security', 'operator', 'home', 'private-request']) {
    await page.evaluate(id => window.show(id), id);
    assert.equal(await page.locator('.screen.active').getAttribute('id'), id);
  }
  await page.evaluate(() => { show('operator'); BookingApp.chooseTier('premium'); });
  await page.locator('#operatorTierChooser').waitFor({ state: 'hidden' });
  await page.evaluate(() => BookingApp.chooseTier('standard'));
  console.log('Navigation, private request and Premium demo selection preserved: PASS');
  assert.equal((await api(context.request, '/api/operators', {
    id: operatorId, name: 'Parity infrastructure test · fictitious', whatsapp: '593990000000'
  }, opKey)).status, 200);
  const date = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  const created = await api(context.request, '/api/rides', {
    requestId: crypto.randomUUID(), origin: 'Cuenca', destination: 'Guayaquil', date,
    time: '16:00', vehicleType: 'van', vehicle: 'Fictitious QA vehicle', capacity: 8,
    priceCents: 1500, publish: true
  }, opKey);
  assert.equal(created.status, 201); ride = created.data.ride;
  const catalog = await api(other.request, '/api/catalog');
  assert.ok(catalog.data.rides.some(r => r.id === ride.id));
  const ticketKey = token();
  const paid = await api(other.request, '/api/bookings', {
    rideId: ride.id, requestId: crypto.randomUUID(), bookingToken: ticketKey, seats: 2,
    seatNumbers: [1, 2], mode: 'shared', quotedPriceCents: 1500,
    passengers: ['Fictitious QA one', 'Fictitious QA two'], paymentMethod: 'debit'
  });
  assert.equal(paid.status, 201); const booking = paid.data.booking;
  assert.equal(booking.ride.available, 6);
  assert.equal((await api(context.request, '/api/bookings/' + booking.id)).status, 403);
  await second.goto(`${base}/#boleto/${booking.id}?key=${ticketKey}`);
  await second.locator('#ticket.active').waitFor();
  await second.reload(); await second.locator('#ticket.active').waitFor();
  await second.locator('#ticket').getByText('Fictitious QA one', { exact: false }).first().waitFor();
  console.log('Independent sessions, isolated R2 booking, ticket and reload persistence: PASS');
  const started = await api(context.request, '/api/rides/' + ride.id, { action: 'start' }, opKey);
  assert.equal(started.status, 200); const liveId = started.data.ride.liveId;
  await page.goto(`${base}/#seguimiento/${liveId}`);
  await page.waitForSelector('#liveMap.leaflet-container');
  const live = await api(other.request, '/api/trips/' + liveId, undefined, ticketKey);
  const sos = await api(other.request, '/api/trips/' + liveId + '/commands', {
    action: 'sos', requestId: crypto.randomUUID(), expectedRevision: live.data.trip.revision
  }, ticketKey);
  assert.equal(sos.status, 200); assert.equal(sos.data.trip.alerts[0].simulated, true);
  console.log('Leaflet map, shared tracking and simulated SOS: PASS');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload(); await page.waitForFunction(() => navigator.serviceWorker.controller);
  await page.evaluate(() => fetch('/api/catalog'));
  const apiCache = await page.evaluate(async () => {
    const matches = [];
    for (const name of await caches.keys()) for (const r of await (await caches.open(name)).keys()) {
      if (/\/(api|standard-api)\//.test(new URL(r.url).pathname)) matches.push(r.url);
    }
    return matches;
  });
  assert.deepEqual(apiCache, []);
  await page.evaluate(() => show('home'));
  await mkdir(new URL('../qa-output/', import.meta.url), { recursive: true });
  await page.screenshot({ path: new URL('../qa-output/cloudflare-mobile.png', import.meta.url).pathname });
  await context.setOffline(true); await page.reload();
  await page.waitForSelector('#home');
  await context.setOffline(false);
  assert.deepEqual(errors, []); assert.deepEqual(forbidden, []);
  console.log('PWA offline shell; APIs excluded from cache; no demo requests; no JS errors: PASS');
} finally {
  if (ride) {
    const result = await api(context.request, '/api/rides/' + ride.id, { action: 'cancel' }, opKey);
    console.log('Parity test departure cancellation:', result.status);
  }
  await browser.close();
}
