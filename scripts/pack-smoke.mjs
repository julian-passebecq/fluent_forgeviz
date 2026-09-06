import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const out = mkdtempSync(join(tmpdir(), 'vizforge-pack-'));
execFileSync('pnpm', ['pack', '--pack-destination', out], { stdio: 'pipe' });
const file = readdirSync(out).find((name) => name.endsWith('.tgz'));
if (!file) throw new Error('pnpm pack did not create a tarball');
const tarball = join(out, file);
const listing = execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8' });
for (const required of [
  'package/dist/index.js',
  'package/dist/index.d.ts',
  'package/dist/adapters/react.js',
  'package/SOURCE_COMMIT'
]) {
  if (!listing.includes(required)) throw new Error(`Packed engine is missing ${required}`);
}
if (!existsSync('dist/index.js')) throw new Error('Library build did not emit dist/index.js');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
if (pkg.private !== true) throw new Error('Extraction checkpoint must remain private until release policy is explicit');
console.log('pack smoke passed');
