import { useNavigate }  from 'react-router-dom'
import { motion }       from 'framer-motion'
import { ArrowRight, Plus } from 'lucide-react'
import { useApp }       from '../../context/AppContext'
import { useSettlement } from '../../hooks/useSettlement'
import { formatCurrency } from '../../utils/formatters'

export default function BalanceCard() {
  const navigate = useNavigate()
  const { userProfile, groupMembers } = useApp()
  const { summary }                   = useSettlement()

  const getMemberName = id => groupMembers.find(m => m.id === id)?.name || '?'

  const hasPagos = summary.pagosOptimos.length > 0

  if (!hasPagos) return (
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
    <div className="glass rounded-2xl p-4">
      <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Pagos a realizar</p>
      <p className="text-slate-500 text-xs mb-3">
        Añade el importe como ingreso para saldar automáticamente.
      </p>
      <div className="space-y-2">
        {summary.pagosOptimos.map((p, i) => {
          const isMe = userProfile?.id === p.de
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center justify-between p-3 rounded-xl
                          ${isMe ? 'bg-red-500/10 border border-red-500/20' : 'bg-slate-800/50'}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-red-400 font-medium truncate text-sm">{getMemberName(p.de)}</span>
                <ArrowRight size={14} className="text-slate-500 shrink-0"/>
                <span className="text-emerald-400 font-medium truncate text-sm">{getMemberName(p.a)}</span>
                <span className="text-white font-bold text-sm">{formatCurrency(p.monto)}</span>
              </div>
              {isMe && (
                <button
                  onClick={() => navigate('/transacciones')}
                  className="shrink-0 flex items-center gap-1 text-xs bg-blue-600/20 text-blue-400
                             border border-blue-500/30 px-2 py-1 rounded-lg hover:bg-blue-600/30 transition-all"
                >
                  <Plus size={11}/> Añadir
                </button>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
