/**
 * Página de liquidación de deudas.
 *
 * Muestra saldo de cada miembro y pagos óptimos calculados.
 * El saldo se actualiza automáticamente cuando alguien añade un ingreso:
 * no hay flujo manual de confirmación.
 */

import { useNavigate }   from 'react-router-dom'
import { motion }        from 'framer-motion'
import { ArrowRight, Plus } from 'lucide-react'
import { useApp }        from '../../context/AppContext'
import { useSettlement } from '../../hooks/useSettlement'
import { formatCurrency, amountColor } from '../../utils/formatters'
import { getAvatarByKey } from '../../assets/avatars'

export default function SettlementPage() {
  const navigate = useNavigate()
  const { userProfile, groupMembers } = useApp()
  const { summary }                   = useSettlement()

  const getMemberName = id => groupMembers.find(m => m.id === id)?.name || '?'

  const myDebts     = summary.pagosOptimos.filter(p => p.de === userProfile?.id)
  const myCredits   = summary.pagosOptimos.filter(p => p.a  === userProfile?.id)
  const isDebtor    = myDebts.length   > 0
  const isCreditor  = myCredits.length > 0

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Liquidación</h2>

      {/* Info contextual para el usuario */}
      {isDebtor && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-red-300 text-sm font-medium mb-1">Tienes deudas pendientes</p>
          {myDebts.map((p, i) => (
            <p key={i} className="text-slate-300 text-sm">
              Debes <span className="text-white font-bold">{formatCurrency(p.monto)}</span>{' '}
              a <span className="text-emerald-400 font-medium">{getMemberName(p.a)}</span>.
              Cuando añadas ese importe como ingreso, se saldará automáticamente.
            </p>
          ))}
          <button
            onClick={() => navigate('/transacciones')}
            className="mt-3 flex items-center gap-2 text-sm bg-blue-600/20 text-blue-400
                       border border-blue-500/30 px-4 py-2 rounded-xl hover:bg-blue-600/30 transition-all"
          >
            <Plus size={14}/> Añadir ingreso
          </button>
        </div>
      )}

      {isCreditor && !isDebtor && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <p className="text-emerald-300 text-sm font-medium mb-1">Te deben dinero</p>
          {myCredits.map((p, i) => (
            <p key={i} className="text-slate-300 text-sm">
              <span className="text-amber-400 font-medium">{getMemberName(p.de)}</span>{' '}
              te debe <span className="text-white font-bold">{formatCurrency(p.monto)}</span>.
              Tu saldo se actualizará en cuanto añada fondos al grupo.
            </p>
          ))}
        </div>
      )}

      {/* ── Saldo por persona ──────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Saldo actual</p>
        <div className="space-y-3">
          {groupMembers.map((member, i) => {
            const bal   = summary.balances[member.id] ?? 0
            const Av    = getAvatarByKey(member.avatar)
            const isMe  = member.id === userProfile?.id
            const state = bal > 0.01 ? 'happy' : bal < -0.01 ? 'dead' : 'normal'
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center gap-4 p-4 rounded-xl
                            ${isMe ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-slate-800/40'}`}
              >
                <div className="shrink-0">
                  <Av state={state} color={member.color || '#2563eb'} size={48}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">
                    {member.name} {isMe && <span className="text-blue-400 text-xs">(tú)</span>}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {bal > 0.01 ? '✅ Le deben dinero' : bal < -0.01 ? '⚠️ Debe dinero' : '🎉 En paz'}
                  </p>
                </div>
                <p className={`text-xl font-bold tabular-nums shrink-0 ${amountColor(bal)}`}>
                  {formatCurrency(bal, true)}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Pagos óptimos ─────────────────────────────────────────────────── */}
      {summary.pagosOptimos.length > 0 ? (
        <div data-tutorial="optimal-payments" className="glass rounded-2xl p-5">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Pagos a realizar</p>
          <p className="text-slate-500 text-xs mb-4">
            Añade el importe como ingreso y el saldo se ajustará solo.
          </p>
          <div className="space-y-3">
            {summary.pagosOptimos.map((p, i) => {
              const isMe = userProfile?.id === p.de
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-xl
                              ${isMe ? 'bg-red-500/10 border border-red-500/20' : 'bg-slate-800/40'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-center">
                      <p className="text-xs text-red-400 font-medium truncate max-w-[80px]">
                        {getMemberName(p.de)}
                      </p>
                      <p className="text-xs text-slate-600">añade</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <ArrowRight size={16} className="text-slate-400"/>
                      <span className="text-white font-bold text-sm">{formatCurrency(p.monto)}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-emerald-400 font-medium truncate max-w-[80px]">
                        {getMemberName(p.a)}
                      </p>
                      <p className="text-xs text-slate-600">recibe</p>
                    </div>
                  </div>
                  {isMe && (
                    <button
                      onClick={() => navigate('/transacciones')}
                      className="shrink-0 flex items-center gap-1.5 text-xs bg-blue-600/20 text-blue-400
                                 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-all"
                    >
                      <Plus size={12}/> Añadir
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-4xl mb-2">🎉</p>
          <p className="text-emerald-400 font-semibold">¡Sin deudas!</p>
          <p className="text-slate-400 text-sm mt-1">Todos los saldos están equilibrados.</p>
        </div>
      )}
    </div>
  )
}
