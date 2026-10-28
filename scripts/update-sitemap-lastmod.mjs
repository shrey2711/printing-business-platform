// Regenerate scripts/data/sitemap-lastmod.json (per-URL content-change dates
// from git blame + source fingerprints) by running the normal build with
// SITEMAP_LASTMOD_WRITE=1. Requires full git history (not a shallow clone).
//   npm run sitemap:lastmod            -> rewrite the manifest
//   npm run sitemap:lastmod -- --check -> exit 1 if the manifest is stale
// See scripts/lib/sitemap-lastmod.mjs for how dates are resolved.
import { spawnSync } from 'node:child_process';

const check = process.argv.includes('--check');
const env = { ...process.env, [check ? 'SITEMAP_LASTMOD_CHECK' : 'SITEMAP_LASTMOD_WRITE']: '1' };
const r = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], { stdio: 'inherit', env });
process.exit(r.status ?? 1);
