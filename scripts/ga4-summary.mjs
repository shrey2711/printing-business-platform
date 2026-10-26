#!/usr/bin/env node
// GA4 summary for the weekly SEO report: sessions, users, engagement, key events,
// organic-search traffic, top landing pages, channels, countries, devices.
// Needs GA4_PROPERTY_ID (numeric property id, not the G- measurement id) and the
// service account (credentials/gsc-service-account.json) added as a Viewer on that property.
//
// Usage: GA4_PROPERTY_ID=123456789 node scripts/ga4-summary.mjs [--days=28]

import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEY_PATH = path.join(__dirname, '..', 'credentials', 'gsc-service-account.json');
const days = Number((process.argv.find((a) => a.startsWith('--days=')) || '--days=28').split('=')[1]);
const property = process.env.GA4_PROPERTY_ID;

if (!property) {
  console.error('GA4_PROPERTY_ID is not set; skipping GA4 (measurement id G-D8G72T46VX is in index.html, property id is in GA Admin > Property details).');
  process.exit(2);
}

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
});
const data = google.analyticsdata({ version: 'v1beta', auth });
const dateRanges = [{ startDate: `${days}daysAgo`, endDate: 'yesterday' }];
const metrics = ['sessions', 'totalUsers', 'newUsers', 'engagedSessions', 'engagementRate', 'averageSessionDuration', 'keyEvents'].map((name) => ({ name }));

async function report(dimensions, limit = 10, extra = {}) {
  const { data: res } = await data.properties.runReport({
    property: `properties/${property}`,
    requestBody: { dateRanges, dimensions: dimensions.map((name) => ({ name })), metrics, limit, ...extra },
  });
  return (res.rows || []).map((r) => ({
    dims: r.dimensionValues.map((d) => d.value),
    ...Object.fromEntries(metrics.map((m, i) => [m.name, Number(r.metricValues[i].value)])),
  }));
}

const organic = { dimensionFilter: { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'Organic Search' } } } };
const out = {
  days,
  totals: await report([], 1),
  organicTotals: await report([], 1, organic),
  channels: await report(['sessionDefaultChannelGroup']),
  organicLandingPages: await report(['landingPage'], 15, organic),
  countries: await report(['country']),
  devices: await report(['deviceCategory']),
  keyEventsByName: await (async () => {
    const { data: res } = await data.properties.runReport({
      property: `properties/${property}`,
      requestBody: { dateRanges, dimensions: [{ name: 'eventName' }], metrics: [{ name: 'eventCount' }], limit: 25, orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }] },
    });
    return (res.rows || []).map((r) => ({ event: r.dimensionValues[0].value, count: Number(r.metricValues[0].value) }));
  })(),
};
fs.mkdirSync(path.join(__dirname, '..', 'reports'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'reports', 'ga4-summary.json'), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
