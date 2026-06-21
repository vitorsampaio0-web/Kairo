const { test, expect } = require('@playwright/test');

test.describe('Criar tarefa', () => {
  test('deve abrir formulário, preencher e adicionar à lista', async ({ page }) => {
    await page.goto('/app.html?page=tasks');
    await page.waitForSelector('body');
    const addBtn = page.locator('button:has-text("Nova"), button:has-text("Nova tarefa"), [data-testid="add-task-btn"]').first();
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    const modal = page.locator('.modal, dialog, [role="dialog"]').first();
    await expect(modal).toBeVisible();
    await modal.locator('input[type="text"]').first().fill('Tarefa E2E Playwright');
    await modal.locator('button:has-text("Guardar"), button:has-text("Salvar"), button:has-text("Criar"), button:has-text("Add")').first().click();
    await expect(page.locator('body').locator('text=Tarefa E2E Playwright').first()).toBeVisible({ timeout: 8000 });
  });
});
