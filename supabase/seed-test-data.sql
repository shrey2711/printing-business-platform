-- ============================================================================
-- Canopy Tent Co. — TEST / DEMO DATA
-- Paste into Supabase SQL Editor → Run. Populates the site + dashboard so you
-- can click through every feature. Everything here is tagged so the CLEANUP
-- block at the bottom removes it in one go.
--
-- NOTE: this is your PRODUCTION database (you only have one). Published blog
-- posts become PUBLIC after the next site rebuild. Orders appear in the Orders
-- tab and on the tied account. Nothing here touches live checkout pricing.
-- ============================================================================

-- Tie demo orders to the first dashboard admin (falls back to the first user),
-- so you can see them both in the Orders tab AND on your own /account page
-- (useful for testing proof approval as the customer).
do $$
declare
  demo_user uuid;
begin
  select coalesce(
    (select user_id from public.admin_users order by created_at limit 1),
    (select id from auth.users order by created_at limit 1)
  ) into demo_user;

  if demo_user is null then
    raise notice 'No users found — skipping demo orders. Register an account first, then re-run.';
  else
    insert into public.orders (user_id, product, specs, quantity, estimated_price, currency, status, config, amount_total, created_at)
    values
      (demo_user, 'Custom Printed Canopy Tent',
        'Tent size: 10'' × 10'' • Frame grade: Commercial aluminium • Print coverage: Top + valance • Walls: Full wall — printed x2 • Qty 1',
        1, 'USD 1,486.90', 'USD', 'submitted',
        '{"slug":"canopy-tents","quantity":1,"selections":{"size":"10x10","frame":"aluminium","print":"top-valance","walls":{"full-wall":2}}}'::jsonb,
        null, now() - interval '2 days'),

      (demo_user, 'Custom Printed Canopy Tent',
        'Tent size: 10'' × 20'' • Frame grade: Heavy-duty hex aluminium • Print coverage: Top + valance + inside • Qty 1',
        1, 'USD 2,167.45', 'USD', 'paid',
        '{"slug":"canopy-tents","quantity":1,"selections":{"size":"10x20","frame":"hex","print":"top-inside"}}'::jsonb,
        2167.45, now() - interval '5 days'),

      (demo_user, 'Canopy Tent Packages',
        'Package: Vendor — tent + 3 walls + weights + bag • Tent size: 10'' × 10'' • Qty 1',
        1, 'USD 1,549.00', 'USD', 'proof_ready',
        '{"slug":"canopy-packages","quantity":1,"selections":{"package":"vendor","size":"10x10","frame":"aluminium","print":"top"}}'::jsonb,
        1549.00, now() - interval '3 days'),

      (demo_user, 'Replacement Canopy Tops',
        'Top size: 10'' × 10'' • Fabric: 600D polyester • Print coverage: Canopy top • Qty 2',
        2, 'CAD 1,124.37', 'CAD', 'in_production',
        '{"slug":"canopy-replacement-tops","quantity":2,"selections":{"size":"10x10","fabric":"600d","print":"top"}}'::jsonb,
        1124.37, now() - interval '8 days'),

      (demo_user, 'Custom Printed Canopy Tent',
        'Tent size: 13'' × 20'' • Frame grade: Commercial aluminium • Print coverage: Top • Qty 1',
        1, 'USD 1,849.00', 'USD', 'shipped',
        '{"slug":"canopy-tents","quantity":1,"selections":{"size":"13x20","frame":"aluminium","print":"top"}}'::jsonb,
        1849.00, now() - interval '14 days');

    -- Put a tracking number on the shipped one.
    update public.orders set tracking_number = '1Z999AA10123456784', carrier = 'UPS'
      where user_id = demo_user and status = 'shipped'
      and created_at > now() - interval '15 days' and tracking_number is null;

    raise notice 'Seeded 5 demo orders for user %', demo_user;
  end if;
end $$;

