-- ============================================================================
-- Redirects: old product/size URLs -> current ones (three-size catalog).
-- Paste into Supabase SQL Editor -> Run. Then rebuild the site (dashboard
-- Blog tab "Rebuild site", or a normal deploy) so the edge middleware picks
-- them up. 301 = permanent (keeps SEO signal).
-- ============================================================================
insert into public.redirects (source, destination, code) values
  ('/products/canopy-tents',            '/products/canopy-tent-10x10', 301),
  ('/products/canopy-packages',         '/products',                   301),
  ('/products/canopy-sidewalls',        '/products',                   301),
  ('/products/canopy-replacement-tops', '/products',                   301),
  ('/products/canopy-accessories',      '/products',                   301),
  ('/sizes/8x8',   '/sizes/10x10', 301),
  ('/sizes/13x13', '/sizes/10x20', 301),
  ('/sizes/13x20', '/sizes/10x20', 301)
on conflict (source) do update
  set destination = excluded.destination, code = excluded.code;
