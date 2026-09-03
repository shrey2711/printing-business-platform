// Create/update the Apex content model in a running Directus instance.
//
// Idempotent: every collection and field is created only if missing, so this can
// be re-run after edits without destroying data. It never deletes anything.
//
//   cd directus
//   DIRECTUS_URL=http://localhost:8055 DIRECTUS_ADMIN_TOKEN=xxx node scripts/apply-schema.mjs
//   node scripts/apply-schema.mjs --dry-run     # print the plan, change nothing
//
// Afterwards, capture the result as version-controlled YAML:
//   docker compose exec directus npx directus schema snapshot --yes ./schema/snapshot.yaml
//
// PRICING: editors CAN change prices here. What they cannot change is the
// engine — the area maths, size caps, minimum charges and matrix shape stay in
// backend/data/pricing.js. A price edit is composed onto the product's real
// pricing block by backend/lib/pricingFromCms.js, re-priced across every
// selection by validatePricingBlock(), recorded in pricing_audit, and only then
// does it reach checkout. A change beyond +/-40% needs explicit confirmation.
//
// SCOPE NOTE — what is deliberately NOT modelled here:
//   * The 20-city SEO content (src/data/cityDetail.js). It is enforced by 31
//     build gates; moving it needs the sync layer proven first.

const URL_BASE = (process.env.DIRECTUS_URL || 'http://localhost:8055').replace(/\/$/, '');
const TOKEN = process.env.DIRECTUS_ADMIN_TOKEN || process.env.DIRECTUS_TOKEN;
const DRY = process.argv.includes('--dry-run');

if (!TOKEN && !DRY) {
  console.error('Set DIRECTUS_ADMIN_TOKEN (Settings -> Access Tokens, admin role).');
  process.exit(1);
}

// ---------------------------------------------------------------- field kit --
const F = {
  string: (field, opts = {}) => ({ field, type: 'string', meta: { interface: 'input', ...opts.meta }, schema: { is_nullable: opts.required !== true, ...opts.schema } }),
  slug: (field = 'slug') => ({ field, type: 'string', meta: { interface: 'input', note: 'URL segment. Must match the storefront route exactly — changing it changes the page URL.', options: { slug: true } }, schema: { is_nullable: false, is_unique: true } }),
  text: (field, note) => ({ field, type: 'text', meta: { interface: 'input-multiline', note }, schema: { is_nullable: true } }),
  rich: (field, note) => ({ field, type: 'text', meta: { interface: 'input-rich-text-html', note }, schema: { is_nullable: true } }),
  bool: (field, def = false, note) => ({ field, type: 'boolean', meta: { interface: 'boolean', note }, schema: { default_value: def, is_nullable: false } }),
  int: (field, note) => ({ field, type: 'integer', meta: { interface: 'input', note }, schema: { is_nullable: true } }),
  decimal: (field, note) => ({ field, type: 'decimal', meta: { interface: 'input', note }, schema: { numeric_precision: 10, numeric_scale: 2, is_nullable: true } }),
  date: (field, note) => ({ field, type: 'timestamp', meta: { interface: 'datetime', note }, schema: { is_nullable: true } }),
  select: (field, choices, note) => ({ field, type: 'string', meta: { interface: 'select-dropdown', note, options: { choices: choices.map((c) => (typeof c === 'string' ? { text: c, value: c } : c)) } }, schema: { is_nullable: true } }),
  file: (field, note) => ({ field, type: 'uuid', meta: { interface: 'file-image', special: ['file'], note }, schema: { is_nullable: true } }),
  files: (field, note) => ({ field, type: 'alias', meta: { interface: 'files', special: ['files'], note } }),
  json: (field, note, opts = {}) => ({ field, type: 'json', meta: { interface: opts.interface || 'list', note, options: opts.options || {} }, schema: { is_nullable: true } }),
  sort: () => ({ field: 'sort', type: 'integer', meta: { interface: 'input', hidden: true }, schema: { is_nullable: true } }),
  status: () => ({
    field: 'status', type: 'string',
    meta: {
      interface: 'select-dropdown', width: 'half',
      note: 'Only "published" items are pulled into the site build.',
      options: { choices: [{ text: 'Published', value: 'published' }, { text: 'Draft', value: 'draft' }, { text: 'Archived', value: 'archived' }] }
    },
    schema: { default_value: 'draft', is_nullable: false }
  })
};

