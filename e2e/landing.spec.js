const { test, expect } = require('@playwright/test');

test.describe('Acesso da Landing Page', () => {
  test('deve ter link para app e versão EN', async ({ page }) => {
    await page.goto('/landing.html');
    const cta = page.locator('a[href="index.html"]').first();
    await expect(cta).toBeVisible();
    const enLink = page.locator('a[href="landing-en.html"]').first();
    await expect(enLink).toBeVisible({ timeout: 5000 });
  });
});
