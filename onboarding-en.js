/**
 * Kairo Onboarding — 3 steps for new users (English)
 * Saves state to Firestore (hasSeenOnboarding = true)
 */

(function () {
  'use strict';

  const STEPS = [
    {
      icon: 'layout-dashboard',
      title: 'Dashboard',
      text: 'Your command center. See today\'s tasks, habits and productivity metrics at a glance.'
    },
    {
      icon: 'check-square',
      title: 'Tasks',
      text: 'Organize by priority, date and client. Mark as done and stay focused on what really matters.'
    },
    {
      icon: 'heart-pulse',
      title: 'Habits',
      text: 'Build winning routines. Log daily and watch your streak grow — small wins every day.'
    }
  ];

  let currentStep = 0;
  let _userUid = null;

  function getCard()  { return document.getElementById('onboarding-card'); }
  function getOverlay() { return document.getElementById('onboarding-overlay'); }

  async function checkIfFirstTime(uid) {
    if (!uid || !db) return false;
    try {
      const doc = await db.collection('users').doc(uid).get();
      return doc.exists && !doc.data().hasSeenOnboarding;
    } catch (e) {
      console.error('[Onboarding] Error checking:', e);
      return false;
    }
  }

  function renderStep(index) {
    const step = STEPS[index];
    const card = getCard();
    if (!card) return;
    card.classList.add('hidden');
    setTimeout(() => {
      card.querySelector('.onboarding-icon').innerHTML = `<i data-lucide="${step.icon}"></i>`;
      card.querySelector('.onboarding-step-title').textContent = step.title;
      card.querySelector('.onboarding-step-text').textContent  = step.text;

      const dots = card.querySelectorAll('.onboarding-dot');
      dots.forEach((d, i) => d.classList.toggle('active', i === index));

      const prevBtn = document.getElementById('onboarding-prev');
      const nextBtn = document.getElementById('onboarding-next');
      if (prevBtn) prevBtn.style.display = index === 0 ? 'none' : 'inline-block';
      if (nextBtn) nextBtn.textContent = index === STEPS.length - 1 ? 'Get Started' : 'Next';
      card.querySelector('.onboarding-skip').textContent = 'Skip';

      card.classList.remove('hidden');
      if (window.lucide && lucide.createIcons) lucide.createIcons();
    }, 280);
  }

  window.openOnboarding = function () {
    currentStep = 0;
    renderStep(0);
    const ov = getOverlay();
    if (ov) ov.classList.add('active');
  };

  window.nextOnboardingStep = function () {
    if (currentStep < STEPS.length - 1) {
      currentStep++;
      renderStep(currentStep);
    } else {
      finishOnboarding();
    }
  };

  window.prevOnboardingStep = function () {
    if (currentStep > 0) {
      currentStep--;
      renderStep(currentStep);
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
      console.error('[Onboarding] Error saving:', e);
      localStorage.setItem('kairo_onboarding_done', '1');
    }
  };

  function maybeStart(uid) {
    _userUid = uid;
    if (localStorage.getItem('kairo_onboarding_done') === '1') return;
    checkIfFirstTime(uid).then(first => {
      if (first && !document.getElementById('login-screen')?.classList.contains('active')) {
        setTimeout(() => openOnboarding(), 500);
      }
    });
  }

  window._triggerOnboarding = maybeStart;
})();
