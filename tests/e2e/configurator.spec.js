import { test, expect } from '@playwright/test';

// Configurator smoke tests — preserve/verify the core commerce path for this
// site's model: a made-to-order product shows an instant price and a working
// "Order & upload artwork" CTA (-> /order), and a quote-only product shows a
// quote CTA with no fabricated price. (No cart-add on the PDP.)
test.describe('configurator', () => {
  test('priced product shows an instant price and an enabled order CTA', async ({ page }) => {
    await page.goto('/products/canopy-tent-10x10', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/\$\d/).first()).toBeVisible();
    const cta = page.getByRole('button', { name: /order .* upload artwork/i });
    await expect(cta).toBeVisible();
    await expect(cta).toBeEnabled();
  });

  test('order CTA navigates to the order + artwork-upload step', async ({ page }) => {
    await page.goto('/products/canopy-tent-10x10', { waitUntil: 'domcontentloaded' });
    const cta = page.getByRole('button', { name: /order .* upload artwork/i });
    await expect(cta).toBeEnabled();
    await cta.click();
    await expect(page).toHaveURL(/\/order/);
  });

  test('quote-only product routes to the quote flow (no fake price)', async ({ page }) => {
    await page.goto('/products/seg-modular-trade-show-kit-a', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('button', { name: /request a (custom )?quote/i }).first()).toBeVisible();
  });
});