// SEO fields shared by every routable collection. Field lengths mirror the
// limits the existing audits enforce (title 45-62, description 140-165).
const SEO = [
  F.string('seo_title', { meta: { note: 'SERP title. The audits expect 45-62 characters; longer titles truncate.', group: 'seo' } }),
  F.text('seo_description', 'Meta description. The audits expect 140-165 characters.'),
  F.bool('seo_noindex', false, 'Hide this page from search engines. Leave off unless you mean it.'),
  F.string('canonical_url', { meta: { note: 'Only set this to point search engines at a different URL. Normally blank.' } })
];

// The fuller SEO tab from section 2. SEO (above) stays as the minimal set used
// by collections that only need title/description.
const SEO_FULL = [
  ...SEO,
  F.string('h1', { meta: { note: 'Visible H1. Exactly one per page — the QA gate fails a page with none or two.' } }),
  F.string('og_title', { meta: { note: 'Social share title. Falls back to the SEO title when blank.' } }),
  F.text('og_description', 'Social share description. Falls back to the meta description.'),
  F.file('og_image', 'Social share image. 1200x630 renders best.'),
  F.select('schema_type', ['WebPage', 'Product', 'Article', 'FAQPage', 'CollectionPage'], 'Structured-data type for this page. Leave as generated unless you know why you are changing it.'),
  F.json('faq_schema', 'Extra FAQ entries for structured data. These MUST also be visible on the page — schema that does not match visible content is a manual-action risk.', {
    options: { fields: [
      { field: 'q', name: 'Question', type: 'string', meta: { interface: 'input' } },
      { field: 'a', name: 'Answer', type: 'text', meta: { interface: 'input-multiline' } }
    ] }
  }),
  F.bool('robots_index', true, 'Uncheck to noindex this page. Unchecking removes it from Google.')
];

const FAQ_REPEATER = F.json('faqs', 'Question and answer pairs. Rendered on the page AND emitted as FAQPage structured data, so they must match what visitors see.', {
  interface: 'list',
  options: { fields: [
    { field: 'q', name: 'Question', type: 'string', meta: { interface: 'input', width: 'full', required: true } },
    { field: 'a', name: 'Answer', type: 'text', meta: { interface: 'input-multiline', width: 'full', required: true } }
  ] }
});

