const { test, expect } = require('@playwright/test');

test.describe('Acesso da Landing Page para a App', () => {
  test('deve permitir clicar no CTA "Começar Grátis" e redirecionar para app', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('a[href*="app.html"], a:has-text("Começar"), a:has-text("Grátis"), button:has-text("Começar"), button:has-text("Grátis")').first();
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute('href');
    expect(href).toContain('app.html');
  });

  test('deve ter link para versão EN no header', async ({ page }) => {
    await page.goto('/');
    const enLink = page.locator('a[href="landing-en.html"]').first();
    await expect(enLink).toBeVisible({ timeout: 5000 });
  });
});
