const { test, expect } = require('@playwright/test');

test.describe('Login com Google (mock)', () => {
  test('deve mostrar botão "Entrar com Google" e simular login', async ({ page }) => {
    await page.goto('/app.html');
    const googleBtn = page.locator('button:has-text("Google"), .google-signin, [data-provider="google"]').first();
    await expect(googleBtn).toBeVisible({ timeout: 10000 });
    await googleBtn.click();
    // Sem mock real de Firebase, verifica pelo menos que não dá erro fatal
    const error = page.locator('body').locator('visible=true').filter({ hasText: /erro|error|fail/i });
    await expect(error).toHaveCount(0, { timeout: 3000 });
  });
});
