/**
 * Función serverless (Vercel) — único componente "con servidor" de la app.
 * Envía Web Push real (llega aunque el navegador esté cerrado) firmando
 * cada envío con la clave privada VAPID, que nunca debe salir de aquí.
 *
 * Variables de entorno requeridas (Vercel → Settings → Environment Variables):
 *   VITE_VAPID_PUBLIC_KEY  (la misma que usa el cliente para suscribirse)
 *   VAPID_PRIVATE_KEY      (secreta, solo aquí)
 *   VAPID_SUBJECT          (opcional, "mailto:tu-correo@dominio.com")
 *
 * Body esperado: { subscriptions: [{endpoint, keys:{p256dh, auth}}], title, body, data? }
 */

import webpush from 'web-push'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const publicKey  = process.env.VITE_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) {
    res.status(500).json({ error: 'VAPID keys no configuradas en el servidor' })
    return
  }

  const { subscriptions, title, body, data } = req.body || {}
  if (!Array.isArray(subscriptions) || !subscriptions.length || !title) {
    res.status(400).json({ error: 'Faltan subscriptions o title' })
    return
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:soporte@cuentas-compartidas.app',
    publicKey,
    privateKey
  )

  const payload = JSON.stringify({ title, body: body || '', data: data || {} })

  const results = await Promise.allSettled(
    subscriptions.map(sub => webpush.sendNotification(sub, payload))
  )

  const sent   = results.filter(r => r.status === 'fulfilled').length
  const failed = results.length - sent

  res.status(200).json({ sent, failed })
}
