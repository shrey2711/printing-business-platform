// Normalise a row of public.seo_overrides for the prerenderer.
//
// That one table is written by two editors:
//   - the existing admin dashboard, which writes title / description /
//     canonical / robots / og_image_path
//   - Directus, which manages the SAME table and writes seo_title /
//     seo_description / canonical_url / robots_index / og_image
//
// Reading both here means neither editor has to write into the other's columns.
// An earlier version copied Directus's values onto the dashboard's columns
// during the build, which would blank a dashboard-set title whenever the
// matching Directus field was empty. Nothing writes back now.
//
// Precedence: the dashboard's column wins when set, because it is the more
// specific, older field and an explicit value there was set deliberately.

/** Build an absolute asset URL for a Directus file id. */
const assetUrl = (id, directusUrl) =>
  id && directusUrl ? `${String(directusUrl).replace(/\/$/, '')}/assets/${id}` : null;

const clean = (v) => {
  if (v === null || v === undefined) return null;
  const t = String(v).trim();
  return t === '' ? null : t;
};

/**
 * @param {object} row  a row of public.seo_overrides
 * @param {string} [directusUrl]  base URL, for resolving og_image file ids
 * @returns {object|null} the normalised row, or null if it should be ignored
 */
export function normaliseSeoRow(row, directusUrl) {
  if (!row || !row.path) return null;

  // Directus rows carry a status. A draft or archived override must not reach
  // the build — that is the whole point of having a status. Rows written by the
  // dashboard have no status column value and are always live.
  if (row.status && row.status !== 'published') return null;

  const faq = Array.isArray(row.faq_schema)
    ? row.faq_schema
        .map((f) => ({ question: clean(f?.question ?? f?.q), answer: clean(f?.answer ?? f?.a) }))
        .filter((f) => f.question && f.answer)
    : [];

  // noindex only when someone asked for it: either the legacy robots string, the
  // dashboard's seo_noindex flag, or Directus's robots_index unchecked. A row
  // that simply does not mention indexing leaves the page as the route built it.
  const robots =
    clean(row.robots) ||
    (row.seo_noindex === true || row.robots_index === false ? 'noindex, follow' : null);

  const out = {
    path: String(row.path).replace(/\/+$/, '') || '/',
    title: clean(row.title) || clean(row.seo_title),
    description: clean(row.description) || clean(row.seo_description),
    canonical: clean(row.canonical) || clean(row.canonical_url),
    h1: clean(row.h1),
    og_title: clean(row.og_title),
    og_description: clean(row.og_description),
    og_image_path: clean(row.og_image_path) || assetUrl(row.og_image, directusUrl),
    breadcrumb_title: clean(row.breadcrumb_title),
    schema_type: clean(row.schema_type),
    faq_schema: faq.length ? faq : null,
    jsonld: row.jsonld || null,
    robots,
    sitemap_priority: row.sitemap_priority ?? null
  };

  // A row where nothing is set would pin the page to its generated values for no
  // reason, and hides a half-finished edit behind an override that does nothing.
  const meaningful = Object.entries(out).some(([k, v]) => k !== 'path' && v !== null);
  return meaningful ? out : null;
}

/** Normalise a whole result set into { path: row }. */
export function buildSeoMap(rows, directusUrl) {
  const map = {};
  for (const raw of rows || []) {
    const row = normaliseSeoRow(raw, directusUrl);
    if (row) map[row.path] = row;
  }
  return map;
}
