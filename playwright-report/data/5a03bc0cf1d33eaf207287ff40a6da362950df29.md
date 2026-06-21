# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: create-task.spec.js >> Criar tarefa >> deve abrir formulário, preencher e adicionar à lista
- Location: e2e\create-task.spec.js:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button:has-text("Nova"), button:has-text("Nova tarefa"), [data-testid="add-task-btn"]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('button:has-text("Nova"), button:has-text("Nova tarefa"), [data-testid="add-task-btn"]').first()

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
  3  | test.describe('Criar tarefa', () => {
  4  |   test('deve abrir formulário, preencher e adicionar à lista', async ({ page }) => {
  5  |     await page.goto('/app.html?page=tasks');
  6  |     await page.waitForSelector('body');
  7  |     const addBtn = page.locator('button:has-text("Nova"), button:has-text("Nova tarefa"), [data-testid="add-task-btn"]').first();
> 8  |     await expect(addBtn).toBeVisible();
     |                          ^ Error: expect(locator).toBeVisible() failed
  9  |     await addBtn.click();
  10 |     const modal = page.locator('.modal, dialog, [role="dialog"]').first();
  11 |     await expect(modal).toBeVisible();
  12 |     await modal.locator('input[type="text"]').first().fill('Tarefa E2E Playwright');
  13 |     await modal.locator('button:has-text("Guardar"), button:has-text("Salvar"), button:has-text("Criar"), button:has-text("Add")').first().click();
  14 |     await expect(page.locator('body').locator('text=Tarefa E2E Playwright').first()).toBeVisible({ timeout: 8000 });
  15 |   });
  16 | });
  17 | 
```