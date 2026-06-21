const { test, expect } = require('@playwright/test');

test.describe('Página de Login', () => {
  test('deve mostrar botão Google e formulário email', async ({ page }) => {
    await page.goto('/index.html');
    const googleBtn = page.locator('#btnGoogle').first();
    await expect(googleBtn).toBeVisible({ timeout: 8000 });
    const emailBtn = page.locator('#btnEmailToggle').first();
    await expect(emailBtn).toBeVisible();
  });

  test('deve ter link para versão EN', async ({ page }) => {
    await page.goto('/index.html');
    const enLink = page.locator('a[href="index-en.html"]').first();
    await expect(enLink).toBeVisible();
  });

  test('deve expandir formulário email ao clicar', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('#btnEmailToggle').click();
    await expect(page.locator('#emailForm')).toHaveClass(/active/);
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });
});
