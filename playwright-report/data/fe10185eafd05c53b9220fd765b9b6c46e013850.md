# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: complete-task.spec.js >> Marcar tarefa como concluída >> deve marcar uma tarefa existente como feita
- Location: e2e\complete-task.spec.js:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  locator('input[type="checkbox"]').first()
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('input[type="checkbox"]').first()
    12 × locator resolved to <input type="checkbox" id="notif-enabled" onchange="toggleNotifFields()"/>
       - unexpected value "hidden"

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
  3  | test.describe('Marcar tarefa como concluída', () => {
  4  |   test('deve marcar uma tarefa existente como feita', async ({ page }) => {
  5  |     await page.goto('/app.html?page=tasks');
  6  |     await page.waitForSelector('body');
  7  |     const checkbox = page.locator('input[type="checkbox"]').first();
> 8  |     await expect(checkbox).toBeVisible();
     |                            ^ Error: expect(locator).toBeVisible() failed
  9  |     const checkedBefore = await checkbox.isChecked();
  10 |     if (!checkedBefore) {
  11 |       await checkbox.click();
  12 |     }
  13 |     await expect(checkbox).toBeChecked();
  14 |   });
  15 | });
  16 | 
```