// Assemble one credentials file for a developer, from the values already on
// this machine. Run it yourself:
//
//   node scripts/make-developer-handover.mjs
//
// It writes to the PARENT of the repo, never inside it, so a stray `git add -A`
// cannot publish it. It prints variable NAMES only — values are written to the
// file and never to the terminal, so this is safe to run on a shared screen.
//
// Values it cannot find are written as TODO lines telling you which dashboard
// to copy them from. Production secrets (Stripe, Supabase, Resend) live in
// Vercel, not on disk: run `vercel env pull .env.production.local` first if you
// want those filled in too.

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, copyFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Both files go in one folder so the handover is a single thing to share, and
// the credentials are never separated from the document explaining what not to
// do with them.
const BUNDLE = join(dirname(ROOT), 'developer-handover');
const OUT = join(BUNDLE, 'DEVELOPER-CREDENTIALS.md');
const ONBOARDING = join(BUNDLE, 'DEVELOPER-ONBOARDING.md');

if (BUNDLE.startsWith(ROOT)) {
  console.error('Refusing to write inside the repository.');
  process.exit(1);
}
mkdirSync(BUNDLE, { recursive: true });

const read = (p) => (existsSync(join(ROOT, p)) ? readFileSync(join(ROOT, p), 'utf8') : '');
const parse = (text) => {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)$/);
    if (m && m[2].trim()) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
};

// Every source of real values that lives on this machine.
const sources = {
  '.env.local': parse(read('.env.local')),
  '.env.production.local': parse(read('.env.production.local')),
  'directus/.env': parse(read('directus/.env'))
};

// What the developer needs, and where each value comes from when it is absent.
const WANTED = [
  ['Storefront — Supabase', [
    ['VITE_SUPABASE_URL', 'Supabase -> Project Settings -> API -> Project URL'],
    ['VITE_SUPABASE_ANON_KEY', 'Supabase -> Project Settings -> API -> anon public'],
    ['SUPABASE_URL', 'same as VITE_SUPABASE_URL'],
    ['SUPABASE_ANON_KEY', 'same as VITE_SUPABASE_ANON_KEY'],
    ['SUPABASE_SERVICE_ROLE_KEY', 'Supabase -> Project Settings -> API -> service_role. BYPASSES ALL ROW LEVEL SECURITY'],
    ['ADMIN_EMAILS', 'comma-separated staff emails'],
    ['VITE_ADMIN_EMAILS', 'same list, shown in the UI only']
  ]],
  ['Payments — Stripe', [
    ['STRIPE_SECRET_KEY', 'Stripe -> Developers -> API keys. PREFER A TEST KEY (sk_test_) for a developer'],
    ['STRIPE_WEBHOOK_SECRET', 'Stripe -> Developers -> Webhooks -> signing secret'],
    ['PUBLIC_BASE_URL', 'http://localhost:5173 for local work']
  ]],
  ['Email', [
    ['RESEND_API_KEY', 'Resend -> API Keys'],
    ['EMAIL_FROM', 'a Resend-verified sender'],
    ['QUOTE_NOTIFY_EMAILS', 'who receives quote requests'],
    ['SMTP_HOST', 'SMTP fallback, optional'],
    ['SMTP_PORT', 'SMTP fallback, optional'],
    ['SMTP_USER', 'SMTP fallback, optional'],
    ['SMTP_PASS', 'SMTP fallback, optional']
  ]],
  ['Marketing list — Brevo', [
    ['BREVO_API_KEY', 'Brevo -> SMTP & API -> API keys'],
    ['BREVO_LIST_ID', 'numeric id of the list']
  ]],
  ['CMS — Directus', [
    ['DIRECTUS_URL', 'https://printing-business-platform-production.up.railway.app'],
    ['DIRECTUS_TOKEN', 'Directus -> the read-only Build Sync user -> static token. NOT an admin token'],
    ['ADMIN_EMAIL', 'Directus admin login. Give the developer their OWN Content Manager user instead'],
    ['ADMIN_PASSWORD', 'as above']
  ]],
  ['Address lookup', [
    ['VITE_GOOGLE_PLACES_KEY', 'optional. Without it the forms use Photon (free). Restrict any key by HTTP referrer']
  ]],
  ['Content API', [
    ['CONTENT_API_KEY', 'any long random string, must match the deployed value'],
    ['VERCEL_DEPLOY_HOOK_URL', 'Vercel -> Settings -> Git -> Deploy Hooks']
  ]]
];

const find = (key) => {
  for (const [file, vars] of Object.entries(sources)) {
    if (vars[key] !== undefined) return { value: vars[key], file };
  }
  return null;
};

let found = 0;
let missing = 0;
const lines = [
  '# Developer credentials — Apex Trade Show',
  '',
  `Generated ${new Date().toISOString().slice(0, 10)} from the values on this machine.`,
  '',
  '**Read DEVELOPER-ONBOARDING.md in this folder first.** It explains what each',
  'variable does, what is safe to hand over, and how to get running without most',
  'of these.',
  '',
  '**Send this through a password manager share link, not email or chat.**',
  'Delete it once the developer has loaded the values, and rotate every key here',
  'when the engagement ends.',
  '',
  'Values marked TODO were not on this machine. Production secrets live in Vercel:',
  'run `vercel env pull .env.production.local` and re-run this script to include them.',
  '',
  '---',
  ''
];

for (const [section, keys] of WANTED) {
  lines.push(`## ${section}`, '', '```');
  for (const [key, where] of keys) {
    const hit = find(key);
    if (hit) {
      lines.push(`${key}=${hit.value}`);
      found++;
    } else {
      lines.push(`# TODO — ${where}`);
      lines.push(`${key}=`);
      missing++;
    }
  }
  lines.push('```', '');
}

// 0o600 — owner read/write only. Without an explicit mode the file inherits the
// process umask, which on most systems means 0644: every account on the machine
// can read a file holding the Stripe key and the Supabase service role key.
// Set at creation rather than chmod'd afterwards, so there is no window where
// the secrets sit world-readable.
writeFileSync(OUT, lines.join('\n'), { encoding: 'utf8', mode: 0o600 });

// Pair the credentials with the document that says what not to do with them.
const src = join(ROOT, 'docs', 'DEVELOPER_ONBOARDING.md');
if (existsSync(src)) copyFileSync(src, ONBOARDING);
else console.log('  WARNING: docs/DEVELOPER_ONBOARDING.md is missing — credentials sent without it.');

// An earlier version wrote a single loose file next to the repo. Remove it so
// there is only ever one copy of these secrets on disk.
const legacy = join(dirname(ROOT), 'DEVELOPER-CREDENTIALS.md');
if (existsSync(legacy)) {
  rmSync(legacy);
  console.log(`  Removed the previous loose copy at ${legacy}`);
}

console.log(`Wrote ${BUNDLE}`);
console.log('  DEVELOPER-CREDENTIALS.md  (secrets)');
console.log('  DEVELOPER-ONBOARDING.md   (what they mean, what not to share)');
if (process.platform === 'win32') {
  console.log('  NOTE: Windows ignores POSIX file modes. This file inherits the');
  console.log('  folder\'s ACL, and OneDrive will sync it. Move it out of OneDrive');
  console.log('  if you do not want a cloud copy.');
} else {
  console.log('  Permissions: 0600 (owner only).');
}
console.log(`  ${found} value(s) filled from disk, ${missing} left as TODO.`);
console.log('  Values were not printed here. Open the file to read them.');
console.log('\nThis file is OUTSIDE the repository on purpose. Do not move it in.');
