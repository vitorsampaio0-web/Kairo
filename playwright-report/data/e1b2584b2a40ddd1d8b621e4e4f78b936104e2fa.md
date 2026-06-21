# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: feedback.spec.js >> Feedback dentro da app >> deve abrir modal de feedback, preencher e submeter
- Location: e2e\feedback.spec.js:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('[data-testid="toast-success"], .toast:has-text("enviado"), .toast:has-text("sucesso")').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('[data-testid="toast-success"], .toast:has-text("enviado"), .toast:has-text("sucesso")').first()

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
- heading "Reportar Problema / Sugestão" [level=3]
- button "×"
- combobox:
  - option "🐛 Bug / Erro" [selected]
  - option "💡 Sugestão"
  - option "📝 Outro"
- textbox "Descreve o problema ou a tua sugestão...": Esta é uma mensagem de teste E2E de feedback.
- text: Enviado anonimamente com ID de utilizador
- button "Enviar"
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('Feedback dentro da app', () => {
  4  |   test('deve abrir modal de feedback, preencher e submeter', async ({ page }) => {
  5  |     await page.goto('/app.html');
  6  |     const feedbackBtn = page.locator('[data-testid="feedback-btn"], .feedback-btn, [title*="feedback" i], [aria-label*="feedback" i]').first();
  7  |     await expect(feedbackBtn).toBeVisible();
  8  |     await feedbackBtn.click();
  9  |     const modal = page.locator('[data-testid="feedback-modal"], .feedback-modal, dialog:has-text("Feedback")').first();
  10 |     await expect(modal).toBeVisible();
  11 |     const textarea = modal.locator('textarea').first();
  12 |     await textarea.fill('Esta é uma mensagem de teste E2E de feedback.');
  13 |     const submit = modal.locator('button:has-text("Enviar"), button:has-text("Submit"), [type="submit"]').first();
  14 |     await submit.click();
> 15 |     await expect(page.locator('[data-testid="toast-success"], .toast:has-text("enviado"), .toast:has-text("sucesso")').first()).toBeVisible({ timeout: 10000 });
     |                                                                                                                                 ^ Error: expect(locator).toBeVisible() failed
  16 |   });
  17 | });
  18 | 
```