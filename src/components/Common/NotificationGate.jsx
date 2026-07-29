import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, BellRing, RefreshCw } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import {
  notificationsSupported, notificationPermission, requestNotificationPermission,
} from '../../utils/browserNotifications'
import { subscribeToWebPush } from '../../utils/webPush'
import AppLogo from '../../assets/AppLogo'

/**
 * Bloquea el acceso a la app hasta que el usuario active las notificaciones
 * del navegador (o hasta que quede claro que no se puede, ej. Safari iOS).
 * No vuelve a aparecer una vez concedido el permiso. En cuanto se concede,
 * suscribe el navegador a Web Push (llega aunque esté cerrado) y guarda la
 * suscripción en su perfil para que el resto del grupo pueda avisarle.
 */
export default function NotificationGate({ children }) {
  const { userProfile, updateUserProfile } = useApp()
  const [permission, setPermission] = useState(notificationPermission())
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    if (!notificationsSupported() || !navigator.permissions?.query) return
    let status
    navigator.permissions.query({ name: 'notifications' }).then(s => {
      status = s
      setPermission(s.state)
      s.onchange = () => setPermission(s.state)
    }).catch(() => {})
    return () => { if (status) status.onchange = null }
  }, [])

  // En cuanto hay permiso, asegura que la suscripción de Web Push esté guardada
  useEffect(() => {
    if (permission !== 'granted' || !userProfile || userProfile.webPushSubscription) return
    subscribeToWebPush().then(sub => {
      if (sub) updateUserProfile({ webPushSubscription: sub })
    })
  }, [permission, userProfile, updateUserProfile])

  async function handleActivate() {
    setRequesting(true)
    try {
      const result = await requestNotificationPermission()
      setPermission(result)
    } finally {
      setRequesting(false)
    }
  }

  function recheck() {
    setPermission(notificationPermission())
  }

  if (permission === 'granted' || permission === 'unsupported') {
    return children
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950
                    flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 max-w-sm w-full text-center"
      >
        <div className="flex justify-center mb-3">
          <AppLogo size={40}/>
        </div>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/15 flex items-center justify-center">
          {permission === 'denied' ? <BellRing size={28} className="text-amber-400"/> : <Bell size={28} className="text-blue-400"/>}
        </div>

        <h2 className="text-lg font-bold text-white mb-2">Activa las notificaciones</h2>

        {permission === 'denied' ? (
          <>
            <p className="text-slate-400 text-sm mb-5">
              Las bloqueaste antes. Actívalas desde el candado 🔒 junto a la URL del navegador
              (Notificaciones → Permitir) y vuelve aquí.
            </p>
            <button
              onClick={recheck}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500
                         text-white py-3 rounded-xl text-sm font-medium transition-all"
            >
              <RefreshCw size={15}/> Ya las activé, comprobar
            </button>
          </>
        ) : (
          <>
            <p className="text-slate-400 text-sm mb-5">
              Necesitamos tu permiso para avisarte de gastos nuevos, recordatorios de pago
              y turnos de limpieza aunque no tengas la pestaña abierta delante.
            </p>
            <button
              onClick={handleActivate}
              disabled={requesting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500
                         disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition-all"
            >
              {requesting
                ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : <><Bell size={15}/> Activar notificaciones</>}
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}
