// Build a separate copy. Never rewrite any file served by GitHub Pages.
import { readFile, writeFile, mkdir, readdir, cp, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const root = new URL('../', import.meta.url);
const output = new URL('./out/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(new URL('public/', output), { recursive: true });
for (const file of await readdir(root)) {
  if (/\.(html|css|js|mjs|svg|webmanifest)$/.test(file)) {
    await cp(new URL(file, root), new URL('public/' + file, output));
  }
}
for (const dir of ['assets', 'vendor', 'shared']) {
  await cp(new URL(dir, root), new URL('public/' + dir, output), { recursive: true });
}
await writeFile(new URL('public/shared/live-config.mjs', output),
  `export const SYNC_API=location.origin;\nexport const POLL_INTERVAL_MS=1800;\n`);
// Same-origin API requests must never enter the offline cache or HTML fallback.
let sw = await readFile(new URL('sw.js', root), 'utf8');
sw = sw.replace("const CACHE = '", "const CACHE = 'rutasec-cloudflare-dev-");
sw = sw.replace("self.addEventListener('fetch', event => {", `self.addEventListener('fetch', event => {
  if (/^\\/(api|standard-api)(?:\\/|$)/.test(new URL(event.request.url).pathname)) return;`);
await writeFile(new URL('public/sw.js', output), sw);
let html = await readFile(new URL('index.html', root), 'utf8');
html = html.replace('<title>', '<title>DEV · ');
await writeFile(new URL('public/index.html', output), html);
await writeFile(new URL('public/environment.json', output), JSON.stringify({
  environment: 'development', revision: process.env.RUTASEC_BUILD_LABEL || 'j2-static-v1',
  parityApi: '/api', standardApi: '/standard-api', payments: 'simulated'
}) + '\n');
execFileSync(process.execPath, [new URL('sync-service/build.mjs', root).pathname], { stdio: 'inherit' });
let parity = await readFile(new URL('sync-service/out/worker.mjs', root), 'utf8');
parity = parity.replace('export default ', 'const parityWorker = ');
const router = await readFile(new URL('frontend-router.mjs', import.meta.url), 'utf8');
await writeFile(new URL('worker.mjs', output), parity + '\n' + router);
console.log('Isolated Cloudflare frontend built in cloudflare-dev/out/');
