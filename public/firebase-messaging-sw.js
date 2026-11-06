// firebase-messaging-sw.js - PWA Service Worker for Background Push Notifications
// युवा शक्ति ग्रुप (भाटी परिवार • कुचेरा)

importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDummyKeyForWorker",
  authDomain: "yuva-shakti-group.firebaseapp.com",
  projectId: "yuva-shakti-group",
  storageBucket: "yuva-shakti-group.appspot.com",
  messagingSenderId: "507192586860",
  appId: "1:507192586860:web:yuva-shakti-app",
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'युवा शक्ति ग्रुप (कुचेरा)';
  const notificationOptions = {
    body: payload.notification?.body || 'नया परिवार संदेश व अंशदान स्मरण।',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.data?.tag || 'ysg-notification',
    data: {
      url: payload.data?.url || '/',
      timestamp: Date.now(),
    },
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open_app', title: 'ऐप खोलें' },
      { action: 'close', title: 'बंद करें' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
