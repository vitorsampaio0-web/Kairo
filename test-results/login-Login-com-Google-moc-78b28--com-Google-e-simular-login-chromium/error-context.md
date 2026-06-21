# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.js >> Login com Google (mock) >> deve mostrar botão "Entrar com Google" e simular login
- Location: e2e\login.spec.js:4:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('body').filter({ visible: true }).filter({ hasText: /erro|error|fail/i })
Expected: 0
Received: 1
Timeout:  3000ms

Call log:
  - Expect "toHaveCount" with timeout 3000ms
  - waiting for locator('body').filter({ visible: true }).filter({ hasText: /erro|error|fail/i })
    9 × locator resolved to 1 element
      - unexpected value "1"

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - img "Kairo" [ref=e4]
    - heading "KAIRO" [level=1] [ref=e5]
    - paragraph [ref=e6]: Produtividade de Elite
    - button "Entrar com Google" [active] [ref=e7] [cursor=pointer]:
      - img [ref=e8]
      - text: Entrar com Google
    - generic [ref=e14]: ou
    - generic [ref=e15]:
      - textbox "Email" [ref=e16]
      - textbox "Password" [ref=e17]
      - paragraph [ref=e18]
      - button "Entrar com Email" [ref=e19] [cursor=pointer]
      - paragraph [ref=e20]: Não tens conta? Criar conta
    - paragraph [ref=e21]:
      - img [ref=e22]
      - text: Os teus dados ficam guardados de forma segura
  - generic:
    - generic:
      - generic:
        - generic:
          - strong: Kairo AI
          - generic: Online · Assistente inteligente
      - button
    - generic:
      - textbox "Pergunta algo ao Kairo AI..."
      - button
  - text: ✓ ✓ ✓ ✓ ✓ ✓
  - button "Reportar problema ou sugerir melhoria" [ref=e25] [cursor=pointer]
  - iframe [ref=e27]
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('Login com Google (mock)', () => {
  4  |   test('deve mostrar botão "Entrar com Google" e simular login', async ({ page }) => {
  5  |     await page.goto('/app.html');
  6  |     const googleBtn = page.locator('button:has-text("Google"), .google-signin, [data-provider="google"]').first();
  7  |     await expect(googleBtn).toBeVisible({ timeout: 10000 });
  8  |     await googleBtn.click();
  9  |     // Sem mock real de Firebase, verifica pelo menos que não dá erro fatal
  10 |     const error = page.locator('body').locator('visible=true').filter({ hasText: /erro|error|fail/i });
> 11 |     await expect(error).toHaveCount(0, { timeout: 3000 });
     |                         ^ Error: expect(locator).toHaveCount(expected) failed
  12 |   });
  13 | });
  14 | 
```