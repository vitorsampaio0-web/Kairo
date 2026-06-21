const { test: base, expect } = require('@playwright/test');

const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.addInitScript(() => {
      window.__E2E_MOCK_USER__ = {
        uid: 'e2e-test-user-123',
        email: 'test@kairoelite.app',
        displayName: 'Test User',
        photoURL: 'https://ui-avatars.com/api/?name=Test+User',
      };
      const waitForFirebase = () => {
        if (typeof firebase !== 'undefined' && firebase.auth) {
          const originalAuth = firebase.auth;
          let currentUser = window.__E2E_MOCK_USER__;
          firebase.auth = function(...args) {
            const auth = originalAuth.apply(this, args);
            if (!auth._e2eMocked) {
              auth._e2eMocked = true;
              auth.onAuthStateChanged = function(cb) {
                setTimeout(() => cb(currentUser), 50);
                return () => {};
              };
              auth.signInWithPopup = async () => ({
                user: currentUser,
                additionalUserInfo: { isNewUser: false },
              });
              auth.signOut = async () => { currentUser = null; };
              auth.currentUser = currentUser;
            }
            return auth;
          };
        } else {
          setTimeout(waitForFirebase, 50);
        }
      };
      waitForFirebase();
    });
    await use(page);
  },
});

module.exports = { test, expect };
