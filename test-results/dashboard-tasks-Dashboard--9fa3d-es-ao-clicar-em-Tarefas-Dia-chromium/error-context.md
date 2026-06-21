# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard-tasks.spec.js >> Dashboard → Tarefas do dia >> deve carregar tarefas pendentes ao clicar em Tarefas Dia
- Location: e2e\dashboard-tasks.spec.js:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="dashboard-today-tasks"], a:has-text("Tarefas dia"), button:has-text("Tarefas dia")').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('[data-testid="dashboard-today-tasks"], a:has-text("Tarefas dia"), button:has-text("Tarefas dia")').first()

```

```yaml
- img "Kairo"
- heading "KAIRO" [level=1]
- paragraph: Produtividade de Elite
- button "Entrar com Google":
  - img
  - text: Entrar com Google
- text: ou
- textbox "Email"
- textbox "Password"
- paragraph
- button "Entrar com Email"
- paragraph: Não tens conta? Criar conta
- paragraph:
  - img
  - text: Os teus dados ficam guardados de forma segura
- strong: Kairo AI
- text: Online · Assistente inteligente
- button
- textbox "Pergunta algo ao Kairo AI..."
- button
- button "Reportar problema ou sugerir melhoria"
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('Dashboard → Tarefas do dia', () => {
  4  |   test('deve carregar tarefas pendentes ao clicar em Tarefas Dia', async ({ page }) => {
  5  |     await page.goto('/app.html?page=dashboard');
  6  |     await page.waitForSelector('body');
  7  |     const tarefasDia = page.locator('[data-testid="dashboard-today-tasks"], a:has-text("Tarefas dia"), button:has-text("Tarefas dia")').first();
> 8  |     await expect(tarefasDia).toBeVisible();
     |                              ^ Error: expect(locator).toBeVisible() failed
  9  |     await tarefasDia.click();
  10 |     await expect(page).toHaveURL(/tasks|tarefas/);
  11 |   });
  12 | });
  13 | 
```