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

const FAQ_REPEATER = F.json('faqs', 'Question and answer pairs. Rendered on the page AND emitted as FAQPage structured data, so they must match what visitors see.', {
  interface: 'list',
  options: { fields: [
    { field: 'q', name: 'Question', type: 'string', meta: { interface: 'input', width: 'full', required: true } },
    { field: 'a', name: 'Answer', type: 'text', meta: { interface: 'input-multiline', width: 'full', required: true } }
  ] }
});

// --------------------------------------------------------------- collections --
const COLLECTIONS = [
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
      F.text('announcement_text', 'Site-wide announcement bar. Leave empty to hide the bar entirely.'),
      F.string('announcement_link'),
      F.bool('announcement_active', false)
    ]
  },
  {
    collection: 'navigation',
    meta: { icon: 'menu', note: 'Header and footer menus. Sort controls the order.', sort_field: 'sort' },
    fields: [
      F.status(), F.sort(),
      F.select('menu', ['header', 'footer_shop', 'footer_company', 'footer_support'], 'Which menu this item belongs to.'),
      F.string('label', { required: true }),
      F.string('url', { meta: { note: 'Site-relative path, e.g. /custom-canopies. Must be a page that exists — the link audit fails the build on a broken link.' } })
    ]
  },
  {
    collection: 'pages',
    meta: { icon: 'description', note: 'Standalone pages (about, quote, policies) and the homepage.', archive_field: 'status', archive_value: 'archived' },
    fields: [
      F.status(), F.slug(), F.string('title', { required: true }), F.string('nav_label'),
      F.json('blocks', 'Page body. Block types match the existing renderer: p (paragraph), h (heading), list, links.', { options: { fields: [
        { field: 'type', name: 'Type', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: 'Paragraph', value: 'p' }, { text: 'Heading', value: 'h' }, { text: 'List', value: 'list' }, { text: 'Links', value: 'links' }] } } },
        { field: 'value', name: 'Content', type: 'text', meta: { interface: 'input-multiline' } }
      ] } }),
      ...SEO
    ]
  },
  {
    collection: 'blog_posts',
    meta: { icon: 'article', note: 'Learning Center articles.', archive_field: 'status', archive_value: 'archived', sort_field: 'sort' },
    fields: [
      F.status(), F.sort(), F.slug(), F.string('title', { required: true }),
      F.text('excerpt', 'One or two sentences, used on listing pages and as the fallback meta description.'),
      F.file('cover_image'), F.rich('body', 'The article itself.'),
      F.json('tags', 'Free-text tags.'), F.date('published_at'), F.date('updated_at'),
      FAQ_REPEATER, ...SEO
    ]
  },
  {
    collection: 'products',
    meta: { icon: 'inventory_2', note: 'Product CONTENT — copy, images, specs, SEO. Prices are NOT set here; they come from the pricing engine.', archive_field: 'status', archive_value: 'archived', sort_field: 'sort' },
    fields: [
      F.status(), F.sort(),
      F.slug(), // must match the slug in backend/data/products.js
      F.string('name', { required: true }), F.string('tagline'),
      F.text('description', 'Main product description shown under the title.'),
      F.json('features', 'Bullet list of features.'),
      F.json('whats_included', 'What actually ships in the box. Only list components that genuinely ship — this is a factual claim.'),
      F.json('applications', 'Typical use cases.'),
      F.json('specs', 'Specification rows: label + value. These are published product facts — do not enter figures that are not verified.', { options: { fields: [
        { field: 'label', name: 'Label', type: 'string', meta: { interface: 'input' } },
        { field: 'value', name: 'Value', type: 'string', meta: { interface: 'input' } }
      ] } }),
      F.files('gallery', 'Product photography. Alt text is taken from each file\'s Title in the file library — fill it in, the image audit requires it.'),
      FAQ_REPEATER,
      F.string('price_note', { meta: { note: 'Read-only context for staff, e.g. "from $140". Display only — it does not affect what anyone is charged.' } }),
      ...SEO
    ]
  },
  {
    collection: 'product_variants',
    meta: { icon: 'tune', note: 'Display variants (size/option labels) shown on a product page. Pricing for variants stays in the pricing engine.', sort_field: 'sort' },
    fields: [
      F.sort(),
      F.string('product_slug', { required: true, meta: { note: 'Slug of the parent product.' } }),
      F.string('label', { required: true }), F.string('value'),
      F.text('note', 'Optional helper text shown beside the option.')
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
    collection: 'seo_overrides',
    meta: { icon: 'travel_explore', note: 'Per-URL SEO overrides for pages generated from code (city pages, categories). Blank fields fall back to the generated values.' },
    fields: [
      F.status(),
      F.string('path', { required: true, meta: { note: 'Site-relative path, e.g. /trade-show-displays/denver' } }),
      ...SEO
    ]
  },
  {
    collection: 'coupons',
    meta: { icon: 'local_offer', note: 'Discount codes. Validated server-side at checkout — a code here is real money off.', archive_field: 'status', archive_value: 'archived' },
    fields: [
      F.status(),
      F.string('code', { required: true, meta: { note: 'Case-insensitive at checkout. Keep it short and unambiguous.' } }),
      F.select('type', [{ text: 'Percent off', value: 'percent' }, { text: 'Fixed amount off', value: 'fixed' }], 'Percent = % of the order. Fixed = dollars off.'),
      F.decimal('value', 'For percent: 10 means 10%. For fixed: 15 means $15 off.'),
      F.string('label', { meta: { note: 'Shown to the customer when the code is accepted, e.g. "10% off your order".' } }),
      F.date('starts_at'), F.date('ends_at'),
      F.int('usage_limit', 'Leave blank for unlimited.')
    ]
  },
  {
    collection: 'promo_banners',
    meta: { icon: 'campaign', note: 'Promotional banners.', sort_field: 'sort' },
    fields: [
      F.status(), F.sort(),
      F.text('message', 'Banner copy.'), F.string('link'), F.string('cta_label'),
      F.select('placement', ['site_wide', 'home_hero', 'category', 'product'], 'Where the banner appears.'),
      F.date('starts_at'), F.date('ends_at'), F.file('image')
    ]
  }
];

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
  console.log(`\n${DRY ? 'would create' : 'created'}: ${summary.collections} collections, ${summary.fields} fields (${summary.skipped} already present)`);
  if (!DRY) console.log('\nNext: create a READ-ONLY role + token for the build sync, then run npm run cms:pull in the storefront.');
})();
