importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAjkpXMcKg7651b0DIRbeMk0QDmx7a5JGM',
  authDomain: 'kairo-3a7e4.firebaseapp.com',
  projectId: 'kairo-3a7e4',
  storageBucket: 'kairo-3a7e4.firebasestorage.app',
  messagingSenderId: '137726126366',
  appId: '1:137726126366:web:839bc38fc611a730a5810f'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Kairo', {
    body: body || '',
    icon: '/logo-kairo.png',
    badge: '/logo-kairo.png',
    data: { url: payload.data?.url || 'https://kairoelite.app/app.html' },
    actions: [{ action: 'open', title: 'Abrir App' }]
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || 'https://kairoelite.app/app.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const match = list.find(c => c.url.includes('kairoelite.app'));
      return match ? match.focus() : clients.openWindow(url);
    })
  );
});
