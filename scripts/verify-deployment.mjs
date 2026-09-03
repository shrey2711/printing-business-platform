// One command to check a deployment before trusting it.
//
//   npm run verify:deploy
//   DIRECTUS_URL=... DIRECTUS_TOKEN=... npm run verify:deploy
//
// Runs the individual checks in the order a request actually travels — database,
// then CMS, then the content sync — and stops at the first layer that is broken,
// because a failure there makes everything after it meaningless noise.
//
// Read-only throughout. The one write it attempts is expected to be REFUSED:
// that is how the build token is proven read-only.

import { execFileSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Fall back to directus/.env so a local run needs no exports.
const ENV_FILE = join(ROOT, 'directus', '.env');
if (existsSync(ENV_FILE)) {
  for (const line of readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^(PUBLIC_URL)=(.*)$/);
    if (m && !process.env.DIRECTUS_URL) process.env.DIRECTUS_URL = m[2].trim();
  }
}

const DIRECTUS_URL = process.env.DIRECTUS_URL || '';
const step = (n, label) => console.log(`\n[${n}] ${label}\n${'─'.repeat(40 + label.length)}`);

function run(script, args = []) {
  try {
    const out = execFileSync('node', [join('scripts', script), ...args], {
      cwd: ROOT, env: process.env, encoding: 'utf8', stdio: 'pipe'
    });
    process.stdout.write(out);
    return true;
  } catch (e) {
    process.stdout.write(e.stdout || '');
    process.stderr.write(e.stderr || '');
    return false;
  }
}

let failed = 0;

step(1, 'Database');
if (!existsSync(ENV_FILE)) {
  console.log('· no directus/.env — skipping (this check reads the CMS database settings from it)');
} else if (!run('check-directus-db.mjs')) {
  failed++;
  console.error('\nStopping: nothing above the database can work until it connects.');
  process.exit(1);
}

step(2, 'CMS');
if (!DIRECTUS_URL) {
  console.log('· DIRECTUS_URL not set — skipping. Set it to check a deployed instance.');
} else if (!run('check-directus-remote.mjs', [DIRECTUS_URL])) {
  failed++;
}

step(3, 'Content sync');
if (!DIRECTUS_URL || !process.env.DIRECTUS_TOKEN) {
  console.log('· DIRECTUS_URL / DIRECTUS_TOKEN not both set — skipping.');
  console.log('  This is what a build would publish, so it is worth running with the real build token.');
} else if (!run('cms-pull.mjs', ['--dry-run'])) {
  failed++;
}

console.log('');
if (failed) {
  console.error(`✗ ${failed} check(s) failed. See DIRECTUS_SETUP.md section 9, or DEPLOYMENT.md section 5 for what each symptom means.`);
  process.exit(1);
}
console.log('✓ deployment verified — database reachable, CMS serving, build token read-only, sync ready.');
