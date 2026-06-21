const { test, expect } = require('@playwright/test');

test.describe('Marcar tarefa como concluída', () => {
  test('deve marcar uma tarefa existente como feita', async ({ page }) => {
    await page.goto('/app.html?page=tasks');
    await page.waitForSelector('body');
    const checkbox = page.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible();
    const checkedBefore = await checkbox.isChecked();
    if (!checkedBefore) {
      await checkbox.click();
    }
    await expect(checkbox).toBeChecked();
  });
});
