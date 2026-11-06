/**
 * FCM & PWA Notification Helper for Yuva Shakti Group
 * Handles:
 * 1. Notification permission request
 * 2. Service Worker registration (firebase-messaging-sw.js)
 * 3. Token generation and saving to Firestore / LocalStorage
 * 4. Local fallback notification simulation
 */

export async function initNotificationServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    console.log('Push notifications not supported on this device/browser');
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Firebase messaging service worker registered with scope:', reg.scope);
    return true;
  } catch (err) {
    console.warn('Service worker registration failed:', err);
    return false;
  }
}

export async function requestNotificationPermissionAndGetToken(
  memberId?: string
): Promise<{ granted: boolean; token?: string }> {
  if (!('Notification' in window)) {
    return { granted: false };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // In real FCM, this calls getToken(messaging, { vapidKey: '...' })
      // Here we create a persistent device token ID and store in localStorage
      let token = localStorage.getItem('ysg_fcm_token');
      if (!token) {
        token = `fcm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('ysg_fcm_token', token);
      }

      // Save token association with member in local storage
      const tokenRecord = {
        token,
        memberId: memberId || 'guest',
        device: navigator.userAgent,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('ysg_device_token_record', JSON.stringify(tokenRecord));

      return { granted: true, token };
    }
  } catch (err) {
    console.error('Error requesting notification permission:', err);
  }

  return { granted: false };
}

export function triggerLocalNotification(title: string, body: string, icon = '/favicon.ico'): boolean {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon,
      });
      return true;
    } catch (e) {
      console.warn('Native notification failed, fallback console', e);
    }
  }
  return false;
}
