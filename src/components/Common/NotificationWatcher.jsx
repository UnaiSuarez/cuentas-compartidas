import { useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { useCleaning } from '../../hooks/useCleaning'

/**
 * Componente sin UI: dispara runChecks() de limpieza una vez por sala/sesión,
 * para que los fallos se detecten (y se avise por Web Push/Expo) aunque nadie
 * abra la pestaña de Limpieza. Los avisos en sí ya no se muestran localmente
 * aquí — eso lo hace el Service Worker con la Web Push real (ver webPush.js
 * y api/send-push.js), que llega igual con la pestaña cerrada.
 */
export default function NotificationWatcher() {
  const { groupId, groupMembers } = useApp()
  const { runChecks } = useCleaning()
  const checkedGroupRef = useRef(null)

  useEffect(() => {
    if (!groupId || checkedGroupRef.current === groupId || !groupMembers.length) return
    checkedGroupRef.current = groupId
    runChecks()
  }, [groupId, groupMembers.length, runChecks])

  return null
}
