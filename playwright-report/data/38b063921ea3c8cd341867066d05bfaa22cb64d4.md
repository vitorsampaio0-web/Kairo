# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.js >> Acesso da Landing Page para a App >> deve ter link para versão EN no header
- Location: e2e\landing.spec.js:12:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('a[href="landing-en.html"]').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('a[href="landing-en.html"]').first()

```

```yaml
- navigation:
  - link:
    - /url: "#"
  - list:
    - listitem:
      - link "Funcionalidades":
        - /url: "#features"
    - listitem:
      - link "Como Funciona":
        - /url: "#how-it-works"
    - listitem:
      - link "Testemunhos":
        - /url: "#testimonials"
    - listitem:
      - link "Preços":
        - /url: "#pricing"
  - link "Entrar":
    - /url: ./app.html
  - link "Começar Grátis":
    - /url: ./app.html
- text: Usado por mais de 2.000 líderes em todo o mundo
- paragraph: Execução acima de intenção.
- paragraph: Para de gerir. Começa a executar. O Kairo é o centro de comando com IA criado para os líderes que entregam — não para os que planeiam entregar.
- link "Começar Grátis":
  - /url: ./app.html
- link "Ver em ação":
  - /url: "#features"
- text: MH PN JO AK SR
- paragraph:
  - strong: 4.9 ★
  - text: · Adorado por fundadores e executivos em mais de 60 países
- text: Kairo — Dashboard Bom dia, Marcus 8 Tarefas hoje 3 Em foco 14 Dias seguidos ✓ Revisão do deck do conselho ✓ Call de alinhamento OKR Q3 Revisão do term sheet Série B 1-on-1 com o CPO ✦
- strong: "Kairo AI:"
- text: Tens 2 prioridades em conflito amanhã. Queres que reorganize o teu horário? Deep Work Leitura O problema
- heading "Cada ferramenta promete clareza. A maioria entrega ruído." [level=2]
- paragraph: Estás a trabalhar com um conjunto fragmentado de apps que não comunicam entre si. O teu foco dispersa antes mesmo do standup da manhã terminar.
- text: "01"
- heading "12 apps. Zero foco." [level=3]
- paragraph: Demasiadas ferramentas. Nenhuma visão clara. Perdes horas a organizar em vez de executar.
- paragraph: Slack, Notion, Todoist, Calendário, email, notas — cada sistema é uma decisão separada. A troca de contexto custa-te mais do que pensas.
- text: "02"
- heading "As prioridades mudam. Nada acompanha." [level=3]
- paragraph: O que era urgente às 9h é irrelevante ao meio-dia. A maioria das ferramentas congela as tuas prioridades. O Kairo adapta-se contigo.
- text: "03"
- heading "Horas a organizar. Minutos a executar." [level=3]
- paragraph: "A ironia cruel das apps de produtividade: tornam a produtividade no teu trabalho a tempo inteiro. Os líderes devem decidir, não arquivar."
- text: Funcionalidades
- heading "Construído para a forma como realmente lideras." [level=2]
- text: Guia Completo
- heading "Descobre tudo o que o Kairo pode fazer por ti" [level=3]
- paragraph: 20+ funcionalidades explicadas passo a passo — desde tarefas inteligentes até ao Diário de Decisões para CEOs.
- link "Ver Guia de Produto":
  - /url: ./kairo-brochure.html
  - img
  - text: Ver Guia de Produto
