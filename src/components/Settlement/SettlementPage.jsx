/**
 * Página dedicada a la liquidación de deudas.
 *
 * Muestra:
 * 1. Saldo neto de cada miembro (positivo = te deben, negativo = debes)
 * 2. Lista de pagos óptimos (algoritmo greedy, estilo Tricount)
 * 3. Historial de pagos confirmados
 */

import { motion }        from 'framer-motion'
import { ArrowRight, CheckCircle, Clock, History } from 'lucide-react'
import { useApp }        from '../../context/AppContext'
import { useSettlement } from '../../hooks/useSettlement'
import { formatCurrency, amountColor } from '../../utils/formatters'
import { getAvatarByKey } from '../../assets/avatars'

export default function SettlementPage() {
  const { userProfile, groupMembers, payments: pendingPayments }     = useApp()
  const { summary, requestPayment, confirmPayment, confirming }      = useSettlement()

  const getMemberName  = id => groupMembers.find(m => m.id === id)?.name || '?'
  const getMemberColor = id => groupMembers.find(m => m.id === id)?.color || '#2563eb'
  const getMemberAvatar = id => groupMembers.find(m => m.id === id)?.avatar

  // Elimina duplicados: queda solo el pago más reciente por par (from, to)
  const uniquePending = [...pendingPayments.reduce((map, p) => {
    const key = `${p.from}-${p.to}`
    if (!map.has(key)) map.set(key, p)
    return map
  }, new Map()).values()]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Liquidación</h2>

      {/* ── Saldo por persona ──────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Saldo actual</p>
        <div className="space-y-3">
          {groupMembers.map((member, i) => {
            const bal     = summary.balances[member.id] ?? 0
            const Av      = getAvatarByKey(member.avatar)
            const isMe    = member.id === userProfile?.id
            const state   = bal > 0.01 ? 'happy' : bal < -0.01 ? 'dead' : 'normal'
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
                    {bal > 0.01
                      ? '✅ Le deben dinero'
                      : bal < -0.01
                      ? '⚠️ Debe dinero'
                      : '🎉 En paz'
                    }
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
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Pagos a realizar</p>
          <div className="space-y-3">
            {summary.pagosOptimos.map((p, i) => {
              const isDebtor   = userProfile?.id === p.de
              const isCreditor = userProfile?.id === p.a
              const alreadyDeclared = isDebtor && pendingPayments.some(
                pay => pay.from === userProfile?.id &&
                       pay.to === p.a &&
                       Math.abs(pay.amount - p.monto) < 0.01
              )
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-xl
                              ${isDebtor   ? 'bg-red-500/10 border border-red-500/20'
                              : isCreditor ? 'bg-emerald-500/10 border border-emerald-500/20'
                              : 'bg-slate-800/40'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-center">
                      <p className="text-xs text-red-400 font-medium truncate max-w-[80px]">
                        {getMemberName(p.de)}
                      </p>
                      <p className="text-xs text-slate-600">paga</p>
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

                  {isDebtor && (
                    alreadyDeclared
                      ? <span className="shrink-0 text-xs text-amber-400 px-3 py-1.5
                                         bg-amber-500/10 rounded-lg border border-amber-500/20">
                          Declarado ✓
                        </span>
                      : <button
                          onClick={() => requestPayment(p.a, p.monto)}
                          disabled={confirming}
                          className="shrink-0 text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30
                                     px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-all disabled:opacity-50"
                        >
                          He pagado
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

      {/* ── Pagos pendientes de confirmar ─────────────────────────────────── */}
      {uniquePending.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} className="text-amber-400"/>
            <p className="text-slate-400 text-xs uppercase tracking-wider">
              Esperando confirmación ({uniquePending.length})
            </p>
          </div>
          <div className="space-y-2">
            {uniquePending.map(pay => {
              const isCreditor = userProfile?.id === pay.to
              return (
                <div
                  key={pay.id}
                  className="flex items-center justify-between p-3
                             bg-amber-500/10 border border-amber-500/20 rounded-xl"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-amber-300 font-medium">{getMemberName(pay.from)}</span>
                    <ArrowRight size={13} className="text-slate-500"/>
                    <span className="text-emerald-300 font-medium">{getMemberName(pay.to)}</span>
                    <span className="text-white font-bold">{formatCurrency(pay.amount)}</span>
                  </div>
                  {isCreditor && (
                    <button
                      onClick={() => confirmPayment(pay.id, pay)}
                      disabled={confirming}
                      className="flex items-center gap-1.5 text-xs bg-emerald-600/20 text-emerald-400
                                 border border-emerald-500/30 px-3 py-1.5 rounded-lg
                                 hover:bg-emerald-600/30 transition-all disabled:opacity-50"
                    >
                      <CheckCircle size={13}/>
                      Confirmar
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
