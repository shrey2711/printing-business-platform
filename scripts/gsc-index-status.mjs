#!/usr/bin/env node
// Checks Google's index status for every URL in the built sitemaps using the
// Search Console URL Inspection API (quota: 2,000 URLs/day, 600/min).
//
// Usage: node scripts/gsc-index-status.mjs [--limit=N]

import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const KEY_PATH = path.join(ROOT, 'credentials', 'gsc-service-account.json');
const SITE_URL = 'https://www.apextradeshow.com/';
const CONCURRENCY = 5;

const limitArg = process.argv.find((a) => a.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : Infinity;

function sitemapUrls() {
  const dist = path.join(ROOT, 'dist');
  const urls = new Set();
  for (const f of fs.readdirSync(dist)) {
    if (!/^sitemap-.*\.xml$/.test(f)) continue;
    const xml = fs.readFileSync(path.join(dist, f), 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.add(m[1].trim());
  }
  return [...urls];
}

async function main() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const sc = google.searchconsole({ version: 'v1', auth });

  const urls = sitemapUrls().slice(0, limit);
  const results = [];
  let i = 0;

  async function worker() {
    while (i < urls.length) {
      const url = urls[i++];
      try {
        const res = await sc.urlInspection.index.inspect({
          requestBody: { inspectionUrl: url, siteUrl: SITE_URL },
        });
        const r = res.data.inspectionResult?.indexStatusResult ?? {};
        results.push({
          url,
          verdict: r.verdict ?? '',
          coverageState: r.coverageState ?? '',
          robotsTxtState: r.robotsTxtState ?? '',
          indexingState: r.indexingState ?? '',
          lastCrawlTime: r.lastCrawlTime ?? '',
          googleCanonical: r.googleCanonical ?? '',
          userCanonical: r.userCanonical ?? '',
          sitemap: (r.sitemap ?? []).join(', '),
          referringUrls: (r.referringUrls ?? []).length,
        });
      } catch (err) {
        results.push({ url, verdict: 'ERROR', coverageState: err.message });
      }
      if (results.length % 25 === 0) console.log(`${results.length}/${urls.length}`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  results.sort((a, b) => a.url.localeCompare(b.url));

  fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'reports', 'gsc-index-status.json'), JSON.stringify(results, null, 2));

  const counts = {};
  for (const r of results) counts[r.coverageState] = (counts[r.coverageState] ?? 0) + 1;
  console.log(`\nInspected ${results.length} URLs`);
  for (const [state, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`${n}\t${state}`);
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
