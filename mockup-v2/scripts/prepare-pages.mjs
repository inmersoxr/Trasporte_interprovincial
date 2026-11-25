import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const [legacyArg, outputArg] = process.argv.slice(2);
if (!legacyArg || !outputArg) throw new Error('Usage: node prepare-pages.mjs <main-checkout> <output-directory>');
const legacy = resolve(legacyArg), output = resolve(outputArg);
if (output === legacy || output.startsWith(legacy + '/')) throw new Error('Output must be separate from the main checkout');
const demo = fileURLToPath(new URL('../dist/', import.meta.url));
await mkdir(output, { recursive: true });
await cp(legacy, output, {
  recursive: true,
  filter: source => !['.git', '.github'].includes(source.slice(legacy.length).split('/').filter(Boolean)[0]),
});
const demoOutput = join(output, 'mockup-v2');
await mkdir(demoOutput, { recursive: true });
await cp(demo, demoOutput, { recursive: true });
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const original = await readFile(join(legacy, 'index.html'));
const preserved = await readFile(join(output, 'index.html'));
if (digest(original) !== digest(preserved)) throw new Error('Legacy homepage changed in Pages artifact');
await writeFile(join(demoOutput, 'deployment.json'), JSON.stringify({
  project: 'RutasEC Mockup V2',
  mockupCommit: process.env.MOCKUP_COMMIT || 'local-check',
  legacyCommit: process.env.LEGACY_COMMIT || 'local-check',
  legacyIndexSha256: digest(original),
  demoPath: '/Trasporte_interprovincial/mockup-v2/',
}, null, 2) + '\n');
console.log('Pages artifact prepared: legacy homepage preserved; V2 isolated at mockup-v2/.');
