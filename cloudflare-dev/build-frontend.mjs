// Build a separate copy. Never rewrite any file served by GitHub Pages.
import { readFile, writeFile, mkdir, readdir, cp, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { patchBookings } from './frontend-patches.mjs';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const output = new URL('./out/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(new URL('public/', output), { recursive: true });
await cp(new URL('admin/',import.meta.url),new URL('admin-public/',output),{recursive:true});
await cp(new URL('account/email-ui.mjs',import.meta.url),new URL('admin-public/email-ui.mjs',output));
await writeFile(new URL('reference-route.mjs', output), 'export default '+await readFile(new URL('shared/route.json', root),'utf8')+';\n');
for (const file of await readdir(root)) {
  if (/\.(html|css|js|mjs|svg|webmanifest)$/.test(file)) {
    await cp(new URL(file, root), new URL('public/' + file, output));
  }
}
for (const dir of ['assets', 'vendor', 'shared']) {
  await cp(new URL(dir, root), new URL('public/' + dir, output), { recursive: true });
}
await cp(new URL('account/', import.meta.url), new URL('public/account/', output), { recursive: true });
await cp(new URL('miniapp/', import.meta.url), new URL('public/miniapp/', output), { recursive: true });
await cp(new URL('premium/', import.meta.url), new URL('public/premium/', output), { recursive: true });
await cp(new URL('standard/', import.meta.url), new URL('public/standard/', output), { recursive: true });
await cp(new URL('node_modules/jsqr/dist/jsQR.js',import.meta.url),new URL('public/standard/vendor/jsQR.js',output));
await cp(new URL('node_modules/jsqr/LICENSE',import.meta.url),new URL('public/standard/vendor/jsQR.LICENSE',output));
// Cloudflare-only brand conversion; protected Pages assets are never rewritten.
const brand=JSON.parse(await readFile(new URL('brand/assets.json',import.meta.url),'utf8'));
for(const [path,data] of Object.entries(brand))await writeFile(new URL('public/'+path,output),Buffer.from(data,'base64'));
await writeFile(new URL('public/icon.svg',output),'<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><image width="512" height="512" href="data:image/png;base64,'+brand['assets/icon-512.png']+'"/></svg>');
for(const app of ['standard','premium','account','miniapp']){
 const path=new URL('public/'+app+'/index.html',output);let markup=await readFile(path,'utf8');
 const iconLinks='<link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/assets/icon-192.png">';
 markup=markup.includes('</head>')?markup.replace('</head>',iconLinks+'</head>'):markup.replace('<body>',iconLinks+'<body>');
 if(['premium','account'].includes(app))markup=markup.replace('<h1>','<img src="/assets/rutasec-logo.png" alt="RutasEC" width="136" height="110"><h1>');
 await writeFile(path,markup);
}
const adminPath=new URL('admin-public/index.html',output);let adminMarkup=await readFile(adminPath,'utf8');
adminMarkup=adminMarkup.replace('</head>','<link rel="icon" href="data:image/png;base64,'+brand['assets/icon-192.png']+'"></head>');
adminMarkup=adminMarkup.replaceAll('<h1>','<img src="data:image/png;base64,'+brand['assets/rutasec-logo.png']+'" alt="RutasEC" width="136" height="110"><h1>');
await writeFile(adminPath,adminMarkup);
await writeFile(new URL('public/bookings.mjs', output),
  patchBookings(await readFile(new URL('bookings.mjs', root), 'utf8')));
await writeFile(new URL('public/shared/live-config.mjs', output),
  `export const SYNC_API=location.origin;\nexport const POLL_INTERVAL_MS=1800;\n`);
// Same-origin API requests must never enter the offline cache or HTML fallback.
async function assetPaths(dir){const paths=[];for(const entry of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name,'en'))){const path=new URL(entry.name+(entry.isDirectory()?'/':''),dir);if(entry.isDirectory())paths.push(...await assetPaths(path));else paths.push(path);}return paths;}
const digest=createHash('sha256');
digest.update(await readFile(new URL('build-frontend.mjs',import.meta.url)));
for(const path of await assetPaths(new URL('public/',output))){digest.update(path.pathname.split('/out/public/')[1]);digest.update(await readFile(path));}
const revision=digest.digest('hex').slice(0,16);
for(const app of ['premium','miniapp']){const source=await readFile(new URL(app+'/sw.js',import.meta.url),'utf8');await writeFile(new URL('public/'+app+'/sw.js',output),source.replace('__BUILD_REVISION__',revision));}
const standardSW=await readFile(new URL('standard/sw.js',import.meta.url),'utf8');
await writeFile(new URL('public/standard/sw.js',output),standardSW.replace('__BUILD_REVISION__',revision));
let sw = await readFile(new URL('sw.js', root), 'utf8');
sw = sw.replace("const CACHE = '", "const CACHE = 'rutasec-cloudflare-dev-"+revision+"-");
sw = sw.replace("key.startsWith('rutasec-')", "key.startsWith('rutasec-cloudflare-dev-')");
sw = sw.replace("self.addEventListener('fetch', event => {", `self.addEventListener('fetch', event => {
  if (/^\\/(api|standard-api|standard|account|premium|miniapp)(?:\\/|$)/.test(new URL(event.request.url).pathname)) return;`);
await writeFile(new URL('public/sw.js', output), sw);
let html = await readFile(new URL('index.html', root), 'utf8');
html = html.replace('<title>', '<title>DEV · ');
await writeFile(new URL('public/index.html', output), html);
await writeFile(new URL('public/environment.json', output), JSON.stringify({
  environment: 'development', version: '0.1.0-alpha.0', revision: process.env.RUTASEC_BUILD_LABEL || 'alpha-corrections-dev',
  parityApi: '/api', standardApi: '/standard-api', payments: 'simulated'
}) + '\n');
execFileSync(process.execPath, [new URL('sync-service/build.mjs', root).pathname], { stdio: 'inherit' });
let parity = await readFile(new URL('sync-service/out/worker.mjs', root), 'utf8');
parity = parity.replace('export default ', 'const parityWorker = ');
const router = await readFile(new URL('frontend-router.mjs', import.meta.url), 'utf8');
await writeFile(new URL('worker.mjs', output), parity + '\n' + router);
console.log('Isolated Cloudflare frontend built in cloudflare-dev/out/');
