// Service Worker mínimo para Web Push — se registra en src/utils/webPush.js.
// Solo hace dos cosas: mostrar la notificación al recibir un push, y
// llevar al usuario a la pantalla correcta si hace click en ella.

self.addEventListener('push', (event) => {
  let payload = { title: 'Cuentas Compartidas', body: '', data: {} }
  try {
    payload = { ...payload, ...event.data.json() }
  } catch {
    if (event.data) payload.body = event.data.text()
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: payload.data,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const screen = event.notification.data?.screen
  const path = {
    chat: '/chat', liquidacion: '/liquidacion', transacciones: '/transacciones',
    limpieza: '/limpieza', ajustes: '/ajustes',
  }[screen] || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(path)
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(path)
    })
  )
})