// --------------------------------------------------------------- collections --
// Order matters: a collection referenced by a relation must be created first.
const COLLECTIONS = [
  {
    collection: 'categories',
    meta: { icon: 'category', note: 'Product categories. These map to the existing category pages (/custom-canopies, /banner-stands, …) — the slug MUST match the live route or the page moves.', archive_field: 'status', archive_value: 'archived', sort_field: 'sort' },
    fields: [
      F.status(), F.sort(), F.slug(),
      F.string('name', { required: true }),
      F.text('description', 'Intro paragraph shown under the category heading.'),
      F.file('image'),
      ...SEO
    ]
  },
  {
    collection: 'products',
    meta: { icon: 'inventory_2', note: 'Product content and prices. Pricing values feed the engine through a validated path — see product_pricing.', archive_field: 'status', archive_value: 'archived', sort_field: 'sort' },
    fields: [
      F.status(), F.sort(), F.slug(),
      F.string('title', { required: true }),
      F.string('sku'),
      F.text('short_description', 'One or two lines used on cards and listings.'),
      F.rich('description', 'Full product description.'),
      // category relation is created after both collections exist (see RELATIONS)
      F.decimal('regular_price', 'Headline price. For configurator products this is the "from" price; the engine still computes the exact total.'),
      F.decimal('sale_price', 'Optional promotional price. Leave blank when not on sale.'),
      F.decimal('compare_price', 'Was-price shown struck through. Display only.'),
      F.decimal('cost_price', 'Internal cost. Never shown on the site.'),
      F.file('featured_image'),
      F.files('gallery', 'Product photography. Alt text comes from each file title — fill it in, the image audit fails a build on a missing alt.'),
      F.json('variants', 'Selectable variants shown on the product page.', { options: { fields: [
        { field: 'label', name: 'Label', type: 'string', meta: { interface: 'input' } },
        { field: 'value', name: 'Value', type: 'string', meta: { interface: 'input' } },
        { field: 'sku', name: 'SKU', type: 'string', meta: { interface: 'input' } }
      ] } }),
      F.json('specifications', 'Specification rows. Published product facts — do not enter figures that are not verified.', { options: { fields: [
        { field: 'label', name: 'Label', type: 'string', meta: { interface: 'input' } },
        { field: 'value', name: 'Value', type: 'string', meta: { interface: 'input' } }
      ] } }),
      F.json('artwork_options', 'Artwork choices offered for this product.'),
      F.int('production_days', 'Production time in business days. The site currently states 6-8 standard, 2-3 rush; changing this changes a published promise.'),
      F.int('shipping_days', 'Typical transit time. Leave blank rather than guessing — transit varies by destination.'),
      F.bool('featured', false, 'Show in featured placements.'),
      F.bool('bestseller', false, 'Show a bestseller badge.'),
      F.bool('active', true, 'Uncheck to hide the product without deleting it.'),
      FAQ_REPEATER,
      ...SEO_FULL
    ]
  },
  {
    collection: 'product_pricing',
    meta: { icon: 'sell', note: 'Prices. Only the values below can move. The pricing engine keeps its maths, caps and minimum charges in code. Every change is validated, recorded and pushed live.' },
    fields: [
      F.status(),
      F.string('product_slug', { required: true, meta: { note: 'Must match the product exactly, e.g. canopy-tent-10x10.' } }),
      F.decimal('base_price', 'Headline price for the first quantity tier — the number shown as "from $X".'),
      F.decimal('price_per_sqft', 'Square-foot rate. Banners only; leave blank for everything else.'),
      F.decimal('min_charge', 'Minimum charge for square-foot pricing (currently $45 per banner). Raising this raises the floor for small orders.'),
      F.json('tiers', 'Quantity-break prices. "min" must match an existing tier on the product.', { options: { fields: [
        { field: 'min', name: 'Quantity from', type: 'integer', meta: { interface: 'input' } },
        { field: 'price', name: 'Price', type: 'decimal', meta: { interface: 'input' } }
      ] } }),
      F.json('option_prices', 'Add-on amounts: printed walls, flag bases, finishing. Group and choice must already exist on the product.', { options: { fields: [
        { field: 'group', name: 'Option group', type: 'string', meta: { interface: 'input' } },
        { field: 'choice', name: 'Choice', type: 'string', meta: { interface: 'input' } },
        { field: 'price', name: 'Added price', type: 'decimal', meta: { interface: 'input' } }
      ] } }),
      F.json('option_multipliers', 'Percentage-style upgrades, e.g. double-sided printing. 1 = no change, 1.25 = +25%. Range 0-5.', { options: { fields: [
        { field: 'group', name: 'Option group', type: 'string', meta: { interface: 'input' } },
        { field: 'choice', name: 'Choice', type: 'string', meta: { interface: 'input' } },
        { field: 'mult', name: 'Multiplier', type: 'decimal', meta: { interface: 'input' } }
      ] } }),
      F.bool('confirm_large_change', false, 'Tick only when you intend a change of more than 40%. Without it, a large swing is refused.'),
      F.text('change_note', 'Why this price changed. Stored with the audit record.')
    ]
  },
  {
    collection: 'pages',
    meta: { icon: 'description', note: 'Standalone pages: home, about, contact, privacy, terms, custom printing. Category pages live in `categories`, not here — two records claiming one URL would fight.', archive_field: 'status', archive_value: 'archived' },
    fields: [
      F.status(), F.slug(),
      F.string('page_title', { required: true }),
      F.string('h1', { meta: { note: 'The visible H1. Exactly one per page — the QA gate fails a page with none or two.' } }),
      F.rich('content', 'Page body.'),
      F.file('hero_image'),
      F.string('cta_text'), F.string('cta_button'), F.string('cta_link'),
      ...SEO_FULL
    ]
  },
  {
    collection: 'home_hero',
    meta: { icon: 'view_carousel', note: 'Homepage hero. One record.', singleton: true },
    fields: [
      F.string('headline'), F.text('subheadline'),
      F.string('button_text'), F.string('button_link'),
      F.file('background_image')
    ]
  },
  {
    collection: 'home_featured_categories',
    meta: { icon: 'grid_view', note: 'Featured category tiles on the homepage.', sort_field: 'sort' },
    fields: [
      F.status(), F.sort(),
      F.file('image'), F.string('title'), F.string('link', { meta: { note: 'Site-relative path. A broken link fails the build.' } })
    ]
  },
  {
    collection: 'home_why_choose_us',
    meta: { icon: 'verified', note: 'Why-choose-us points on the homepage.', sort_field: 'sort' },
    fields: [
      F.status(), F.sort(),
      F.string('icon', { meta: { note: 'Icon name or emoji.' } }),
      F.string('title'), F.text('description')
    ]
  },
  {
    collection: 'testimonials',
    meta: { icon: 'format_quote', note: 'Customer reviews. Only publish reviews you actually received — review content is a factual claim and the schema audit refuses invented ratings.', archive_field: 'status', archive_value: 'archived', sort_field: 'sort' },
    fields: [
      F.status(), F.sort(),
      F.string('name'), F.string('company'),
      F.int('rating', 'Whole number 1-5.'),
      F.file('photo'), F.text('review')
    ]
  },
  {
    collection: 'home_cta_banner',
    meta: { icon: 'ads_click', note: 'Closing call-to-action band on the homepage. One record.', singleton: true },
    fields: [
      F.string('headline'), F.text('description'),
      F.string('button_text'), F.string('button_link'), F.file('background_image')
    ]
  },
  {
    collection: 'navigation',
    meta: { icon: 'menu', note: 'Header, footer and mega menus. Drag to reorder; drop an item onto another to nest it.', sort_field: 'sort' },
    fields: [
      F.status(), F.sort(),
      F.select('menu', [
        { text: 'Header', value: 'header' },
        { text: 'Mega menu', value: 'mega' },
        { text: 'Footer — Shop', value: 'footer_shop' },
        { text: 'Footer — Company', value: 'footer_company' },
        { text: 'Footer — Support', value: 'footer_support' }
      ], 'Which menu this item belongs to.'),
      F.string('label', { required: true }),
      F.string('url', { meta: { note: 'Site-relative path, e.g. /custom-canopies. The link audit fails the build on a broken link.' } })
      // `parent` self-relation is added in RELATIONS below
    ]
  },
  {
    collection: 'blogs',
    meta: { icon: 'article', note: 'Learning Center articles.', archive_field: 'status', archive_value: 'archived', sort_field: 'sort' },
    fields: [
      F.status(), F.sort(), F.slug(),
      F.string('title', { required: true }),
      F.file('featured_image'),
      F.text('excerpt', 'One or two sentences, used on listings and as the fallback meta description.'),
      F.rich('content', 'The article itself.'),
      F.string('author'),
      F.date('publish_date'),
      F.json('tags', 'Free-text tags.'),
      FAQ_REPEATER,
      ...SEO_FULL
    ]
  },
  {
    collection: 'redirects',
    meta: { icon: 'call_split', note: 'URL redirects. Exported into the Vercel edge middleware at build time — see scripts/export-redirects.mjs.' },
    fields: [
      F.status(),
      F.string('old_url', { required: true, meta: { note: 'Path to redirect FROM, e.g. /old-page. Must start with /.' } }),
      F.string('new_url', { required: true, meta: { note: 'Path to redirect TO. Must resolve, or the redirect sends visitors to a 404.' } }),
      F.select('code', [
        { text: '301 — permanent (passes ranking)', value: '301' },
        { text: '302 — temporary', value: '302' }
      ], 'Use 301 unless the move is genuinely temporary.')
    ]
  },
  {
    collection: 'coupons',
    meta: { icon: 'local_offer', note: 'Discount codes. Validated server-side at checkout — a code here is real money off.', archive_field: 'status', archive_value: 'archived' },
    fields: [
      F.status(),
      F.string('code', { required: true, meta: { note: 'Case-insensitive at checkout. Keep it short and unambiguous.' } }),
      F.select('discount_type', [
        { text: 'Percent off', value: 'percent' },
        { text: 'Fixed amount off', value: 'fixed' }
      ], 'Percent = % of the order. Fixed = dollars off.'),
      F.decimal('amount', 'For percent: 10 means 10%. For fixed: 15 means $15 off.'),
      F.string('label', { meta: { note: 'Shown to the customer when the code is accepted.' } }),
      F.date('start'), F.date('end'),
      F.decimal('minimum_order', 'Order subtotal required before the code applies. Blank = no minimum.'),
      F.int('usage_limit', 'Total redemptions allowed. Blank = unlimited.')
    ]
  },
  {
    collection: 'seo_overrides',
    meta: { icon: 'travel_explore', note: 'Per-URL SEO overrides for pages generated from code (city pages, category pages). Blank fields fall back to the generated values.' },
    fields: [
      F.status(),
      F.string('path', { required: true, meta: { note: 'Site-relative path, e.g. /trade-show-displays/denver' } }),
      ...SEO_FULL
    ]
  },
  {
    collection: 'promo_banners',
    meta: { icon: 'campaign', note: 'Promotional banners.', sort_field: 'sort' },
    fields: [
      F.status(), F.sort(),
      F.text('message'), F.string('link'), F.string('cta_label'),
      F.select('placement', ['site_wide', 'home_hero', 'category', 'product'], 'Where the banner appears.'),
      F.date('starts_at'), F.date('ends_at'), F.file('image')
    ]
  },
  {
    collection: 'site_settings',
    meta: { icon: 'settings', note: 'Global header, footer and contact details. One record.', singleton: true },
    fields: [
      F.string('brand_phone'), F.string('brand_email'),
      F.text('footer_blurb', 'Short paragraph under the logo in the footer.'),
      F.json('social_links', 'Label + URL pairs shown in the footer.', { options: { fields: [
        { field: 'label', name: 'Label', type: 'string', meta: { interface: 'input' } },
        { field: 'url', name: 'URL', type: 'string', meta: { interface: 'input' } }
      ] } }),
      F.text('announcement_text', 'Site-wide announcement bar. Leave empty to hide the bar.'),
      F.string('announcement_link'),
      F.bool('announcement_active', false)
    ]
  }
];

