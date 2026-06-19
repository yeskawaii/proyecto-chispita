import { precacheAndRoute } from 'workbox-precaching';

// Precarga de archivos estáticos de Vite (el array es inyectado en build time por workbox)
precacheAndRoute(self.__WB_MANIFEST);

// Manejo del evento push
self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : { title: 'Chispita', body: 'Tienes una nueva actualización.' };
  
  const options = {
    body: data.body,
    icon: '/pwa-icon.svg',
    badge: '/pwa-icon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Manejo del click en la notificación
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
