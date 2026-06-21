const { test, expect } = require('@playwright/test');

test.describe('Dashboard → Tarefas do dia', () => {
  test('deve carregar tarefas pendentes ao clicar em Tarefas Dia', async ({ page }) => {
    await page.goto('/app.html?page=dashboard');
    await page.waitForSelector('body');
    const tarefasDia = page.locator('[data-testid="dashboard-today-tasks"], a:has-text("Tarefas dia"), button:has-text("Tarefas dia")').first();
    await expect(tarefasDia).toBeVisible();
    await tarefasDia.click();
    await expect(page).toHaveURL(/tasks|tarefas/);
  });
});
