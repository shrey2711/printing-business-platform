import { test, expect } from '@playwright/test';

// The seed is written by the prerender, so this runs against the production
// build (`npm run build && npm run serve:dist`, port 4173; `vite preview` does not serve the prerendered pages), not the dev server.
test.use({ baseURL: 'http://localhost:4173' });
test.beforeAll(async ({ request }) => {
  const up = await request.get('/').then((r) => r.ok()).catch(() => false);
  test.skip(!up, 'needs `npm run serve:dist` on :4173 (run `npm run build` first)');
});

// A crawler that snapshots a page before /api answers must still see the real
// page. Product and blog pages used to render "Loading…" until the fetch
// returned, so several different URLs looked identical to Google and Search
// Console reported them as duplicates ("Google chose a different canonical").
// The prerender now embeds the data; this blocks /api entirely and checks the
// page still has its own content.
const PAGES = [
  ['/products/canopy-tent-10x15', /10.*15.*canopy/i],
  ['/products/stretch-table-covers', /stretch table cover/i],
  ['/products/deluxe-retractable-banner', /deluxe retractable/i],
  ['/blog/print-coverage-explained', /print coverage/i],
  ['/blog/custom-canopy-tent-buying-guide', /buying guide|canopy/i]
];

for (const [path, heading] of PAGES) {
  test(`first paint without the API: ${path}`, async ({ page }) => {
    await page.route('**/api/**', (route) => route.abort());
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.locator('h1').first()).toHaveText(heading);
    await expect(page.getByText('Loading…')).toHaveCount(0);
  });
}
