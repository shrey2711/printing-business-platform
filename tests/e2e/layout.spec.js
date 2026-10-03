import { test, expect } from '@playwright/test';

// Layout guard: no page may scroll sideways, and no form control may stick out
// of the card it sits in. Both have shipped before — a 1fr grid track that
// would not shrink below its content pushed the register form out of its card
// on desktop and the configurator off a 390px screen.
const PAGES = [
  '/',
  '/register',
  '/login',
  '/quote',
  '/contact',
  '/cart',
  '/products',
  '/products/canopy-tent-10x10',
  '/products/standard-retractable-banner',
  '/custom-canopies',
  '/trade-show-displays/chicago',
  '/custom-canopy-tents-chicago',
  '/locations/texas',
  '/blog',
  '/blog/trade-show-display-cost',
  '/trade-show-booth-packages',
  '/sizes/10x10',
  '/channel-letters',
  '/products/front-lit-channel-letters',
  '/products/custom-lanyards'
];

for (const path of PAGES) {
  test(`layout: ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    // A page that failed to render (e.g. its lazy chunk threw) has no heading.
    await expect(page.locator('h1').first()).toBeVisible();
    const problems = await page.evaluate(() => {
      const out = [];
      const W = window.innerWidth;
      if (document.documentElement.scrollWidth > W + 1) {
        const culprit = [...document.querySelectorAll('body *')].find((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.right > W + 1;
        });
        out.push(`page scrolls horizontally (${document.documentElement.scrollWidth}px > ${W}px)` +
          (culprit ? ` — first offender: <${culprit.tagName.toLowerCase()} class="${culprit.className}">` : ''));
      }
      for (const card of document.querySelectorAll('.card')) {
        const r = card.getBoundingClientRect();
        for (const el of card.querySelectorAll('input, select, textarea, button')) {
          const e = el.getBoundingClientRect();
          if (e.width && e.right > r.right + 1) {
            out.push(`<${el.tagName.toLowerCase()} id="${el.id}"> overflows .${card.className.split(' ').join('.')}`);
            break;
          }
        }
      }
      return out;
    });
    expect(problems).toEqual([]);
  });
}
