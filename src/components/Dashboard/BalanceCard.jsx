import { motion }        from 'framer-motion'
import { ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { useApp }        from '../../context/AppContext'
import { useSettlement } from '../../hooks/useSettlement'
import { formatCurrency } from '../../utils/formatters'

export default function BalanceCard() {
  const { userProfile, groupMembers, payments: pendingPayments } = useApp()
  const { summary, requestPayment, confirmPayment, confirming }  = useSettlement()

  const getMemberName = id => groupMembers.find(m => m.id === id)?.name || 'Desconocido'

  // Elimina duplicados: queda solo el pago más reciente por par (from, to)
  const uniquePending = [...pendingPayments.reduce((map, p) => {
    const key = `${p.from}-${p.to}`
    if (!map.has(key)) map.set(key, p)
    return map
  }, new Map()).values()]

  const hasPagos   = summary.pagosOptimos.length > 0
  const hasPending = uniquePending.length > 0

  if (!hasPagos && !hasPending) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-2xl p-6 text-center"
    >
      <p className="text-4xl mb-2">🎉</p>
      <p className="text-emerald-400 font-semibold">¡Todo en orden!</p>
      <p className="text-slate-400 text-sm mt-1">No hay deudas pendientes en el grupo.</p>
    </motion.div>
  )

  return (
    <div className="space-y-3">

      {/* ── Pagos óptimos calculados ─────────────────────────────────────── */}
      {hasPagos && (
        <div className="glass rounded-2xl p-4">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">
            Pagos a realizar
          </p>
          <div className="space-y-2">
            {summary.pagosOptimos.map((p, i) => {
              const isDebtor = userProfile?.id === p.de
              const alreadyDeclared = isDebtor && pendingPayments.some(
                pay => pay.from === userProfile?.id &&
                       pay.to === p.a &&
                       Math.abs(pay.amount - p.monto) < 0.01
              )
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-red-400 font-medium truncate text-sm">{getMemberName(p.de)}</span>
                    <ArrowRight size={14} className="text-slate-500 shrink-0"/>
                    <span className="text-emerald-400 font-medium truncate text-sm">{getMemberName(p.a)}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-white font-bold text-sm">{formatCurrency(p.monto)}</span>
                    {isDebtor && (
                      alreadyDeclared
                        ? <span className="text-xs text-amber-400 px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            Declarado ✓
                          </span>
                        : <button
                            onClick={() => requestPayment(p.a, p.monto)}
                            disabled={confirming}
                            className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30
                                       px-2 py-1 rounded-lg hover:bg-blue-600/30 transition-all disabled:opacity-50"
                          >
                            He pagado
                          </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Pagos pendientes de confirmación ─────────────────────────────── */}
      {hasPending && (
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-amber-400"/>
            <p className="text-slate-400 text-xs uppercase tracking-wider">
              Esperando confirmación
            </p>
          </div>
          <div className="space-y-2">
            {uniquePending.map(pay => (
              <div
                key={pay.id}
                className="flex items-center justify-between p-3
                           bg-amber-500/10 border border-amber-500/20 rounded-xl"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-amber-300">{getMemberName(pay.from)}</span>
                  <ArrowRight size={14} className="text-slate-500"/>
                  <span className="text-emerald-300">{getMemberName(pay.to)}</span>
                  <span className="text-white font-bold">{formatCurrency(pay.amount)}</span>
                </div>
                {userProfile?.id === pay.to && (
                  <button
                    onClick={() => confirmPayment(pay.id, pay)}
                    disabled={confirming}
                    className="flex items-center gap-1 text-xs bg-emerald-600/20 text-emerald-400
                               border border-emerald-500/30 px-2 py-1 rounded-lg
                               hover:bg-emerald-600/30 transition-all disabled:opacity-50"
                  >
                    <CheckCircle size={12}/>
                    Confirmar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
