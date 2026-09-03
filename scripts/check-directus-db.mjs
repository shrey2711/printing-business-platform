// Pre-flight check for the Directus database connection.
//
// Run this BEFORE starting Docker. Directus's own failure output on a bad
// connection is a migration stack trace that does not say which of the four
// likely causes it is; this says so directly.
//
//   node scripts/check-directus-db.mjs                 # reads directus/.env
//   node scripts/check-directus-db.mjs path/to/.env
//
// It prints facts about the connection and never prints a credential.

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = process.argv[2] || join(__dirname, '..', 'directus', '.env');

if (!existsSync(ENV_PATH)) {
  console.error(`✗ no env file at ${ENV_PATH}`);
  console.error('  Create it first:  cp directus/.env.example directus/.env');
  process.exit(1);
}

let pg;
try {
  pg = (await import('pg')).default;
} catch {
  console.error('✗ the "pg" package is not installed — run: npm install');
  process.exit(1);
}

const raw = readFileSync(ENV_PATH, 'utf8');
const env = {};
// Split on /\r?\n/ deliberately: a CRLF file is exactly one of the failures
// this script exists to catch, and it must not break the parser that reports it.
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const problems = [];

// --- static checks, before spending a round trip -----------------------------
if (raw.includes('\r\n')) {
  problems.push(
    'The file has CRLF line endings. Docker\'s env_file parser carries the trailing CR into ' +
    'the value, so authentication fails with a password that is actually correct. Save it as LF.'
  );
}
if (/^db\..*\.supabase\.co$/.test(env.DB_HOST || '')) {
  problems.push(
    `DB_HOST is the direct connection (${env.DB_HOST}). It is IPv6-only on current Supabase ` +
    'projects and does not resolve from most Docker networks. Use the session pooler host ' +
    'from Supabase -> Settings -> Database -> Connection string -> Session pooler.'
  );
}
if (env.DB_PORT === '6543') {
  problems.push(
    'DB_PORT 6543 is the transaction pooler, which cannot do prepared statements. ' +
    'Directus needs them for migrations. Use the session pooler on 5432.'
  );
}
if (env.DB_HOST?.includes('pooler.supabase.com') && !env.DB_USER?.includes('.')) {
  problems.push(
    `DB_USER is "${env.DB_USER}". Against the pooler it must be postgres.<project-ref>, ` +
    'or the pooler answers "no tenant identifier provided".'
  );
}

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s) in ${ENV_PATH}:\n`);
  problems.forEach((p) => console.error(`  ✗ ${p}\n`));
  process.exit(1);
}

// --- TLS ---------------------------------------------------------------------
// Supabase's Postgres endpoint presents a self-signed chain, so verification
// only works with its CA pinned. Honour whatever the env file asks for, so this
// check exercises the SAME TLS settings the container will use.
const wantsVerify = (env.DB_SSL__REJECT_UNAUTHORIZED || '').toLowerCase() !== 'false';
const ca = env.DB_SSL__CA || '';
// An env file cannot hold real newlines, so a PEM pasted into one arrives with
// literal backslash-n; turn those back into line breaks before handing it to TLS.
const ssl = ca
  ? { ca: ca.split(String.raw`\n`).join('\n'), rejectUnauthorized: wantsVerify }
  : { rejectUnauthorized: wantsVerify };

if (!ca && !wantsVerify) {
  // Not fatal — this is the documented local setting — but it must not travel
  // to production, where this connection carries the database superuser
  // password past anyone able to sit in the middle of it.
  console.log('! TLS certificate verification is OFF (DB_SSL__REJECT_UNAUTHORIZED=false).');
  console.log('  Fine locally. Before deploying, pin the CA: see directus/DEPLOY.md step 1b.');
}
if (!ca && wantsVerify) {
  console.error('✗ DB_SSL__REJECT_UNAUTHORIZED is true but DB_SSL__CA is empty.');
  console.error('  Supabase presents a self-signed chain, so verification needs its CA pinned.');
  console.error('  Download it: Supabase -> Settings -> Database -> SSL Configuration.');
  process.exit(1);
}

// --- live connection ---------------------------------------------------------
const client = new pg.Client({
  host: env.DB_HOST,
  port: Number(env.DB_PORT) || 5432,
  database: env.DB_DATABASE || 'postgres',
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  ssl,
  connectionTimeoutMillis: 15000
});

const schema = (env.DB_SEARCH_PATH || 'directus').split(',')[0].trim();

try {
  await client.connect();
  console.log(`✓ connected to ${env.DB_HOST}:${env.DB_PORT}${ca && wantsVerify ? ' (certificate verified against the pinned CA)' : ''}`);

  const v = await client.query('select version()');
  console.log(`   ${v.rows[0].version.split(',')[0]}`);

  // The one capability the transaction pooler lacks.
  await client.query({ name: 'preflight', text: 'select $1::int as n', values: [1] });
  console.log('✓ prepared statements work — this is the session pooler, not the transaction pooler');

  const s = await client.query(
    'select 1 from information_schema.schemata where schema_name = $1', [schema]
  );
  if (!s.rowCount) {
    console.error(`✗ the "${schema}" schema does not exist — run supabase/directus-schema.sql first`);
    process.exitCode = 1;
  } else {
    console.log(`✓ the "${schema}" schema exists`);
    const t = await client.query(
      'select count(*)::int as n from information_schema.tables where table_schema = $1', [schema]
    );
    console.log(`   ${t.rows[0].n} table(s) in it (0 means the first boot will create ~30)`);

    const priv = await client.query('select has_schema_privilege(current_user, $1, $2) as ok', [schema, 'CREATE']);
    if (!priv.rows[0].ok) {
      console.error(`✗ ${env.DB_USER} cannot create tables in "${schema}" — migrations will fail`);
      process.exitCode = 1;
    } else {
      console.log('✓ the user can create tables there');
    }
  }

  if (!process.exitCode) console.log('\nReady. Start Directus:  cd directus && docker compose up -d');
} catch (e) {
  const detail = (e.errors || []).map((x) => x.code || x.message).join(', ');
  console.error(`✗ connection failed: ${e.code || e.name}${e.message ? ` — ${e.message}` : ''}${detail ? ` [${detail}]` : ''}`);

  const msg = `${e.message || ''} ${detail}`;
  if (/tenant.*not found/i.test(msg)) {
    console.error(
      '\n  The pooler answered but has no such tenant. The instance number in the host is\n' +
      '  usually the cause — it is not always aws-0. Copy the host from Supabase ->\n' +
      '  Settings -> Database -> Connection string -> Session pooler.'
    );
  }
  if (/no tenant identifier/i.test(msg)) {
    console.error('\n  DB_USER must be postgres.<project-ref> against the pooler, not plain postgres.');
  }
  if (/ENOTFOUND|EAI_AGAIN/.test(msg)) console.error('\n  DB_HOST does not resolve.');
  if (/password|SASL|auth/i.test(msg)) console.error('\n  Credentials rejected — check DB_USER and DB_PASSWORD.');
  if (/ETIMEDOUT|ECONNREFUSED/.test(msg)) console.error('\n  Nothing accepted the connection on that host and port.');
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