// Relations created after the collections exist.
const RELATIONS = [
  {
    collection: 'products', field: 'category', related_collection: 'categories',
    field_def: { field: 'category', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], note: 'Which category this product belongs to.' }, schema: { is_nullable: true } }
  },
  {
    collection: 'navigation', field: 'parent', related_collection: 'navigation',
    field_def: { field: 'parent', type: 'integer', meta: { interface: 'select-dropdown-m2o', special: ['m2o'], note: 'Leave blank for a top-level item. Set it to nest this item under another (mega-menu column).' }, schema: { is_nullable: true } }
  }
];

// Media library folders. Directus stores alt text on the file itself (Title),
// which the build uses as the img alt attribute.
const FOLDERS = ['Products', 'Hero', 'Blogs', 'Logos', 'Reviews'];

// ------------------------------------------------------------------ plumbing --
const api = async (path, options = {}) => {
  const res = await fetch(`${URL_BASE}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', ...options.headers }
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
};

const summary = { collections: 0, fields: 0, skipped: 0 };

async function ensureCollection(def) {
  // A dry run must not need a live server — it prints the plan from the
  // definitions alone, which also makes it a syntax check for this file.
  if (DRY) {
    console.log(`  + ${def.collection}  (${def.fields.length} fields)`);
    for (const f of def.fields) console.log(`      + ${f.field}: ${f.type}`);
    summary.collections++;
    summary.fields += def.fields.length;
    return;
  }
  const existing = await api(`/collections/${def.collection}`);
  if (existing.ok) {
    console.log(`  = ${def.collection} (exists)`);
  } else {
    if (DRY) { console.log(`  + ${def.collection} (would create)`); }
    else {
      const created = await api('/collections', {
        method: 'POST',
        body: JSON.stringify({
          collection: def.collection,
          meta: { ...def.meta, collection: def.collection },
          schema: { name: def.collection },
          fields: [{ field: 'id', type: 'integer', meta: { hidden: true, interface: 'input', readonly: true }, schema: { is_primary_key: true, has_auto_increment: true } }]
        })
      });
      if (!created.ok) { console.error(`  ! ${def.collection}: ${JSON.stringify(created.body.errors || created.body)}`); return; }
      console.log(`  + ${def.collection}`);
    }
    summary.collections++;
  }

  for (const field of def.fields) {
    const has = await api(`/fields/${def.collection}/${field.field}`);
    if (has.ok) { summary.skipped++; continue; }
    if (DRY) { console.log(`      + ${field.field}: ${field.type} (would create)`); summary.fields++; continue; }
    const made = await api(`/fields/${def.collection}`, { method: 'POST', body: JSON.stringify(field) });
    if (!made.ok) console.error(`      ! ${def.collection}.${field.field}: ${JSON.stringify(made.body.errors || made.body)}`);
    else { console.log(`      + ${field.field}`); summary.fields++; }
  }
}

// Many-to-one relations, created once both sides exist.
async function ensureRelation(rel) {
  // DRY first: a dry run must never need a live server.
  if (DRY) { console.log(`  ~ relation ${rel.collection}.${rel.field} -> ${rel.related_collection}`); return; }
  const has = await api(`/fields/${rel.collection}/${rel.field}`);
  if (has.ok) return;
  const made = await api(`/fields/${rel.collection}`, { method: 'POST', body: JSON.stringify(rel.field_def) });
  if (!made.ok) { console.error(`  ! ${rel.collection}.${rel.field}: ${JSON.stringify(made.body.errors || made.body)}`); return; }
  const linked = await api('/relations', {
    method: 'POST',
    body: JSON.stringify({
      collection: rel.collection,
      field: rel.field,
      related_collection: rel.related_collection,
      schema: { on_delete: 'SET NULL' }
    })
  });
  if (!linked.ok) console.error(`  ! relation ${rel.collection}.${rel.field}: ${JSON.stringify(linked.body.errors || linked.body)}`);
  else console.log(`  ~ relation ${rel.collection}.${rel.field} -> ${rel.related_collection}`);
}

// Media library folders. Alt text lives on each file's Title field, which the
// build uses for the img alt attribute — the image audit fails on a missing one.
async function ensureFolder(name) {
  if (DRY) { console.log(`  * folder ${name} (would create)`); return; }
  const existing = await api(`/folders?filter[name][_eq]=${encodeURIComponent(name)}`);
  if (existing.ok && Array.isArray(existing.body.data) && existing.body.data.length) return;
  const made = await api('/folders', { method: 'POST', body: JSON.stringify({ name }) });
  if (made.ok) console.log(`  * folder ${name}`);
  else console.error(`  ! folder ${name}: ${JSON.stringify(made.body.errors || made.body)}`);
}

(async () => {
  if (!DRY) {
    const health = await api('/server/health');
    if (!health.ok) {
      console.error(`Cannot reach Directus at ${URL_BASE} (${health.status}). Is it running?`);
      process.exit(1);
    }
  }
  console.log(`${DRY ? 'DRY RUN — ' : ''}applying content model to ${URL_BASE}\n`);
  for (const def of COLLECTIONS) await ensureCollection(def);
  console.log('');
  for (const rel of RELATIONS) await ensureRelation(rel);
  console.log('');
  for (const name of FOLDERS) await ensureFolder(name);
  console.log(`\n${DRY ? 'would create' : 'created'}: ${summary.collections} collections, ${summary.fields} fields (${summary.skipped} already present)`);
  if (!DRY) console.log('\nNext: create a READ-ONLY role + token for the build sync, then run npm run cms:pull in the storefront.');
})();
