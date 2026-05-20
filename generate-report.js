const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
  BorderStyle, WidthType, ShadingType, PageNumber, PageBreak,
  ExternalHyperlink
} = require('docx');
const fs = require('fs');

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const allBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

function createCell(text, width, options = {}) {
  const children = [];
  if (Array.isArray(text)) {
    text.forEach(t => children.push(new Paragraph({ children: [new TextRun({ text: t, bold: options.bold, size: options.size || 22, font: 'Calibri' })] })));
  } else {
    children.push(new Paragraph({ children: [new TextRun({ text, bold: options.bold, size: options.size || 22, font: 'Calibri' })] }));
  }
  return new TableCell({
    borders: allBorders,
    width: { size: width, type: WidthType.DXA },
    shading: options.shading ? { fill: options.shading, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children,
  });
}

function createTable(headers, rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const headerRow = new TableRow({
    children: headers.map((h, i) => createCell(h, colWidths[i], { bold: true, shading: '2D3E50', size: 22 })),
  });
  const dataRows = rows.map(row =>
    new TableRow({
      children: row.map((cell, i) => createCell(cell, colWidths[i])),
    })
  );
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows],
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Calibri', size: 22 } } },
    paragraphStyles: [
      {
        id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 36, bold: true, font: 'Calibri', color: '2D3E50' },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Calibri', color: '2D3E50' },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
      },
      {
        id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Calibri', color: '4A5568' },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: 'bullet-list',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '\u2022',
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: 'Kairo Elite - Documentação Técnica', size: 18, color: '888888', font: 'Calibri' })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'Página ', size: 18, font: 'Calibri' }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, font: 'Calibri' }),
            new TextRun({ text: ' de ', size: 18, font: 'Calibri' }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: 'Calibri' }),
          ],
        })],
      }),
    },
    children: [
      // CAPA
      new Paragraph({ spacing: { before: 2000 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'KAIRO ELITE', size: 72, bold: true, font: 'Calibri', color: '2D3E50' })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Documentação Técnica do Projeto', size: 36, font: 'Calibri', color: '4A5568' })],
      }),
      new Paragraph({ spacing: { before: 600 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Versão 1.0 | Maio 2026', size: 24, font: 'Calibri', color: '718096' })],
      }),
      new Paragraph({ spacing: { before: 2000 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Documento preparado para entrega a equipas técnicas e stakeholders.', size: 20, font: 'Calibri', color: '718096', italics: true })],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ÍNDICE
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Índice')] }),
      new Paragraph({ children: [new TextRun('1. Visão Geral do Projeto')] }),
      new Paragraph({ children: [new TextRun('2. Arquitetura e Infraestrutura')] }),
      new Paragraph({ children: [new TextRun('3. Base de Dados (Firestore)')] }),
      new Paragraph({ children: [new TextRun('4. Autenticação e Segurança')] }),
      new Paragraph({ children: [new TextRun('5. APIs e Serviços Externos')] }),
      new Paragraph({ children: [new TextRun('6. Cloud Functions')] }),
      new Paragraph({ children: [new TextRun('7. Frontend e Funcionalidades')] }),
      new Paragraph({ children: [new TextRun('8. Deploy e CI/CD')] }),
      new Paragraph({ children: [new TextRun('9. Alterações Recentes')] }),
      new Paragraph({ children: [new TextRun('10. Checklist de Segurança')] }),
      new Paragraph({ children: [new PageBreak()] }),

      // 1. VISÃO GERAL
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('1. Visão Geral do Projeto')] }),
      new Paragraph({
        children: [new TextRun({ text: 'Kairo Elite ', bold: true }), new TextRun('é uma aplicação de produtividade de elite dirigida a CEOs, fundadores e executivos C-level. A plataforma combina gestão de tarefas, hábitos, agenda, metas e decisões com um assistente de IA integrado (Kairo AI).')],
      }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('1.1 Objetivo')] }),
      new Paragraph({ children: [new TextRun('Substituir múltiplas ferramentas fragmentadas (Slack, Notion, Todoist, Calendário) por um único centro de comando com IA, focado em execução e não em gestão de sistemas.')] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('1.2 Tecnologias Principais')] }),
      createTable(
        ['Camada', 'Tecnologia', 'Descrição'],
        [
          ['Frontend', 'HTML5 + CSS3 + JavaScript (vanilla)', 'SPA sem framework, código inline em ficheiros HTML'],
          ['Hosting', 'Firebase Hosting', 'CDN global, HTTPS obrigatório, PWA'],
          ['Base de Dados', 'Firestore (NoSQL)', 'Base de dados em tempo real da Google'],
          ['Autenticação', 'Firebase Authentication', 'Google OAuth + Email/Password'],
          ['Backend', 'Firebase Cloud Functions', 'Node.js 22, funções HTTP e agendadas'],
          ['Pagamentos', 'Stripe', 'Subscrições Pro (ambiente de teste)'],
          ['Email', 'Resend', 'Emails transacionais (digest, convites)'],
          ['Push', 'Firebase Cloud Messaging', 'Notificações push no browser/mobile'],
        ],
        [2200, 2800, 4500]
      ),
      new Paragraph({ children: [new PageBreak()] }),

      // 2. ARQUITETURA
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('2. Arquitetura e Infraestrutura')] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('2.1 Domínio e Hosting')] }),
      createTable(
        ['Propriedade', 'Valor'],
        [
          ['Domínio Principal', 'kairoelite.app'],
          ['Projeto Firebase', 'kairo-3a7e4'],
          ['Hosting Público', 'Raiz do projeto (todos os ficheiros HTML)'],
          ['Rewrite Principal', '/ → landing.html'],
          ['PWA', 'Sim (manifest.json, service worker, instalável)'],
          ['SSL/TLS', 'Obrigatório (Firebase Hosting)'],
        ],
        [3500, 6000]
      ),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('2.2 Estrutura de Ficheiros')] }),
      new Paragraph({ children: [new TextRun('O projeto segue uma arquitetura monolítica estática com os seguintes ficheiros principais:')] }),
      createTable(
        ['Ficheiro', 'Função', 'Linhas (~)'],
        [
          ['app.html', 'Aplicação principal (dashboard, tarefas, hábitos, etc.)', '7.937'],
          ['admin.html', 'Painel de administração (users, vouchers, config)', '1.504'],
          ['landing.html', 'Página de marketing e vendas', '2.123'],
          ['index.html', 'Landing premium "para CEOs"', '2.265'],
          ['guide.html', 'Guia de produto e funcionalidades', '~700'],
          ['kairo-brochure.html', 'Brochura/documentação de produto', '~830'],
          ['firebase.json', 'Configuração Firebase (hosting, functions, firestore)', '~50'],
          ['firestore.rules', 'Regras de segurança da base de dados', '~94'],
          ['functions/index.js', 'Cloud Functions (Node.js 22)', '~1.156'],
        ],
        [2200, 4800, 2500]
      ),
      new Paragraph({ children: [new PageBreak()] }),

      // 3. BASE DE DADOS
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('3. Base de Dados (Firestore)')] }),
      new Paragraph({ children: [new TextRun('O Firestore é a base de dados principal em tempo real. A estrutura segue um modelo hierárquico de coleções e sub-coleções.')] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('3.1 Estrutura de Coleções')] }),
      createTable(
        ['Coleção', 'Descrição', 'Acesso'],
        [
          ['users/{uid}', 'Dados do utilizador + subscrição', 'Próprio utilizador ou admin (leitura)'],
          ['users/{uid}/tarefas', 'Tarefas pessoais', 'Apenas o próprio uid'],
          ['users/{uid}/habitos', 'Hábitos com streaks', 'Apenas o próprio uid'],
          ['users/{uid}/eventos', 'Eventos de agenda', 'Apenas o próprio uid'],
          ['users/{uid}/metas', 'Metas e objetivos', 'Apenas o próprio uid'],
          ['users/{uid}/decisoes', 'Registo de decisões', 'Apenas o próprio uid'],
          ['teams/{teamId}', 'Equipas colaborativas', 'Membros da equipa (membrosUids)'],
          ['teams/{teamId}/tarefas', 'Tarefas partilhadas da equipa', 'Membros da equipa'],
          ['teams/{teamId}/atividade', 'Feed de atividade (append-only)', 'Membros da equipa (create/read)'],
          ['referrals/{code}', 'Códigos de convite', 'Dono do código ou validação específica'],
          ['referrals/{code}/conversoes', 'Conversões por convite', 'Apenas o próprio uid'],
          ['vouchers/{code}', 'Vouchers Pro', 'Bloqueado no frontend (só via Functions)'],
          ['config/{doc}', 'Feature flags globais', 'Leitura autenticada, escrita só admin'],
          ['admins/{uid}', 'Lista de administradores', 'Cada admin só lê o seu registo'],
        ],
        [2200, 4800, 2500]
      ),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('3.2 Modelo de Subscrição (users/{uid})')] }),
      new Paragraph({ children: [new TextRun('O campo subscription guarda o estado da subscrição de cada utilizador:')] }),
      createTable(
        ['Campo', 'Tipo', 'Descrição'],
        [
          ['plan', 'string', '"free" ou "pro"'],
          ['source', 'string', '"stripe", "voucher", "admin" ou null'],
          ['stripeCustomerId', 'string', 'ID do cliente Stripe'],
          ['subscriptionId', 'string', 'ID da subscrição Stripe'],
          ['status', 'string', '"active", "trialing", "canceled" ou null'],
          ['currentPeriodEnd', 'Timestamp', 'Fim do período atual (Stripe)'],
          ['expiresAt', 'Timestamp', 'Data de expiração (vouchers)'],
        ],
        [2800, 2200, 4500]
      ),
      new Paragraph({ children: [new PageBreak()] }),

      // 4. AUTENTICAÇÃO E SEGURANÇA
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('4. Autenticação e Segurança')] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('4.1 Métodos de Autenticação')] }),
      new Paragraph({ numbering: { reference: 'bullet-list', level: 0 }, children: [new TextRun({ text: 'Google OAuth: ', bold: true }), new TextRun('Sign-in via popup com GoogleAuthProvider')] }),
      new Paragraph({ numbering: { reference: 'bullet-list', level: 0 }, children: [new TextRun({ text: 'Email/Password: ', bold: true }), new TextRun('Registo com createUserWithEmailAndPassword() e login com signInWithEmailAndPassword()')] }),
      new Paragraph({ numbering: { reference: 'bullet-list', level: 0 }, children: [new TextRun({ text: 'Logout: ', bold: true }), new TextRun('firebase.auth().signOut()')] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('4.2 Regras de Segurança do Firestore')] }),
      new Paragraph({ children: [new TextRun('As regras foram reforçadas em maio de 2026 para proteger dados PII e prevenir enumeração:')] }),
      createTable(
        ['Coleção', 'Regra de Leitura', 'Regra de Escrita'],
        [
          ['users/{uid}', 'Próprio uid OU admin', 'Próprio uid'],
          ['users/{uid}/tarefas', 'Próprio uid', 'Próprio uid'],
          ['teams/{teamId}', 'Membro OU código de convite', 'Membro OU quem se adiciona'],
          ['teams/{teamId}/atividade', 'Membro', 'Membro (create), update/delete bloqueado'],
          ['referrals/{code}', 'Dono do código OU código específico', 'Autenticado (create)'],
          ['vouchers/{code}', 'BLOQUEADO', 'BLOQUEADO'],
          ['config/{doc}', 'Autenticado', 'Admin'],
        ],
        [2200, 3800, 3500]
      ),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('4.3 Segurança de Dados')] }),
      new Paragraph({ numbering: { reference: 'bullet-list', level: 0 }, children: [new TextRun({ text: 'Passwords: ', bold: true }), new TextRun('Geridas exclusivamente pelo Firebase Auth (bcrypt), nunca armazenadas no Firestore')] }),
      new Paragraph({ numbering: { reference: 'bullet-list', level: 0 }, children: [new TextRun({ text: 'HTTPS: ', bold: true }), new TextRun('Toda a comunicação é encriptada TLS 1.3')] }),
      new Paragraph({ numbering: { reference: 'bullet-list', level: 0 }, children: [new TextRun({ text: 'Tokens JWT: ', bold: true }), new TextRun('Verificados no backend via admin.auth().verifyIdToken()')] }),
      new Paragraph({ numbering: { reference: 'bullet-list', level: 0 }, children: [new TextRun({ text: 'Chaves secretas: ', bold: true }), new TextRun('Armazenadas em functions/.env (não expostas no cliente)')] }),
      new Paragraph({ numbering: { reference: 'bullet-list', level: 0 }, children: [new TextRun({ text: 'CSP: ', bold: true }), new TextRun('Content Security Policy ativo (bloqueia eval e inline scripts não autorizados)')] }),
      new Paragraph({ children: [new PageBreak()] }),

      // 5. APIs E SERVIÇOS
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('5. APIs e Serviços Externos')] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('5.1 Stripe (Pagamentos)')] }),
      createTable(
        ['Propriedade', 'Valor'],
        [
          ['Biblioteca', 'stripe@^14.0.0'],
          ['API Version', '2023-10-16'],
          ['Ambiente', 'Teste (sk_test_...)'],
          ['Price ID Pro', 'price_1TWHCbAhC7GjF6oy2gz7Hh2e'],
          ['Webhook Secret', 'whsec_MkXQ5vTtVYw4D6Ogj2I5JdJkiFxGmHtw'],
          ['Fluxo', 'Checkout Session → Webhook → Atualização Firestore'],
        ],
        [3500, 6000]
      ),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('5.2 Resend (Emails)')] }),
      createTable(
        ['Propriedade', 'Valor'],
        [
          ['Biblioteca', 'resend@^3.0.0'],
          ['Domínios', 'digest@kairoelite.app, noreply@kairoelite.app'],
          ['Uso', 'Digest diário, resumo semanal, convites de equipa'],
        ],
        [3500, 6000]
      ),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('5.3 Firebase Cloud Messaging (Push)')] }),
      new Paragraph({ children: [new TextRun('Notificações push via FCM token guardado em users/{uid}.notificacoes.fcmToken. Service worker dedicado: firebase-messaging-sw.js')] }),
      new Paragraph({ children: [new PageBreak()] }),

      // 6. CLOUD FUNCTIONS
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('6. Cloud Functions')] }),
      new Paragraph({ children: [new TextRun('Todas as functions são HTTP (onRequest) com CORS aberto, exceto 2 que são onCall. Todas verificam o token Firebase no header Authorization.')] }),
      createTable(
        ['Function', 'Tipo', 'Descrição'],
        [
          ['createCheckoutSession', 'HTTP', 'Cria sessão Stripe Checkout'],
          ['stripeWebhook', 'HTTP', 'Recebe webhooks Stripe (subscription events)'],
          ['createCustomerPortalSession', 'HTTP', 'Abre portal de faturação Stripe'],
          ['redeemVoucher', 'HTTP', 'Resgata voucher Pro'],
          ['adminGetUsers', 'HTTP', 'Lista utilizadores (só admin)'],
          ['adminCreateVoucher', 'HTTP', 'Cria voucher (só admin)'],
          ['adminGetVouchers', 'HTTP', 'Lista vouchers (só admin)'],
          ['adminCreateUser', 'HTTP', 'Cria utilizador email/password (só admin)'],
          ['adminSetAdmin', 'HTTP', 'Adiciona admin (só admin)'],
          ['adminRemoveAdmin', 'HTTP', 'Remove admin (só admin)'],
          ['saveEmailDigest', 'HTTP', 'Guarda preferências de digest'],
          ['sendTaskReminders', 'PubSub * * * * *', 'Notificações push de tarefas (a cada minuto)'],
          ['sendDailyDigest', 'PubSub 0 * * * *', 'Envia digest diário via Resend'],
          ['sendWeeklyReview', 'PubSub 0 * * * *', 'Envia resumo semanal via Resend'],
          ['processReferral', 'onCall', 'Processa convite e credita 30 dias Pro'],
          ['sendTeamInvite', 'onCall', 'Envia email de convite para equipa'],
        ],
        [3200, 1800, 4500]
      ),
      new Paragraph({ children: [new PageBreak()] }),

      // 7. FRONTEND
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('7. Frontend e Funcionalidades')] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('7.1 Bibliotecas Externas (CDN)')] }),
      createTable(
        ['Biblioteca', 'Versão', 'Função'],
        [
          ['Firebase', '10.12.0 (compat)', 'App, Auth, Firestore, Messaging, Functions'],
          ['Lucide Icons', 'latest', 'Ícones SVG'],
          ['jsPDF', '2.5.1', 'Geração PDF do Relatório Executivo'],
          ['html2canvas', 'latest', 'Captura de ecrã para PDF'],
        ],
        [3000, 2500, 4000]
      ),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('7.2 Funcionalidades Principais (app.html)')] }),
      createTable(
        ['Vista', 'Funcionalidade', 'Restrição'],
        [
          ['Dashboard', 'Métricas, insights AI, tarefas atrasadas, produtividade', 'Livre'],
          ['Agenda', 'Calendário de eventos e tarefas por dia', 'Livre'],
          ['Tarefas', 'CRUD, prioridade, prazo, categoria, criação por voz', 'Voz: Pro'],
          ['Hábitos', 'Hábitos com streaks e check-in diário', 'Livre'],
          ['Metas', 'Metas com progresso', 'Livre'],
          ['Equipa', 'Equipas colaborativas com código', 'Livre'],
          ['Decisões', 'Registo de decisões tomadas', 'Livre'],
          ['Relatório', 'Relatório Executivo PDF', 'Pro'],
          ['Kairo AI', 'Chat com motor de regras local', 'Pro'],
        ],
        [2000, 5000, 2500]
      ),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('7.3 Planos e Limitações')] }),
      createTable(
        ['Plano', 'Tarefas', 'Hábitos', 'Kairo AI', 'Relatório PDF', 'Exportar Word'],
        [
          ['Free', 'Máx. 10', 'Máx. 6', 'Não', 'Não', 'Não'],
          ['Pro', 'Ilimitado', 'Ilimitado', 'Sim', 'Sim', 'Sim'],
        ],
        [2000, 1800, 1800, 1800, 2000, 2000]
      ),
      new Paragraph({ children: [new PageBreak()] }),

      // 8. DEPLOY
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('8. Deploy e CI/CD')] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('8.1 Deploy Manual (Firebase CLI)')] }),
      new Paragraph({ children: [new TextRun('O deploy é feito manualmente via Firebase CLI. Não existe CI/CD automatizado configurado.')] }),
      new Paragraph({ children: [new TextRun({ text: 'Deploy completo:', bold: true })] }),
      new Paragraph({ children: [new TextRun('firebase deploy')] }),
      new Paragraph({ children: [new TextRun({ text: 'Apenas hosting:', bold: true })] }),
      new Paragraph({ children: [new TextRun('firebase deploy --only hosting')] }),
      new Paragraph({ children: [new TextRun({ text: 'Apenas functions:', bold: true })] }),
      new Paragraph({ children: [new TextRun('firebase deploy --only functions')] }),
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('8.2 Repositório Git')] }),
      createTable(
        ['Propriedade', 'Valor'],
        [
          ['Repositório', 'https://github.com/vitorsampaio0-web/Kairo.git'],
          ['Branch Principal', 'main'],
          ['CI/CD', 'Não configurado (sem .github/workflows/)'],
        ],
        [3500, 6000]
      ),
      new Paragraph({ children: [new PageBreak()] }),

      // 9. ALTERAÇÕES RECENTES
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('9. Alterações Recentes')] }),
      new Paragraph({ children: [new TextRun('Resumo das alterações feitas em maio de 2026:')] }),
      createTable(
        ['Data', 'Alteração', 'Ficheiro', 'Descrição'],
        [
          ['Mai/2026', 'Título atualizado', 'index.html, landing.html', '"Kairo — Produtividade de um CEO"'],
          ['Mai/2026', 'Regras Firestore reforçadas', 'firestore.rules', 'Teams/referrals/conversoes restritos'],
          ['Mai/2026', 'Data movida para hero card', 'app.html', 'Data no dashboard, removida do topbar'],
          ['Mai/2026', 'Botão Kairo AI no topbar', 'app.html', 'Botão de chat movido para header'],
          ['Mai/2026', 'Relatório na sidebar', 'app.html', 'Relatório Executivo como item de navegação'],
          ['Mai/2026', 'Guia no menu', 'app.html', 'Link para kairo-brochure.html no menu do avatar'],
          ['Mai/2026', 'Fundo sidebar removido', 'app.html', 'Barra cinzenta removida da sidebar inferior'],
        ],
        [1500, 2800, 2200, 3000]
      ),
      new Paragraph({ children: [new PageBreak()] }),

      // 10. CHECKLIST
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('10. Checklist de Segurança')] }),
      new Paragraph({ children: [new TextRun('Estado atual das práticas de segurança do projeto:')] }),
      createTable(
        ['Item', 'Estado', 'Notas'],
        [
          ['HTTPS/TLS', 'OK', 'Firebase Hosting serve sempre HTTPS'],
          ['Password Hashing', 'OK', 'Firebase Auth (bcrypt)'],
          ['Segredos no servidor', 'OK', 'process.env (Stripe, Resend)'],
          ['Regras Firestore', 'OK', 'Granulares, reforçadas em mai/2026'],
          ['CSP Ativo', 'OK', 'Bloqueia eval e scripts inline'],
          ['Auth Token Verification', 'OK', 'verifyIdToken() em todas as functions'],
          ['Webhook Stripe', 'OK', 'Assinatura verificada com constructEvent()'],
          ['Cache local encriptado', 'ATENÇÃO', 'IndexedDB não encripta dados localmente'],
          ['Requisito password', 'ATENÇÃO', 'Mínimo 6 caracteres (recomendado: 8+)'],
          ['CSP Headers no firebase.json', 'PENDENTE', 'Não configurados explicitamente'],
        ],
        [3500, 1500, 4500]
      ),
      new Paragraph({ spacing: { before: 400 } }),
      new Paragraph({
        children: [new TextRun({ text: '--- Fim do Documento ---', size: 20, color: '718096', font: 'Calibri', italics: true })],
        alignment: AlignmentType.CENTER,
      }),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('C:\\Users\\vitor\\projects\\exe-pro\\Kairo_Elite_Documentacao_Tecnica.docx', buffer);
  console.log('Documento criado com sucesso!');
});
