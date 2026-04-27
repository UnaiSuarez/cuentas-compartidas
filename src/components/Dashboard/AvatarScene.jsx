/**
 * Escena de avatares animados que representan el estado financiero del grupo.
 * El estado del avatar depende del saldo calculado:
 *   bal > 0  → 'happy'  (te deben dinero)
 *   bal = 0  → 'normal'
 *   bal < 0  → 'dead'   (debes dinero)
 */

import { motion }        from 'framer-motion'
import { getAvatarByKey } from '../../assets/avatars'

export default function AvatarScene({ users, balances, activeUser }) {
  if (!users.length) return null

  function getAvatarState(userId) {
    const bal = balances[userId] ?? 0
    if (bal > 0.01)  return 'happy'
    if (bal < -0.01) return 'dead'
    return 'normal'
  }

  return (
    <div className="glass rounded-2xl p-6 overflow-hidden">
      <p className="text-slate-400 text-xs uppercase tracking-wider mb-4 text-center">
        Estado del grupo
      </p>
      <div className="flex justify-center items-end gap-6 flex-wrap">
        {users.map((user, i) => {
          const AvatarComp = getAvatarByKey(user.avatar)
          const state      = getAvatarState(user.id)
          const isActive   = activeUser?.id === user.id
          const color      = user.color || '#2563eb'

          return (
            <motion.div
              key={user.id}
              className="flex flex-col items-center gap-2 cursor-default"
              animate={
                state === 'happy'
                  ? { y: [0, -14, -4, -12, 0] }
                  : state === 'dead'
                  ? { x: [0, -6, 6, -4, 4, -2, 2, 0], y: 2 }
                  : { y: [0, -6, 0] }
              }
              transition={
                state === 'happy'
                  ? { duration: 0.9, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }
                  : state === 'dead'
                  ? { duration: 1.4, delay: i * 0.25, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.2 }
                  : { duration: 2.5 + i * 0.3, delay: i * 0.4, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <div className={`relative rounded-full p-1 transition-all
                              ${isActive
                                ? 'ring-2 ring-blue-400/60 ring-offset-2 ring-offset-slate-900'
                                : ''}`}>
                {/* Halo de color según estado */}
                <div className={`absolute inset-0 rounded-full blur-lg opacity-30
                                ${state === 'happy' ? 'bg-emerald-400'
                                : state === 'dead'  ? 'bg-red-400'
                                : 'bg-blue-400'}`}/>
                <AvatarComp
                  key={state}
                  state={state}
                  color={color}
                  size={state === 'dead' ? 70 : 80}
                />
                {/* Emoji de estado */}
                <span className="absolute -top-1 -right-1 text-sm">
                  {state === 'happy' ? '😄' : state === 'dead' ? '😵' : '😐'}
                </span>
              </div>
              <p className="text-sm font-medium text-white">{user.name}</p>
              {isActive && (
                <span className="text-xs text-blue-400 font-medium">Tú</span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
