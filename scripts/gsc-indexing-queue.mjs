#!/usr/bin/env node
// Picks today's batch of URLs to submit via Search Console "Request Indexing"
// (manual only; Google has no API for it, ~10/day per property).
// Priority: product pages first, then location pages, in sitemap order.
// Each candidate is checked live with the URL Inspection API; URLs already
// indexed, noindexed, or suggested in the last COOLDOWN_DAYS are skipped.
//
// Usage: node scripts/gsc-indexing-queue.mjs [--count=10]

import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const KEY_PATH = path.join(ROOT, 'credentials', 'gsc-service-account.json');
const SITE_URL = 'https://www.apextradeshow.com/';
const PRIORITY_SITEMAPS = ['sitemap-products.xml', 'sitemap-locations.xml'];
const COOLDOWN_DAYS = 7;
const CONCURRENCY = 5;
const LOG_PATH = path.join(ROOT, 'reports', 'indexing-queue-log.json');
const OUT_PATH = path.join(ROOT, 'reports', 'indexing-queue-today.md');

const countArg = process.argv.find((a) => a.startsWith('--count='));
const COUNT = countArg ? Number(countArg.split('=')[1]) : 10;

function priorityUrls() {
  const urls = [];
  for (const f of PRIORITY_SITEMAPS) {
    const xml = fs.readFileSync(path.join(ROOT, 'dist', f), 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      urls.push({ url: m[1].trim(), group: f.includes('products') ? 'Product' : 'Location' });
    }
  }
  return urls;
}

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const sc = google.searchconsole({ version: 'v1', auth });

  const log = fs.existsSync(LOG_PATH) ? JSON.parse(fs.readFileSync(LOG_PATH, 'utf8')) : {};
  const today = new Date().toISOString().slice(0, 10);
  const cutoff = Date.now() - COOLDOWN_DAYS * 864e5;

  const picked = [];
  let indexedCount = 0;
  let remaining = 0;
  const all = priorityUrls();
  const statuses = new Array(all.length);
  let next = 0;
  async function worker() {
    while (next < all.length) {
      const i = next++;
      try {
        const res = await sc.urlInspection.index.inspect({
          requestBody: { inspectionUrl: all[i].url, siteUrl: SITE_URL },
        });
        statuses[i] = res.data.inspectionResult?.indexStatusResult ?? {};
      } catch (err) {
        statuses[i] = { coverageState: `ERROR: ${err.message}` };
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  for (const [i, { url, group }] of all.entries()) {
    const r = statuses[i];
    if (r.coverageState === 'Submitted and indexed') {
      indexedCount++;
      if (log[url]) log[url].indexedOn ??= today;
      continue;
    }
    if (/noindex/i.test(r.coverageState ?? '') || /BLOCKED/.test(r.indexingState ?? '')) continue;
    if (r.coverageState?.startsWith('ERROR')) continue;
    remaining++;
    if (picked.length >= COUNT) continue;
    const last = log[url]?.lastSuggested;
    if (last && Date.parse(last) > cutoff) continue;
    picked.push({ url, group, state: r.coverageState ?? '' });
  }

  for (const p of picked) {
    log[p.url] = { ...log[p.url], lastSuggested: today, timesSuggested: (log[p.url]?.timesSuggested ?? 0) + 1 };
  }
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));

  const lines = [
    `# Request Indexing queue: ${today}`,
    '',
    `Product + location pages: ${indexedCount}/${all.length} indexed, ${remaining} indexable pages still waiting.`,
    '',
    'Paste each URL into Search Console URL Inspection, then click "Request Indexing":',
    '',
    ...picked.map((p, i) => `${i + 1}. [${p.group}] ${p.url}  (${p.state})`),
  ];
  fs.writeFileSync(OUT_PATH, lines.join('\n') + '\n');
  console.log(lines.join('\n'));
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
