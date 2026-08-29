// §18 false-local-claim gate. Apex is online-only: it prints to order and
// ships. No page may suggest a physical presence in a city, a special delivery
// arrangement with a venue, or a partnership with an event organiser.
//
// This runs over the RENDERED pages rather than the content data, so template
// copy, schema and CTAs are covered too — and over EVERY city × category page,
// not just the trade-show-displays hub.
//
// It also checks the positive side: each page must state the ships-to
// positioning at least once, so "no false claim" is not satisfied by a page
// that simply says nothing about where Apex is.
//
// Usage: node scripts/audit-city-local-claims.mjs [--list]

import { readFileSync, existsSync } from 'fs';
import { LOCAL_CATEGORIES, SEO_CITIES } from '../src/data/citySeo.js';

const DIST = 'dist';
const list = process.argv.includes('--list');
const fails = [];

const FORBIDDEN = [
  // physical presence
  [/\bour\s+(?:[A-Z][a-z]+\s+)?(?:office|warehouse|showroom|facility|factory|plant|store|shop|studio)\b/i, 'claims a company-owned local facility'],
  [/\blocal (?:office|warehouse|showroom|facility|production|manufacturing|printing|print shop|team|crew|staff)\b/i, 'claims a local operation'],
  // only fires when APEX is the subject — a city page may legitimately say that
  // other companies are headquartered locally (that is local business context).
  [/\b(?:we are|we're|apex is|apex,? (?:which|who) is)\s+(?:based|located|headquartered|situated)\s+in\b/i, 'claims a physical location for Apex'],
  [/\bapex\b[^.]{0,40}\b(?:based|located|headquartered)\s+in\b/i, 'claims a physical location for Apex'],
  [/\bour (?:home|base) (?:is )?in\b/i, 'claims a physical location for Apex'],
  [/\bvisit (?:our|us at)\b|\bstop by our\b|\bcome see us at\b/i, 'invites a visit to a physical place'],
  [/\bproduced (?:locally|in[- ]city)\b|\bprinted (?:locally|in [A-Z][a-z]+ itself)\b|\bmade in [A-Z][a-z]+ by us\b/i, 'claims local production'],
  [/\bnearest (?:branch|location|depot)\b|\bpickup (?:available|from our)\b|\bwill[- ]call\b/i, 'implies a local pickup point'],
  [/\bserving [A-Z][a-z]+ since\b|\byears in [A-Z][a-z]+\b/i, 'implies a local operating history'],
  // venue / organiser relationships
  [/\bofficial (?:supplier|vendor|partner|sponsor|provider)\b/i, 'claims official supplier or partner status'],
  [/\bpreferred (?:vendor|supplier)\b|\bapproved vendor\b/i, 'claims preferred-vendor status'],
  [/\bwe (?:have|hold) an? (?:arrangement|account|agreement|contract) with\b/i, 'claims an arrangement with a venue or organiser'],
  [/\bdirect (?:access|line) to the (?:dock|venue|floor)\b|\bwe deliver (?:straight|direct(?:ly)?) to the (?:floor|booth|dock)\b/i, 'claims a special delivery arrangement'],
  [/\bin partnership with\b|\bpartnered with\b|\bour partner venue\b/i, 'claims a partnership'],
  [/\bon[- ]site (?:team|support|install(?:ation)?) (?:in|at)\b/i, 'claims local on-site service']
];

// Positive: the page must say what Apex actually does.
const SHIPS_TO = /\bships? (?:custom-printed |your |every |to |them to |it to )|\bshipped to\b|\bwe ship\b|\bships to\b/i;

const text = (h) => h
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ');

let checked = 0;
for (const cat of LOCAL_CATEGORIES) {
  for (const city of SEO_CITIES) {
    const file = `${DIST}/${cat.slug}/${city.slug}/index.html`;
    if (!existsSync(file)) continue;
    const body = text(readFileSync(file, 'utf8'));
    checked++;
    const where = `${cat.slug}/${city.slug}`;

    for (const [re, why] of FORBIDDEN) {
      const m = body.match(re);
      if (m) fails.push(`${where}: ${why} — "${m[0].trim()}"`);
    }
    if (!SHIPS_TO.test(body)) fails.push(`${where}: never states the ships-to positioning`);

    // schema must not assert a local business or a physical address
    const raw = readFileSync(file, 'utf8');
    for (const bad of ['LocalBusiness', 'PostalAddress', 'geo', 'openingHours']) {
      if (new RegExp(`"${bad}"`).test(raw)) fails.push(`${where}: JSON-LD contains ${bad}, which asserts a physical presence`);
    }
  }
}

if (list) console.log(`checked ${checked} city × category pages`);
if (fails.length) {
  console.error(`\n✗ LOCAL CLAIM GATE FAILED — ${fails.length} issue(s):`);
  fails.slice(0, 40).forEach((f) => console.error(`  ✗ ${f}`));
  if (fails.length > 40) console.error(`  … and ${fails.length - 40} more`);
  process.exit(1);
}
console.log(`✓ LOCAL CLAIMS OK — ${checked} city × category pages: no local office, warehouse, production, showroom, pickup point, venue arrangement or event partnership claimed, no LocalBusiness/address schema, and every page states the ships-to positioning.`);
