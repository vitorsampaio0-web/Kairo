const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Stripe } = require("stripe");
const { Resend } = require("resend");
const cors = require("cors")({ origin: true });

admin.initializeApp();
const db = admin.firestore();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStripe() {
  const secret = process.env.STRIPE_SECRET;
  return new Stripe(secret, { apiVersion: "2023-10-16" });
}

/**
 * Verifica se o uid e administrador.
 * Lanca functions.https.HttpsError se nao for.
 */
async function requireAdmin(uid) {
  const snap = await db.doc(`admins/${uid}`).get();
  if (!snap.exists) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Acesso restrito a administradores."
    );
  }
}

/**
 * Extrai e verifica o Firebase ID token de um request HTTP.
 * Retorna o uid ou lanca erro.
 */
async function verifyRequest(req) {
  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer (.+)$/i);
  if (!match) throw new Error("Token em falta");
  const decoded = await admin.auth().verifyIdToken(match[1]);
  return decoded.uid;
}

/**
 * Converte subscription do Stripe para o objeto que guardamos no Firestore.
 */
function stripeSubToFirestore(stripeSub) {
  return {
    plan: stripeSub.status === "active" || stripeSub.status === "trialing" ? "pro" : "free",
    source: "stripe",
    subscriptionId: stripeSub.id,
    status: stripeSub.status,
    currentPeriodEnd: admin.firestore.Timestamp.fromMillis(stripeSub.current_period_end * 1000),
    expiresAt: null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

// ---------------------------------------------------------------------------
// 1. createCheckoutSession
// ---------------------------------------------------------------------------

exports.createCheckoutSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const uid = await verifyRequest(req);
      const input = req.body.data || req.body || {};
      const priceId = input.priceId || process.env.STRIPE_PRICE_ID;
      const stripe = getStripe();

      // Ler/criar Stripe Customer
      let stripeCustomerId = null;
      const userDoc = await db.doc(`users/${uid}`).get();
      if (userDoc.exists) {
        const d = userDoc.data();
        stripeCustomerId = d.subscription?.stripeCustomerId || null;
      }

      if (!stripeCustomerId) {
        const authUser = await admin.auth().getUser(uid);
        const customer = await stripe.customers.create({
          email: authUser.email || undefined,
          name: authUser.displayName || undefined,
          metadata: { firebaseUID: uid },
        });
        stripeCustomerId = customer.id;
        await db.doc(`users/${uid}`).set(
          {
            subscription: {
              plan: "free",
              source: null,
              stripeCustomerId,
              subscriptionId: null,
              status: null,
              currentPeriodEnd: null,
              expiresAt: null,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
          },
          { merge: true }
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: stripeCustomerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `https://kairoelite.app/app.html?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://kairoelite.app/app.html?checkout=cancelled`,
        metadata: { firebaseUID: uid },
        subscription_data: {
          metadata: { firebaseUID: uid },
        },
        allow_promotion_codes: true,
      });

      res.json({ result: { url: session.url } });
    } catch (err) {
      console.error("[createCheckoutSession]", err);
      res.status(500).json({ error: { message: err.message } });
    }
  });
});

