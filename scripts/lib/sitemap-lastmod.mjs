// Per-URL sitemap <lastmod> from each page's OWN content sources.
//
// Before this, every page of a type shared one date: the last commit to the
// type's whole data file (all 36 products got the date of the newest edit to
// any product). Search engines learn to ignore lastmod that moves in bulk.
//
// Now each sitemap URL declares the source records it is built from (its own
// object in backend/data/products.js, its city record in citySeo.js, the route
// block in scripts/prerender.mjs for hand-written pages, ...). Its lastmod is
// the newest commit date among exactly those lines (git blame), so editing one
// product moves one product's lastmod. Shared template/layout code is NOT a
// source: a site-wide boilerplate edit is not a change to a page's main content.
//
// Shallow clones (Vercel clones with limited depth) cannot blame reliably:
// lines older than the shallow boundary are attributed to the boundary commit,
// which would bulk-stamp again. So the dates are also committed in
// scripts/data/sitemap-lastmod.json together with a fingerprint (hash of the
// exact source text). Resolution order, all deterministic for a given commit:
//   1. full git history  -> git blame of the source lines (ground truth)
//   2. shallow / no git  -> manifest date, when the fingerprint still matches
//   3. fingerprint changed and no usable history -> date of the HEAD commit
//      (an upper bound on when the change was committed; never "now")
//   4. no git at all     -> the manifest's last known date, even if stale
//   5. nothing available -> no <lastmod> for that URL
// Regenerate the manifest after content edits: `npm run sitemap:lastmod`
// (needs full history). `npm run sitemap:lastmod -- --check` exits 1 if stale.
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join } from 'path';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function createLastmodResolver(root) {
  const manifestPath = join(root, 'scripts', 'data', 'sitemap-lastmod.json');
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { urls: {} };
  const git = (args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 256 * 1024 * 1024 });

  let gitOk = false;
  let shallow = true;
  let headDate = null;
  try {
    shallow = git(['rev-parse', '--is-shallow-repository']).trim() !== 'false';
    headDate = git(['log', '-1', '--format=%cs', 'HEAD']).trim() || null;
    if (headDate && !DATE_RE.test(headDate)) headDate = null;
    gitOk = true;
  } catch { gitOk = false; }
  const historyOk = gitOk && !shallow && process.env.SITEMAP_LASTMOD_NO_GIT !== '1';

  const fileCache = new Map();
  const fileText = (f) => {
    if (!fileCache.has(f)) fileCache.set(f, readFileSync(join(root, f), 'utf8'));
    return fileCache.get(f);
  };

  // Per-line commit dates (YYYY-MM-DD in the committer's own zone, like %cs).
  const blameCache = new Map();
  const blameDates = (f) => {
    if (blameCache.has(f)) return blameCache.get(f);
    const dates = [];
    const out = git(['blame', '--line-porcelain', '--', f]);
    let t = null, tz = null;
    for (const line of out.split('\n')) {
      if (line.startsWith('committer-time ')) t = Number(line.slice(15));
      else if (line.startsWith('committer-tz ')) tz = line.slice(13);
      else if (line.startsWith('\t')) {
        const m = /^([+-])(\d\d)(\d\d)$/.exec(tz || '+0000');
        const off = m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0;
        dates.push(new Date((t + off * 60) * 1000).toISOString().slice(0, 10));
      }
    }
    blameCache.set(f, dates);
    return dates;
  };

  // Bracket depth before each character, ignoring strings and comments.
  const depthCache = new Map();
  const scan = (f) => {
    if (depthCache.has(f)) return depthCache.get(f);
    const s = fileText(f);
    const depth = new Int32Array(s.length + 1);
    let d = 0, i = 0, mode = null; // mode: ' " ` // /* re
    let last = '', reClass = false;
    const tplStack = [];
    while (i < s.length) {
      depth[i] = d;
      const c = s[i], n = s[i + 1];
      if (mode === '//') { if (c === '\n') mode = null; i++; continue; }
      if (mode === '/*') { if (c === '*' && n === '/') { mode = null; depth[i + 1] = d; i += 2; continue; } i++; continue; }
      if (mode === "'" || mode === '"') { if (c === '\\') { depth[i + 1] = d; i += 2; continue; } if (c === mode || c === '\n') mode = null; i++; continue; }
      if (mode === '`') {
        if (c === '\\') { depth[i + 1] = d; i += 2; continue; }
        if (c === '`') { mode = null; i++; continue; }
        if (c === '$' && n === '{') { tplStack.push(d); mode = null; d++; depth[i + 1] = d; i += 2; continue; }
        i++; continue;
      }
      if (mode === 're') {
        if (c === '\\') { depth[i + 1] = d; i += 2; continue; }
        if (c === '[') reClass = true;
        else if (c === ']') reClass = false;
        else if (c === '/' && !reClass) mode = null;
        i++; continue;
      }
      if (c === '/' && n === '/') { mode = '//'; i++; continue; }
      if (c === '/' && n === '*') { mode = '/*'; i++; continue; }
      if (c === "'" || c === '"' || c === '`') { mode = c; last = c; i++; continue; }
      // Regex literal: a `/` where an expression is expected.
      if (c === '/' && (last === '' || '(,=:[!&|?{};+-*%<>~^'.includes(last) || /\b(?:return|typeof|case)$/.test(s.slice(Math.max(0, i - 8), i).trimEnd()))) {
        mode = 're'; reClass = false; i++; continue;
      }
      if (!/\s/.test(c)) last = c;
      if (c === '{' || c === '[' || c === '(') d++;
      else if (c === '}' || c === ']' || c === ')') {
        d--;
        if (c === '}' && tplStack.length && tplStack[tplStack.length - 1] === d) { tplStack.pop(); mode = '`'; }
      }
      i++;
    }
    depth[s.length] = d;
    if (d !== 0) console.warn(`sitemap-lastmod: bracket scan of ${f} ended at depth ${d}; record spans may be wrong.`);
    const lineStarts = [0];
    for (let k = 0; k < s.length; k++) if (s[k] === '\n') lineStarts.push(k + 1);
    const res = { s, depth, lineStarts };
    depthCache.set(f, res);
    return res;
  };
  const lineOf = (lineStarts, pos) => {
    let lo = 0, hi = lineStarts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lineStarts[mid] <= pos) lo = mid; else hi = mid - 1; }
    return lo; // 0-based
  };
  // Enclosing bracket span of position p: [openPos, closePos]. outermost=true
  // returns the top-level (depth 0 -> 1) bracket around p.
  const enclosing = (f, p, outermost) => {
    const { s, depth } = scan(f);
    const d0 = depth[p];
    if (d0 === 0) return null;
    const target = outermost ? 1 : d0;
    let a = p;
    while (a > 0 && !(depth[a] === target - 1 && '{[('.includes(s[a]) && depth[a + 1] === target)) a--;
    let b = p;
    while (b < s.length && !(depth[b] === target && '}])'.includes(s[b]) && depth[b + 1] === target - 1)) b++;
    return [a, b];
  };

  // A source is { file } (whole file), { file, key } (the record(s) whose
  // `slug: 'key'` or `key: {` sits at the shallowest depth), { file, find, outermost }
  // (record enclosing the first regex match) or { file, lines } (every line
  // matching the regex). Returns [{ file, from, to }] 0-based inclusive lines.
  const spansFor = (src) => {
    const { s, lineStarts } = scan(src.file);
    const total = lineStarts.length;
    if (!src.key && !src.find && !src.lines) return [{ file: src.file, from: 0, to: total - 1 }];
    if (src.lines) {
      const out = [];
      s.split('\n').forEach((l, i) => { if (src.lines.test(l)) out.push({ file: src.file, from: i, to: i }); });
      return out;
    }
    let cands = [];
    if (src.key) {
      const k = src.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(?:\\bslug:\\s*['"]${k}['"])|(?:^[ \\t]*['"]?${k}['"]?\\s*:\\s*[{[])`, 'gm');
      for (const m of s.matchAll(re)) {
        // For `key: {` the record is the bracket that follows; for `slug:` the one around it.
        const p = m[0].includes('slug') ? m.index : m.index + m[0].length - 1 + 1;
        const sp = enclosing(src.file, p, false);
        if (sp) cands.push({ sp, d: scan(src.file).depth[p] });
      }
      if (cands.length) {
        const min = Math.min(...cands.map((c) => c.d));
        cands = cands.filter((c) => c.d === min);
      }
    } else {
      const m = src.find.exec(s);
      if (m) { const sp = enclosing(src.file, m.index, !!src.outermost); if (sp) cands.push({ sp }); }
    }
    return cands.map(({ sp }) => ({ file: src.file, from: lineOf(lineStarts, sp[0]), to: lineOf(lineStarts, sp[1]) }));
  };

  const results = new Map(); // url -> { lastmod, fp, via }
  const stats = { blame: 0, manifest: 0, head: 0, stale: 0, none: 0, missingSource: [] };

  const resolve = (url, sources) => {
    const spans = sources.flatMap((src) => {
      const sp = spansFor(src);
      if (!sp.length && !src.optional) stats.missingSource.push(`${url} <- ${src.file}${src.key ? `#${src.key}` : ''}`);
      return sp;
    });
    const h = createHash('sha256');
    for (const sp of spans) {
      const lines = fileText(sp.file).split('\n').slice(sp.from, sp.to + 1).join('\n');
      h.update(`${sp.file}\n${lines}\n\0`);
    }
    const fp = h.digest('hex').slice(0, 16);
    let lastmod = null, via = 'none';
    if (historyOk && spans.length) {
      try {
        for (const sp of spans) {
          const d = blameDates(sp.file);
          for (let i = sp.from; i <= sp.to && i < d.length; i++) if (!lastmod || d[i] > lastmod) lastmod = d[i];
        }
        via = 'blame';
      } catch { lastmod = null; }
    }
    const m = manifest.urls?.[url];
    if (!lastmod && m && m.fp === fp && DATE_RE.test(m.lastmod)) { lastmod = m.lastmod; via = 'manifest'; }
    if (!lastmod && headDate) {
      // Content changed since the manifest was written. HEAD's date bounds the change.
      lastmod = m && DATE_RE.test(m.lastmod) && m.lastmod > headDate ? m.lastmod : headDate;
      via = 'head';
    }
    // No git at all and the fingerprint changed: keep the last known date rather than none.
    if (!lastmod && m && DATE_RE.test(m.lastmod)) { lastmod = m.lastmod; via = 'stale'; }
    stats[via]++;
    results.set(url, { lastmod, fp, via });
    return lastmod;
  };

  const staleEntries = () => {
    const out = [];
    for (const [url, r] of results) {
      const m = manifest.urls?.[url];
      if (!m || m.fp !== r.fp || (r.via === 'blame' && m.lastmod !== r.lastmod)) out.push(url);
    }
    for (const url of Object.keys(manifest.urls || {})) if (!results.has(url)) out.push(`${url} (no longer in sitemap)`);
    return out;
  };

  const writeManifest = () => {
    if (!historyOk) throw new Error('sitemap-lastmod: full git history is required to regenerate the manifest (run `git fetch --unshallow`).');
    const urls = {};
    for (const url of [...results.keys()].sort()) urls[url] = { lastmod: results.get(url).lastmod, fp: results.get(url).fp };
    writeFileSync(manifestPath, JSON.stringify({ note: 'Generated by `npm run sitemap:lastmod`. Per-URL content-source fingerprint + last content-change date (git blame). Used when the build has no full git history.', urls }, null, 2) + '\n');
    return manifestPath;
  };

  return { resolve, spansFor, stats, staleEntries, writeManifest, historyOk, shallow, headDate };
}
