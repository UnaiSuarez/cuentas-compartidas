/**
 * Suscripción del navegador a Web Push (llega aunque esté cerrado).
 * El envío real lo hace la función serverless en /api/send-push.js —
 * este archivo solo registra el Service Worker y obtiene la suscripción.
 */

export function webPushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

/**
 * Registra el Service Worker y suscribe al navegador a Web Push.
 * @returns {Promise<Object|null>} la suscripción en formato plano (para guardar en Firestore), o null si no es posible.
 */
export async function subscribeToWebPush() {
  if (!webPushSupported()) return null
  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!publicKey) {
    console.warn('[webPush] Falta VITE_VAPID_PUBLIC_KEY')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    const existing = await registration.pushManager.getSubscription()
    const subscription = existing || await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    })

    return subscription.toJSON()
  } catch (e) {
    console.warn('[webPush]', e.message)
    return null
  }
}