// ---------------------------------------------------------------------------
// 2. stripeWebhook
// ---------------------------------------------------------------------------

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("[Webhook] Assinatura invalida:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const uid = session.metadata?.firebaseUID;
        if (!uid) {
          console.warn("[Webhook] checkout.session.completed sem firebaseUID");
          break;
        }
        // Obter subscription completa
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        await db.doc(`users/${uid}`).set(
          {
            subscription: {
              ...stripeSubToFirestore(sub),
              stripeCustomerId: session.customer,
            },
          },
          { merge: true }
        );
        console.log(`[Webhook] checkout.session.completed: uid=${uid}, plan=pro`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const uid = sub.metadata?.firebaseUID;
        if (!uid) {
          // Tentar via customer
          const customers = await db
            .collection("users")
            .where("subscription.stripeCustomerId", "==", sub.customer)
            .limit(1)
            .get();
          if (!customers.empty) {
            const docRef = customers.docs[0].ref;
            await docRef.set(
              { subscription: stripeSubToFirestore(sub) },
              { merge: true }
            );
          }
          break;
        }
        await db.doc(`users/${uid}`).set(
          { subscription: stripeSubToFirestore(sub) },
          { merge: true }
        );
        console.log(`[Webhook] subscription.updated: uid=${uid}, status=${sub.status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const uid = sub.metadata?.firebaseUID;

        const downgrade = {
          plan: "free",
          source: null,
          subscriptionId: null,
          status: "canceled",
          currentPeriodEnd: null,
          expiresAt: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (uid) {
          await db.doc(`users/${uid}`).set(
            { subscription: downgrade },
            { merge: true }
          );
        } else {
          const customers = await db
            .collection("users")
            .where("subscription.stripeCustomerId", "==", sub.customer)
            .limit(1)
            .get();
          if (!customers.empty) {
            await customers.docs[0].ref.set(
              { subscription: downgrade },
              { merge: true }
            );
          }
        }
        console.log(`[Webhook] subscription.deleted: uid=${uid || "unknown"}`);
        break;
      }

      default:
        console.log(`[Webhook] Evento nao tratado: ${event.type}`);
    }
  } catch (err) {
    console.error("[Webhook] Erro ao processar evento:", err);
  }

  res.json({ received: true });
});

// ---------------------------------------------------------------------------
// 3. createCustomerPortalSession
// ---------------------------------------------------------------------------

exports.createCustomerPortalSession = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const uid = await verifyRequest(req);
      const stripe = getStripe();

      const userDoc = await db.doc(`users/${uid}`).get();
      const stripeCustomerId = userDoc.exists
        ? userDoc.data().subscription?.stripeCustomerId
        : null;

      if (!stripeCustomerId) {
        return res.status(404).json({ error: { message: "Nenhuma subscricao activa encontrada." } });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: "https://kairoelite.app/app.html",
      });

      res.json({ result: { url: session.url } });
    } catch (err) {
      console.error("[createCustomerPortalSession]", err);
      res.status(500).json({ error: { message: err.message } });
    }
  });
});

// ---------------------------------------------------------------------------
// 4. redeemVoucher
// ---------------------------------------------------------------------------

exports.redeemVoucher = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const uid = await verifyRequest(req);
      const input = req.body.data || req.body || {};
      const code = (input.code || "").trim().toUpperCase();

      if (!code) {
        return res.status(400).json({ error: { message: "Codigo em falta." } });
      }

      const voucherRef = db.doc(`vouchers/${code}`);
      const voucherSnap = await voucherRef.get();

      if (!voucherSnap.exists) {
        return res.status(404).json({ error: { message: "Codigo invalido." } });
      }

      const voucher = voucherSnap.data();

      if (voucher.usedBy && voucher.usedBy.includes(uid)) {
        return res.status(400).json({ error: { message: "Ja utilizaste este codigo." } });
      }

      if (voucher.usedBy && voucher.usedBy.length >= voucher.maxUses) {
        return res.status(400).json({ error: { message: "Codigo esgotado." } });
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + voucher.durationDays * 24 * 60 * 60 * 1000);

      const batch = db.batch();

      batch.set(
        db.doc(`users/${uid}`),
        {
          subscription: {
            plan: "pro",
            source: "voucher",
            stripeCustomerId: null,
            subscriptionId: null,
            status: "active",
            currentPeriodEnd: null,
            expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        },
        { merge: true }
      );

      batch.update(voucherRef, {
        usedBy: admin.firestore.FieldValue.arrayUnion(uid),
      });

      await batch.commit();

      res.json({ result: { success: true, expiresAt: expiresAt.toISOString(), durationDays: voucher.durationDays } });
    } catch (err) {
      console.error("[redeemVoucher]", err);
      res.status(500).json({ error: { message: err.message } });
    }
  });
});

// ---------------------------------------------------------------------------
// 5. adminGetUsers
// ---------------------------------------------------------------------------

exports.adminGetUsers = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const uid = await verifyRequest(req);
      await requireAdmin(uid);

      const listResult = await admin.auth().listUsers(1000);
      const authUsers = listResult.users;
      const batchSize = 10;
      const results = [];
      for (let i = 0; i < authUsers.length; i += batchSize) {
        const chunk = authUsers.slice(i, i + batchSize);
        const snaps = await Promise.all(
          chunk.map((u) => db.doc(`users/${u.uid}`).get())
        );
        snaps.forEach((snap, idx) => {
          const authUser = chunk[idx];
          const sub = snap.exists ? snap.data().subscription || {} : {};
          results.push({
            uid: authUser.uid,
            email: authUser.email || null,
            displayName: authUser.displayName || null,
            photoURL: authUser.photoURL || null,
            createdAt: authUser.metadata.creationTime || null,
            plan: sub.plan || "free",
            status: sub.status || null,
            source: sub.source || null,
            currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.toMillis() : null,
            expiresAt: sub.expiresAt ? sub.expiresAt.toMillis() : null,
          });
        });
      }
      res.json({ result: { users: results } });
    } catch (err) {
      console.error("[adminGetUsers]", err);
      res.status(401).json({ error: { message: err.message } });
    }
  });
});

// ---------------------------------------------------------------------------
// 6. adminCreateVoucher
// ---------------------------------------------------------------------------

exports.adminCreateVoucher = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const uid = await verifyRequest(req);
      await requireAdmin(uid);

      const input = req.body.data || req.body || {};
      console.log("[adminCreateVoucher] input:", JSON.stringify(input));

      const durationDays = Number(input.durationDays) || 30;
      const maxUses = Number(input.maxUses) || 1;
      const type = input.type || "pro_trial";

      let code = (input.code || "").trim().toUpperCase();
      if (!code) {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        code = Array.from({ length: 8 }, () =>
          chars[Math.floor(Math.random() * chars.length)]
        ).join("");
        code = `KAIRO-${code}`;
      }

      const ref = db.doc(`vouchers/${code}`);
      const existing = await ref.get();
      if (existing.exists) {
        return res.status(400).json({ error: { message: "Ja existe um voucher com este codigo." } });
      }

      await ref.set({
        type,
        durationDays,
        maxUses,
        usedBy: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: uid,
      });

      res.json({ result: { code } });
    } catch (err) {
      console.error("[adminCreateVoucher]", err);
      res.status(401).json({ error: { message: err.message } });
    }
  });
});

// ---------------------------------------------------------------------------
// 7. adminGetVouchers
// ---------------------------------------------------------------------------

exports.adminGetVouchers = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const uid = await verifyRequest(req);
      await requireAdmin(uid);

      const snap = await db
        .collection("vouchers")
        .orderBy("createdAt", "desc")
        .get();

      const vouchers = snap.docs.map((d) => ({
        code: d.id,
        type: d.data().type,
        durationDays: d.data().durationDays,
        maxUses: d.data().maxUses,
        usedCount: (d.data().usedBy || []).length,
        usedBy: d.data().usedBy || [],
        createdAt: d.data().createdAt ? d.data().createdAt.toMillis() : null,
        createdBy: d.data().createdBy || null,
      }));

      res.json({ result: { vouchers } });
    } catch (err) {
      console.error("[adminGetVouchers]", err);
      res.status(401).json({ error: { message: err.message } });
    }
  });
});

// ---------------------------------------------------------------------------
// 8. adminCreateUser — Cria utilizador com email/password
// ---------------------------------------------------------------------------

exports.adminCreateUser = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const uid = await verifyRequest(req);
      await requireAdmin(uid);

      const input = req.body.data || req.body || {};
      const email = (input.email || "").trim();
      const password = input.password || "";
      const displayName = (input.displayName || "").trim();
      const plan = input.plan || "free";

      if (!email || !password) {
        return res.status(400).json({ error: { message: "Email e password são obrigatórios." } });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: { message: "A password deve ter pelo menos 6 caracteres." } });
      }

      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: displayName || undefined,
        emailVerified: true,
      });

      const subData = {
        plan: plan,
        source: plan === "pro" ? "admin" : null,
        stripeCustomerId: null,
        subscriptionId: null,
        status: plan === "pro" ? "active" : null,
        currentPeriodEnd: null,
        expiresAt: null,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      await db.doc(`users/${userRecord.uid}`).set({
        subscription: subData,
        createdBy: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`[adminCreateUser] Created user ${userRecord.uid} (${email}) plan=${plan}`);

      res.json({
        result: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || null,
          plan,
        },
      });
    } catch (err) {
      console.error("[adminCreateUser]", err);
      const msg = err.code === "auth/email-already-exists"
        ? "Já existe um utilizador com este email."
        : err.code === "auth/invalid-email"
        ? "Email inválido."
        : err.message;
      res.status(400).json({ error: { message: msg } });
    }
  });
});

// ---------------------------------------------------------------------------
// 9. adminSetAdmin — Adiciona um UID à coleção 'admins'
// ---------------------------------------------------------------------------

exports.adminSetAdmin = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const callerUid = await verifyRequest(req);
      await requireAdmin(callerUid);

      const input = req.body.data || req.body || {};
      const targetUid = (input.uid || "").trim();

      if (!targetUid) {
        return res.status(400).json({ error: { message: "UID em falta." } });
      }

      await db.doc(`admins/${targetUid}`).set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        addedBy: callerUid,
      });

      console.log(`[adminSetAdmin] uid=${targetUid} adicionado por ${callerUid}`);
      res.json({ result: { success: true } });
    } catch (err) {
      console.error("[adminSetAdmin]", err);
      res.status(401).json({ error: { message: err.message } });
    }
  });
});

// ---------------------------------------------------------------------------
// 10. adminRemoveAdmin — Remove um UID da coleção 'admins'
// ---------------------------------------------------------------------------

exports.adminRemoveAdmin = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const callerUid = await verifyRequest(req);
      await requireAdmin(callerUid);

      const input = req.body.data || req.body || {};
      const targetUid = (input.uid || "").trim();

      if (!targetUid) {
        return res.status(400).json({ error: { message: "UID em falta." } });
      }

      if (targetUid === callerUid) {
        return res.status(400).json({ error: { message: "Não podes remover-te a ti próprio." } });
      }

      await db.doc(`admins/${targetUid}`).delete();

      console.log(`[adminRemoveAdmin] uid=${targetUid} removido por ${callerUid}`);
      res.json({ result: { success: true } });
    } catch (err) {
      console.error("[adminRemoveAdmin]", err);
      res.status(401).json({ error: { message: err.message } });
    }
  });
});

// ---------------------------------------------------------------------------
// 11. saveEmailDigest — Guarda preferências do digest diário
// ---------------------------------------------------------------------------

exports.saveEmailDigest = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const uid = await verifyRequest(req);
      const input = req.body.data || req.body || {};
      const { enabled, hour, email } = input;

      if (typeof hour !== "number" || hour < 0 || hour > 23) {
        return res.status(400).json({ error: { message: "Hora inválida (0-23)." } });
      }
      if (!email || !email.includes("@")) {
        return res.status(400).json({ error: { message: "Email inválido." } });
      }

      await db.doc(`users/${uid}`).set(
        { emailDigest: { enabled: Boolean(enabled), hour: Number(hour), email: email.trim() } },
        { merge: true }
      );

      res.json({ result: { success: true } });
    } catch (err) {
      console.error("[saveEmailDigest]", err);
      res.status(500).json({ error: { message: err.message } });
    }
  });
});

// ---------------------------------------------------------------------------
// 13. sendTaskReminders — Corre a cada minuto e envia notificações push
// ---------------------------------------------------------------------------

exports.sendTaskReminders = functions.pubsub
  .schedule("* * * * *")
  .timeZone("Europe/Lisbon")
  .onRun(async () => {
    const now = new Date();

    // Utilizadores com notificações ativas
    const usersSnap = await db.collection("users")
      .where("notificacoes.enabled", "==", true)
      .get();

    if (usersSnap.empty) return null;

    await Promise.all(usersSnap.docs.map(async (userDoc) => {
      const uid = userDoc.id;
      const { notificacoes } = userDoc.data();
      const minutos = notificacoes.minutos || 15;
      const fcmToken = notificacoes.fcmToken;
      if (!fcmToken) return;

      // Janela de 1 minuto centrada em now + minutos
      const target = new Date(now.getTime() + minutos * 60 * 1000);
      const windowStart = new Date(target.getTime() - 30 * 1000);
      const windowEnd   = new Date(target.getTime() + 30 * 1000);

      const fmt = (d) => d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"

      const tarefasSnap = await db.collection(`users/${uid}/tarefas`)
        .where("prazo", ">=", fmt(windowStart))
        .where("prazo", "<=", fmt(windowEnd))
        .where("status", "!=", "concluida")
        .get();

      if (tarefasSnap.empty) return;

      await Promise.all(tarefasSnap.docs.map(async (taskDoc) => {
        const task = taskDoc.data();
        if (task.lembretePush) return; // já notificado

        const hora = task.prazo.substring(11, 16);
        try {
          await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: "⏰ Kairo · Tarefa em breve",
              body: `"${task.titulo}" começa às ${hora}h (em ${minutos} min)`
            },
            webpush: {
              fcmOptions: { link: "https://kairoelite.app/app.html" },
              notification: { icon: "https://kairoelite.app/logo-kairo.png" }
            }
          });
          // Marcar como notificado
          await taskDoc.ref.update({ lembretePush: true });
          console.log(`[sendTaskReminders] Notificação enviada: ${uid} → "${task.titulo}"`);
        } catch (err) {
          console.error(`[sendTaskReminders] Erro para ${uid}:`, err.message);
        }
      }));
    }));

    return null;
  });

function buildDigestEmail(name, tasks, dateFormatted) {
  const prioColor = { alta: "#ff6b6b", media: "#ffa94d", baixa: "#74c0fc" };
  const prioLabel = { alta: "Alta", media: "Média", baixa: "Baixa" };

  const taskRows = tasks.length > 0
    ? tasks.map((t) => `
      <tr>
        <td style="padding:14px 20px;border-bottom:1px solid #1e1e32;">
          <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${prioColor[t.prioridade] || "#888"};margin-right:10px;vertical-align:middle;"></span>
          <strong style="color:#f0f0f0;font-size:15px;">${t.titulo}</strong>
          <br/>
          <span style="font-size:12px;color:#666;margin-left:19px;">
            ${t.prazo ? t.prazo.substring(11, 16) + "h" : ""}${t.categoria ? " · " + t.categoria : ""}${t.prioridade ? " · " + prioLabel[t.prioridade] : ""}
          </span>
        </td>
      </tr>`).join("")
    : `<tr><td style="padding:20px;color:#666;text-align:center;font-size:14px;">Sem tarefas para hoje. Aproveita o dia!</td></tr>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#7c5cff 0%,#4ea8ff 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:32px;font-weight:800;letter-spacing:-1px;">Kairo</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;letter-spacing:0.08em;text-transform:uppercase;">Elite Productivity</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#121220;padding:36px 40px;">
            <p style="margin:0 0 6px;font-size:17px;color:#d0d0e8;">Olá, <strong style="color:#fff;">${name}</strong> 👋</p>
            <p style="margin:0 0 28px;font-size:13px;color:#555;text-transform:capitalize;">${dateFormatted}</p>

            <p style="margin:0 0 14px;font-size:14px;color:#9090b0;">
              ${tasks.length > 0
    ? `Tens <strong style="color:#9b85ff;">${tasks.length} tarefa${tasks.length !== 1 ? "s" : ""}</strong> para hoje:`
    : "Não tens tarefas para hoje."}
            </p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a2e;border-radius:12px;overflow:hidden;border:1px solid #2a2a40;">
              ${taskRows}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0e0e1c;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#444;">
              Kairo Elite &nbsp;·&nbsp;
              <a href="https://kairoelite.app/app.html" style="color:#7c5cff;text-decoration:none;">Abrir App</a>
              &nbsp;·&nbsp;
              <a href="https://kairoelite.app/app.html?unsubscribe=1" style="color:#444;text-decoration:none;">Cancelar digest</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

exports.sendDailyDigest = functions.pubsub
  .schedule("0 * * * *")
  .timeZone("Europe/Lisbon")
  .onRun(async () => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const now = new Date();

    // Hora actual em Lisboa
    const lisbonHour = parseInt(
      new Intl.DateTimeFormat("pt-PT", {
        timeZone: "Europe/Lisbon",
        hour: "numeric",
        hour12: false,
      }).format(now),
      10
    );

    // Data de hoje em Lisboa (YYYY-MM-DD)
    const parts = new Intl.DateTimeFormat("pt-PT", {
      timeZone: "Europe/Lisbon",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now).split("/");
    const todayISO = `${parts[2]}-${parts[1]}-${parts[0]}`;

    const dateFormatted = new Intl.DateTimeFormat("pt-PT", {
      timeZone: "Europe/Lisbon",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(now);

    console.log(`[sendDailyDigest] Hora Lisboa: ${lisbonHour}, hoje: ${todayISO}`);

    // Utilizadores com digest activado para esta hora
    const usersSnap = await db
      .collection("users")
      .where("emailDigest.enabled", "==", true)
      .where("emailDigest.hour", "==", lisbonHour)
      .get();

    if (usersSnap.empty) {
      console.log(`[sendDailyDigest] Nenhum utilizador para hora ${lisbonHour}`);
      return null;
    }

    console.log(`[sendDailyDigest] ${usersSnap.size} utilizador(es) a processar`);

    await Promise.all(
      usersSnap.docs.map(async (userDoc) => {
        const uid = userDoc.id;
        const data = userDoc.data();
        const digest = data.emailDigest;
        const toEmail = digest.email;

        let displayName = "utilizador";
        try {
          const authUser = await admin.auth().getUser(uid);
          displayName = authUser.displayName || authUser.email?.split("@")[0] || "utilizador";
        } catch (_) {}

        // Tarefas de hoje não concluídas
        const tarefasSnap = await db.collection(`users/${uid}/tarefas`).get();
        const todayTasks = tarefasSnap.docs
          .map((d) => d.data())
          .filter((t) => t.prazo && t.prazo.startsWith(todayISO) && t.status !== "concluida")
          .sort((a, b) => {
            const order = { alta: 0, media: 1, baixa: 2 };
            return (order[a.prioridade] ?? 3) - (order[b.prioridade] ?? 3);
          });

        const html = buildDigestEmail(displayName, todayTasks, dateFormatted);

        try {
          await resend.emails.send({
            from: "Kairo <digest@kairoelite.app>",
            to: toEmail,
            subject: `📋 As tuas tarefas de hoje · ${dateFormatted}`,
            html,
          });
          console.log(`[sendDailyDigest] Enviado para ${toEmail} (uid=${uid}), ${todayTasks.length} tarefas`);
        } catch (err) {
          console.error(`[sendDailyDigest] Erro ao enviar para ${toEmail}:`, err.message);
        }
      })
    );

    return null;
  });