- heading "Dashboard Inteligente" [level=3]
- paragraph: Tudo o que precisas. Nada a mais. O teu dia inteiro visível num relance.
- text: Vista global Clareza diária Zero ruído Tarefas concluídas hoje 6 / 8 Próxima reunião 2:30 PM Pontuação de foco 92% Progresso diário Sequência semanal
- heading "Kairo AI" [level=3]
- paragraph: Um assistente que conversa contigo. Analisa tarefas, sugere prioridades, responde em tempo real.
- text: Sugestão de prioridades Agendamento inteligente Insights contextuais ✦ Kairo AI
- strong: Tens 3 blocos de trabalho profundo amanhã mas 5 calls em conflito.
- text: Movi a call menos urgente para quinta e protegi o teu bloco das 9–11h. Queres que notifique a equipa?
- strong: A revisão Série B é para sexta.
- text: Com base no teu ritmo, recomendo bloquear 2h hoje e 3h na quarta. Confiança da IA 98.2%
- heading "Tarefas Inteligentes" [level=3]
- paragraph: Cria por voz ou texto. Prioridade, data, edição, histórico e exportação para Word.
- text: Criação por voz Histórico completo Export para Word Deep Work 6d seguidos Leitura 4d seguidos Exercício 7d seguidos 🔥 Diário 5d seguidos Este mês — taxa de consistência
- heading "Sincronização entre Dispositivos" [level=3]
- paragraph: Da sala de reuniões ao quarto. O Kairo move-se contigo, instantaneamente. O suporte offline garante que o teu fluxo nunca para — com ou sem ligação.
- text: "Sincronização em tempo real Funciona offline Login com Google Desktop Ativo Última sincronização: agora mesmo iPhone 15 Pro Ativo Última sincronização: há 2s iPad Pro Ativo Última sincronização: há 5s Modo offline Pronto Sem ligação necessária Sincronização encriptada ponta a ponta Sempre ativo 12K+ Tarefas concluídas diariamente 98% Taxa de retenção de utilizadores 4.9 ★ Classificação média da app 2K+ Líderes a bordo Testemunhos"
- heading "O que os líderes realmente dizem." [level=2]
- paragraph: Sem marketing. Sem linguagem corporativa. Apenas pessoas que usam o Kairo todos os dias.
- text: ★ ★ ★ ★ ★
- paragraph: "\"O Kairo substituiu quatro apps numa semana. Não voltei atrás. As minhas manhãs são estruturadas, a minha equipa está alinhada e saio mesmo do escritório às 6h.\""
- text: MH Marcus Holt CEO, Veridian Capital ★ ★ ★ ★ ★
- paragraph: "\"As sugestões da IA por si só valem a subscrição. É como ter um chefe de gabinete no bolso que realmente percebe como penso.\""
- text: PN Priya Nair Co-Founder, Nura Health ★ ★ ★ ★ ★
- paragraph: "\"Simples. Rápido. Sem peso. Finalmente uma app criada para pessoas que realmente gerem coisas — e não para quem gosta de organizar os seus sistemas de organização.\""
- text: JO James Okafor CTO, Axiom Labs 🏆 Destacado no Product Hunt ⭐ 4.9 estrelas — App Store 🌍 60+ países 🔒 SOC 2 Type II certificado Preços
- heading "Investe na tua clareza." [level=2]
- paragraph: Uma subscrição. Acesso total. Menos que o teu café da manhã, a compor diariamente.
- text: Grátis € 0 /mês
- paragraph: Começa a criar melhores hábitos. Grátis para sempre, sem cartão necessário.
- text: Gestão de tarefas Seguimento básico de hábitos Dashboard diário Login com Google Kairo AI Sincronização entre dispositivos
- link "Começar grátis":
  - /url: ./app.html
- text: Mais Popular Pro € 9 .99 /mês
- paragraph: Todo o poder do Kairo. Para líderes que não cedem.
- text: Tudo do Grátis
- strong: Kairo AI — acesso total
- text: Sincronização entre dispositivos Histórico completo e analíticas Modo offline Suporte prioritário
- link "Começar Pro →":
  - /url: ./app.html?upgrade=pro
- text: Enterprise Custom
- paragraph: Para organizações que funcionam com excelência. Adaptado à tua equipa.
- text: Tudo do Pro Dashboards de equipa SSO e controlos de administrador Onboarding dedicado SLA e conformidade Integrações personalizadas
- link "Contactar vendas →":
  - /url: mailto:hello@kairo.app
- text: Como Funciona
- heading "Começa em 4 passos simples" [level=2]
- paragraph: Do registo à primeira tarefa concluída em menos de 2 minutos.
- text: "1"
- heading "Cria a tua conta" [level=4]
- paragraph:
  - text: Acede a
  - strong: kairoelite.app
  - text: e clica em "Entrar com Google". Instantâneo — sem formulários, sem passwords.