-- ── Blog posts (2 published, 1 draft) ───────────────────────────────────────
-- These are genuinely useful canopy content — keep them if you like. Published
-- posts show on /blog immediately (React fetch) and get baked into static HTML
-- on the next rebuild.
insert into public.blog_posts (slug, title, excerpt, body_md, tags, status, published_at)
values
(
  'how-to-choose-canopy-tent-size',
  'How to Choose the Right Canopy Tent Size',
  'A 10×10 fits one table and two people comfortably; a 10×20 doubles your footprint. Here''s how to pick.',
  E'## Match the size to the space you''re given\n\nMost markets and shows allocate booths in 10-foot increments, so your canopy size is usually decided for you: a **10×10** for a single booth, a **10×20** for a double.\n\n### 10×10 — the standard booth\nFits one 6-foot table across the back and leaves room for two people plus a customer or two. This is the size to buy if you''re unsure.\n\n### 10×15 and 10×20 — more room to work\nStep up when you need a second table, a product display, or space for a line to form under cover. A 10×20 is effectively two booths under one roof.\n\n### 8×8 — tight pitches\nGood for compact market stalls or when you''re sharing space.\n\n## Don''t forget the walls\nA printed **back wall** turns your canopy into a branded backdrop. **Half walls** define the space without closing it off. Add them from the [sidewalls page](/products/canopy-sidewalls).\n\n> Rule of thumb: buy one size bigger than you think you need. Shade and space run out faster than you expect.\n\n[Build your canopy →](/products/canopy-tents)',
  ARRAY['buying guide','sizing'],
  'published',
  now() - interval '6 days'
),
(
  'print-coverage-explained',
  'Print Coverage Explained: Top, Valance & Inside',
  'How much of your canopy should carry your brand? A quick guide to the three coverage levels and what each is for.',
  E'## The three levels of print coverage\n\nWhen you configure a canopy, the biggest lever on both **impact** and **price** is how much of it gets printed.\n\n### Canopy top\nYour artwork across all four roof panels. This is the highest-visibility surface from a distance — people see it before they see you. If you print nothing else, print the top.\n\n### Top + valance\nAdds the hanging skirt at eye level, where people actually read it as they walk past. The valance is prime real estate for your name, tagline, or a phone number.\n\n### Top + valance + inside\nPrints the underside of the canopy too, so everyone standing in your booth is surrounded by your brand. Popular for photo-friendly setups and premium booths.\n\n## Which should you choose?\n\n| Coverage | Best for |\n| --- | --- |\n| Top | Maximum reach on a budget |\n| Top + valance | The all-rounder most vendors pick |\n| Top + valance + inside | Premium booths and photo moments |\n\nAll printing is **dye-sublimated** — the ink is bonded into the fabric, so it won''t crack, peel, or fade.\n\n[Compare coverage and price →](/products/canopy-tents)',
  ARRAY['guide','printing'],
  'published',
  now() - interval '2 days'
),
(
  'caring-for-your-custom-canopy',
  'Caring for Your Custom Canopy Tent',
  'Draft — a few simple habits that keep a printed canopy looking new for years.',
  E'## Make it last\n\nA well-cared-for canopy lasts many seasons. A few habits:\n\n- **Dry before storing.** Packing a damp canopy invites mildew. Let it air-dry fully first.\n- **Use weights every time.** Even a light gust can lift an unweighted tent. Most venues require weights anyway.\n- **Spot-clean only.** Mild soap and water on a sponge; skip the pressure washer.\n- **Store in the bag.** The wheeled bag protects both the frame and the graphic.\n\n_This post is a draft — it won''t appear on the site until published._',
  ARRAY['care','tips'],
  'draft',
  null
)
on conflict (slug) do nothing;

-- ── A useful redirect ───────────────────────────────────────────────────────
-- Short vanity path → the main product page. Takes effect after a rebuild.
insert into public.redirects (source, destination, code)
values ('/tents', '/products/canopy-tents', 301)
on conflict (source) do nothing;

-- ── Content override example (minor, easy to revert) ────────────────────────
-- Demonstrates the Content tab. Reverts from the dashboard (Content → Reset)
-- or via the CLEANUP block below.
insert into public.content_overrides (key, value)
values ('home.sizes.subtitle', '"Every size is printed to order. Not sure? A 10 × 10 is the standard vendor booth — start there."'::jsonb)
on conflict (key) do nothing;

-- ── SEO override example ────────────────────────────────────────────────────
insert into public.seo_overrides (path, title, description)
values (
  '/blog',
  'Canopy Tent Guides, Sizing & Buying Tips | Canopy Tent Co.',
  'Practical guides for custom printed canopy tents — how to choose a size, print coverage explained, and care tips.'
)
on conflict (path) do nothing;

-- ============================================================================
-- CLEANUP — run this block to remove ALL of the above.
-- ============================================================================
-- delete from public.orders where product in (
--   'Custom Printed Canopy Tent','Canopy Tent Packages','Replacement Canopy Tops'
-- ) and created_at < now();  -- careful: only if these are all demo orders
-- delete from public.blog_posts where slug in (
--   'how-to-choose-canopy-tent-size','print-coverage-explained','caring-for-your-custom-canopy');
-- delete from public.redirects where source = '/tents';
-- delete from public.content_overrides where key = 'home.sizes.subtitle';
-- delete from public.seo_overrides where path = '/blog';
