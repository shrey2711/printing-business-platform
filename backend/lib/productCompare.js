// Comparison groups for near-identical products (e.g. SEG Kit A/B/C, 13oz vs
// 18oz banner). A product lists its siblings in `compareWith`; this splits its
// own spec rows and features into
//   - distinct: rows whose value is not identical on every sibling, shown first
//     as this product's key specifications (THIS product's values only), and
//   - shared:   rows identical across the whole group, shown once under
//     "shared with ...".
// Nothing is added or reworded: every row is the product's own data, so the
// page states no fact the product record does not already hold. The split is
// computed, so it stays right when a spec changes.
//
// Used by scripts/prerender.mjs, the product API (backend/app.js) and the
// React product tabs (via the `comparison` field), so all three agree.
//
// Products in a group can also carry `productSections: [{ h2, p }]`: editorial
// that only that product has (who it suits, how it differs, real setup notes).
// Rendered on the product page when present. Fill it ONLY with owner-supplied
// facts; see /workspace/seo/apextradeshow/content-needed-from-shubh.md.
const norm = (v) => String(v ?? '').trim();

export function productComparison(product, lookup) {
  const sibs = (Array.isArray(product?.compareWith) ? product.compareWith : [])
    .map((slug) => lookup(slug))
    .filter((p) => p && p.active !== false);
  if (!sibs.length || !Array.isArray(product.specs) || !product.specs.length) return null;
  const rowMap = (p) => new Map((p.specs || []).map(([k, v]) => [norm(k), norm(v)]));
  const sibMaps = sibs.map(rowMap);
  const isShared = ([k, v]) => sibMaps.every((m) => m.get(norm(k)) === norm(v));
  const distinctSpecs = product.specs.filter((r) => !isShared(r));
  const sharedSpecs = product.specs.filter(isShared);
  const feats = Array.isArray(product.features) ? product.features : [];
  const sharedFeature = (f) => sibs.every((s) => (s.features || []).map(norm).includes(norm(f)));
  return {
    siblings: sibs.map((s) => ({ slug: s.slug, name: s.name })),
    distinctSpecs,
    sharedSpecs,
    distinctFeatures: feats.filter((f) => !sharedFeature(f)),
    sharedFeatures: feats.filter(sharedFeature)
  };
}

// "A", "A and B", "A, B and C"
export const joinNames = (names) => (names.length <= 1 ? names.join('')
  : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`);
