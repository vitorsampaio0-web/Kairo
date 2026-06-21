const { test, expect } = require('@playwright/test');

test.describe('Feedback dentro da app', () => {
  test('deve abrir modal de feedback, preencher e submeter', async ({ page }) => {
    await page.goto('/app.html');
    const feedbackBtn = page.locator('[data-testid="feedback-btn"], .feedback-btn, [title*="feedback" i], [aria-label*="feedback" i]').first();
    await expect(feedbackBtn).toBeVisible();
    await feedbackBtn.click();
    const modal = page.locator('[data-testid="feedback-modal"], .feedback-modal, dialog:has-text("Feedback")').first();
    await expect(modal).toBeVisible();
    const textarea = modal.locator('textarea').first();
    await textarea.fill('Esta é uma mensagem de teste E2E de feedback.');
    const submit = modal.locator('button:has-text("Enviar"), button:has-text("Submit"), [type="submit"]').first();
    await submit.click();
    await expect(page.locator('[data-testid="toast-success"], .toast:has-text("enviado"), .toast:has-text("sucesso")').first()).toBeVisible({ timeout: 10000 });
  });
});
