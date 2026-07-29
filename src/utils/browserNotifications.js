/**
 * Permiso de notificaciones del navegador (Notification API).
 * El envío real de avisos va por Web Push (utils/webPush.js + api/send-push.js),
 * que sí llega con el navegador cerrado. Esto solo gestiona el permiso que
 * exige tanto Notification como PushManager antes de poder suscribirse.
 */

export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function notificationPermission() {
  return notificationsSupported() ? Notification.permission : 'unsupported'
}

export async function requestNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return Notification.permission
  }
}
