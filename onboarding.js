/**
 * Kairo Onboarding — 3 passos para novos utilizadores
 * Guarda estado no Firestore (campo hasSeenOnboarding = true)
 */

(function () {
  'use strict';

  const STEPS_PT = [
    {
      icon: 'layout-dashboard',
      title: 'Dashboard',
      text: 'O teu centro de comando. Ves tarefas do dia, habitos e metricas de produtividade num relance.'
    },
    {
      icon: 'check-square',
      title: 'Tarefas',
      text: 'Organiza por prioridade, data e cliente. Marca como concluida e ganha foco nos que realmente importam.'
    },
    {
      icon: 'heart-pulse',
      title: 'Habitos',
      text: 'Construi rotinas vencedoras. Regista diariamente e vê o teu streak crescer — pequenas vitorias diarias.'
    }
  ];

  let currentStep = 0;
  let _userUid = null;

  function getCard() {
    return document.getElementById('onboarding-card');
  }
  function getOverlay() {
    return document.getElementById('onboarding-overlay');
  }

  async function checkIfFirstTime(uid) {
    if (!uid || !db) return false;
    try {
      const doc = await db.collection('users').doc(uid).get();
      return doc.exists && !doc.data().hasSeenOnboarding;
    } catch (e) {
      console.error('[Onboarding] Erro ao verificar:', e);
      return false;
    }
  }

  function renderStep(index, direction) {
    const step = STEPS_PT[index];
    const card = getCard();
    const iconEl = card.querySelector('.onboarding-icon');

    /* transicao */
    card.classList.add('hidden');
    setTimeout(() => {
      iconEl.innerHTML = `<i data-lucide="${step.icon}"></i>`;
      card.querySelector('.onboarding-step-title').textContent = step.title;
      card.querySelector('.onboarding-step-text').textContent = step.text;

      /* dots */
      const dots = card.querySelectorAll('.onboarding-dot');
      dots.forEach((d, i) => d.classList.toggle('active', i === index));

      /* botoes */
      const prevBtn = document.getElementById('onboarding-prev');
      const nextBtn = document.getElementById('onboarding-next');
      if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
      if (nextBtn) nextBtn.textContent = index === STEPS_PT.length - 1 ? 'Comecar' : 'Seguinte';

      card.classList.remove('hidden');
      if (window.lucide && lucide.createIcons) lucide.createIcons();
    }, 280);
  }

  window.openOnboarding = function () {
    currentStep = 0;
    renderStep(0, 1);
    const ov = getOverlay();
    if (ov) ov.classList.add('active');
  };

  window.nextOnboardingStep = function () {
    if (currentStep < STEPS_PT.length - 1) {
      currentStep++;
      renderStep(currentStep, 1);
    } else {
      finishOnboarding();
    }
  };

  window.prevOnboardingStep = function () {
    if (currentStep > 0) {
      currentStep--;
      renderStep(currentStep, -1);
    }
  };

  window.finishOnboarding = async function () {
    const ov = getOverlay();
    if (ov) ov.classList.remove('active');
    try {
      if (_userUid && db) {
        await db.collection('users').doc(_userUid).update({ hasSeenOnboarding: true });
      }
      localStorage.setItem('kairo_onboarding_done', '1');
    } catch (e) {
      console.error('[Onboarding] Erro ao gravar:', e);
      localStorage.setItem('kairo_onboarding_done', '1');
    }
  };

  /* arranque automatico após login */
  function maybeStart(uid) {
    _userUid = uid;
    if (localStorage.getItem('kairo_onboarding_done') === '1') return;
    checkIfFirstTime(uid).then(first => {
      if (first && !document.getElementById('login-screen')?.classList.contains('active')) {
        setTimeout(() => openOnboarding(), 500);
      }
    });
  }

  /* expor para o auth listener no app.html chamar */
  window._triggerOnboarding = maybeStart;
})();
