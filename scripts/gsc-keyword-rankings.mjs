#!/usr/bin/env node
// Pulls keyword query performance (clicks, impressions, CTR, avg position) from
// Google Search Console via the service account in credentials/gsc-service-account.json.
// Paginates through the full result set (GSC caps each page at 25,000 rows).
//
// Usage:
//   node scripts/gsc-keyword-rankings.mjs [--days=480] [--limit=25000] [--url=https://www.apextradeshow.com/]

import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEY_PATH = path.join(__dirname, '..', 'credentials', 'gsc-service-account.json');

function parseArgs() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((arg) => {
      const [key, value] = arg.replace(/^--/, '').split('=');
      return [key, value ?? true];
    })
  );
  return {
    days: Number(args.days ?? 480), // 480 days = GSC's max retention (~16 months)
    limit: Number(args.limit ?? Infinity), // fetch all rows via pagination
    siteUrl: args.url ?? 'https://www.apextradeshow.com/',
  };
}

const PAGE_SIZE = 25000; // GSC API max rowLimit per request

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

async function main() {
  const { days, limit, siteUrl } = parseArgs();

  if (!fs.existsSync(KEY_PATH)) {
    console.error(`Missing service account key at ${KEY_PATH}`);
    process.exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_PATH,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const searchconsole = google.searchconsole({ version: 'v1', auth });

  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 2); // GSC data lags ~2 days
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);

  const rows = [];
  let startRow = 0;
  while (rows.length < limit) {
    const pageSize = Math.min(PAGE_SIZE, limit - rows.length);
    const res = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query'],
        rowLimit: pageSize,
        startRow,
      },
    });
    const page = res.data.rows ?? [];
    rows.push(...page);
    if (page.length < pageSize) break; // no more pages
    startRow += page.length;
  }
  if (rows.length === 0) {
    console.log('No query data returned. The property may be too new or have no impressions yet.');
    return;
  }

  rows.sort((a, b) => b.impressions - a.impressions);

  console.log(`\nKeyword rankings for ${siteUrl}`);
  console.log(`Range: ${formatDate(startDate)} to ${formatDate(endDate)} (${days} days)\n`);
  console.log(
    ['Query', 'Clicks', 'Impressions', 'CTR', 'Avg Position'].join('\t')
  );
  for (const row of rows) {
    const [query] = row.keys;
    console.log(
      [
        query,
        row.clicks,
        row.impressions,
        `${(row.ctr * 100).toFixed(2)}%`,
        row.position.toFixed(1),
      ].join('\t')
    );
  }

  const outDir = path.join(__dirname, '..', 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'gsc-keyword-rankings.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        siteUrl,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        rows: rows.map((r) => ({
          query: r.keys[0],
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: r.ctr,
          position: r.position,
        })),
      },
      null,
      2
    )
  );
  console.log(`\nSaved full JSON report to ${path.relative(process.cwd(), outPath)}`);
}

main().catch((err) => {
  console.error('Failed to fetch Search Console data:', err.message);
  if (err.errors) console.error(err.errors);
  process.exit(1);
});