- text: "2"
- heading "Explora o Dashboard" [level=4]
- paragraph: "O Dashboard mostra tudo de relance: tarefas, hábitos, compromissos, produtividade e sugestões da Kairo AI."
- text: "3"
- heading "Cria tarefas e hábitos" [level=4]
- paragraph: Criação rápida com prioridade, categoria e prazo. Adiciona hábitos diários para construir rotinas de elite.
- text: "4"
- heading "Acompanha o progresso" [level=4]
- paragraph: Marca tarefas concluídas, mantém streaks nos hábitos e vê a produtividade subir em tempo real.
- heading "O que podes fazer com o Kairo" [level=3]
- paragraph: Guia rápido de cada secção da app
- text: 📊
- heading "Dashboard" [level=4]
- paragraph: Visão completa do teu dia. Métricas em tempo real, produtividade, saudação personalizada e sugestões da Kairo AI.
- text: 📅
- heading "Agenda" [level=4]
- paragraph: Vista diária e semanal. Cria eventos com horário, categoria e notas. Edita ou apaga a qualquer momento.
- text: ✅
- heading "Tarefas" [level=4]
- paragraph: Criação rápida com prioridade, categoria e prazo. Filtra por estado. Até 10 no Free, ilimitadas no Pro.
- text: 🔄
- heading "Hábitos" [level=4]
- paragraph: Streaks, progresso semanal e sugestões AI. Constrói rotinas que se mantêm. Até 6 no Free, ilimitados no Pro.
- text: 🤖
- heading "Kairo AI" [level=4]
- paragraph: Assistente inteligente que analisa o teu dia. Pergunta sobre tarefas, hábitos, prioridades ou produtividade.
- text: 📈
- heading "Histórico & Exportação" [level=4]
- paragraph: Registo completo de tarefas, filtros por data e categoria, e exportação de relatórios em Word. (Pro)
- heading "Perguntas Frequentes" [level=3]
- heading "Posso usar no telemóvel?" [level=4]
- paragraph: Sim! O Kairo é uma PWA. No Chrome, abre kairoelite.app e toca em "Adicionar ao ecrã inicial". Funciona como app nativa.
- heading "Os meus dados são seguros?" [level=4]
- paragraph: Sim. Utilizamos Firebase (Google Cloud) com autenticação segura. Cada utilizador só acede aos seus próprios dados.
- heading "Como cancelo a subscrição?" [level=4]
- paragraph: Na app, clica em "Gerir Subscrição" para aceder ao portal Stripe. Cancela, altera pagamento ou consulta faturas a qualquer momento.
- heading "Como uso um voucher?" [level=4]
- paragraph: Na app, clica em "⚡ Pro", introduz o código no campo "Código voucher" e clica "Aplicar". O Pro é ativado imediatamente.
- heading "Funciona offline?" [level=4]
- paragraph: A app carrega offline graças ao Service Worker. Funcionalidades que requerem sincronização necessitam de ligação à internet.
- text: Começar
- heading "\"Os melhores líderes não trabalham mais arduamente. Trabalham com ferramentas mais precisas.\"" [level=2]:
  - text: "\"Os melhores líderes não trabalham mais arduamente. Trabalham com"
  - emphasis: ferramentas mais precisas.
  - text: "\""
- paragraph: Sem configuração. Sem curva de aprendizagem. Abre o Kairo, e o teu dia está organizado.
- link "Começar Grátis":
  - /url: ./app.html
- link "Ver preços":
  - /url: "#pricing"
- link "App Store (coming soon)":
  - /url: "#"
  - text: Descarregar no App Store
- link "Google Play (coming soon)":
  - /url: "#"
  - text: ▶ Disponível no Google Play
- contentinfo:
  - link "Kairo Kairo":
    - /url: "#"
    - img "Kairo"
    - text: Kairo
  - paragraph: O centro de comando para líderes que executam. Construído para a clareza, projetado para a execução.
  - link "X / Twitter":
    - /url: "#"
    - img
  - link "LinkedIn":
    - /url: "#"
    - img
  - link "GitHub":
    - /url: "#"
    - img
  - heading "Produto" [level=5]
  - list:
    - listitem:
      - link "Funcionalidades":
        - /url: "#features"
    - listitem:
      - link "Preços":
        - /url: "#pricing"
    - listitem:
      - link "Abrir App":
        - /url: ./app.html
    - listitem:
      - link "Novidades":
        - /url: "#"
  - heading "Empresa" [level=5]
  - list:
    - listitem:
      - link "Sobre":
        - /url: "#"
    - listitem:
      - link "Blog":
        - /url: "#"
    - listitem:
      - link "Carreiras":
        - /url: "#"
    - listitem:
      - link "Contacto":
        - /url: mailto:hello@kairo.app
  - heading "Legal" [level=5]
  - list:
    - listitem:
      - link "Política de Privacidade":
        - /url: ./privacidade.html
    - listitem:
      - link "Termos de Serviço":
        - /url: ./termos.html
    - listitem:
      - link "Política de Cookies":
        - /url: ./privacidade.html#cookies
    - listitem:
      - link "Segurança":
        - /url: ./privacidade.html
  - paragraph: © 2025 Kairo. Todos os direitos reservados.
  - link "Privacidade":
    - /url: ./privacidade.html
  - link "Termos":
    - /url: ./termos.html
  - link "Contacto":
    - /url: mailto:hello@kairoelite.app
```

# Test source

```ts
  1  | const { test, expect } = require('@playwright/test');
  2  | 
  3  | test.describe('Acesso da Landing Page para a App', () => {
  4  |   test('deve permitir clicar no CTA "Começar Grátis" e redirecionar para app', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     const cta = page.locator('a[href*="app.html"], a:has-text("Começar"), a:has-text("Grátis"), button:has-text("Começar"), button:has-text("Grátis")').first();
  7  |     await expect(cta).toBeVisible();
  8  |     const href = await cta.getAttribute('href');
  9  |     expect(href).toContain('app.html');
  10 |   });
  11 | 
  12 |   test('deve ter link para versão EN no header', async ({ page }) => {
  13 |     await page.goto('/');
  14 |     const enLink = page.locator('a[href="landing-en.html"]').first();
> 15 |     await expect(enLink).toBeVisible({ timeout: 5000 });
     |                          ^ Error: expect(locator).toBeVisible() failed
  16 |   });
  17 | });
  18 | 
```