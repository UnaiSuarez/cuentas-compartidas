import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { useApp }                    from '../../context/AppContext'
import { calculateBalanceBreakdown } from '../../utils/calculateSettlement'
import { formatCurrency }            from '../../utils/formatters'

export default function BalanceExplainer() {
  const { transactions, groupMembers } = useApp()
  const [open, setOpen] = useState(false)

  if (!groupMembers.length || !transactions.length) return null

  const nonSettlement = transactions.filter(tx => !tx.isSettlement)
  if (!nonSettlement.length) return null

  const { userBreakdowns, poolBalance, totalCommonExpenses } =
    calculateBalanceBreakdown(nonSettlement, groupMembers)

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-blue-400 shrink-0"/>
          <p className="text-sm font-medium text-white">¿Por qué tengo este saldo?</p>
        </div>
        {open
          ? <ChevronUp   size={16} className="text-slate-400 shrink-0"/>
          : <ChevronDown size={16} className="text-slate-400 shrink-0"/>
        }
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Fondo colectivo */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
            <p className="text-xs text-blue-300 font-medium mb-1">Fondo colectivo</p>
            <p className={`text-xl font-bold tabular-nums ${poolBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(poolBalance, true)}
            </p>
            {totalCommonExpenses > 0 && (
              <p className="text-xs text-slate-500 mt-0.5">
                Gastos comunes pagados del fondo: {formatCurrency(totalCommonExpenses)}
              </p>
            )}
          </div>

          {/* Desglose por persona */}
          <div className="space-y-2">
            {groupMembers.map(member => {
              const b = userBreakdowns[member.id]
              if (!b) return null

              const rows = []
              if (b.contributed > 0)
                rows.push({ label: 'Aportó al fondo', value:  b.contributed,       sign: '+' })
              if (b.commonShare > 0)
                rows.push({ label: 'Parte gastos comunes', value: -b.commonShare,  sign: '-' })
              if (b.advanced - b.selfPaidShare > 0)
                rows.push({ label: 'Adelantó por otros', value:  b.advanced - b.selfPaidShare, sign: '+' })
              if (b.owedShare > 0)
                rows.push({ label: 'Debe a otros por gastos',   value: -b.owedShare, sign: '-' })

              return (
                <div key={member.id} className="bg-slate-800/40 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-white">{member.name}</p>
                    <p className={`text-sm font-bold tabular-nums ${b.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatCurrency(b.balance, true)}
                    </p>
                  </div>
                  {rows.length > 0 ? (
                    <div className="space-y-1 border-t border-slate-700/50 pt-2">
                      {rows.map((row, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-slate-400">{row.label}</span>
                          <span className={row.value >= 0 ? 'text-emerald-400/80' : 'text-red-400/80'}>
                            {row.value >= 0 ? '+' : ''}{formatCurrency(row.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 border-t border-slate-700/50 pt-2">Sin movimientos</p>
                  )}
                </div>
              )
            })}
          </div>

          <p className="text-xs text-slate-600 text-center">
            La suma de todos los saldos siempre es igual al fondo colectivo.
          </p>
        </div>
      )}
    </div>
  )
}
