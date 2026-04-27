/**
 * Pantalla principal del dashboard.
 * Muestra: avatares animados, saldo personal, tarjetas de resumen y pagos pendientes.
 */

import { useMemo }        from 'react'
import { motion }         from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, Users } from 'lucide-react'
import { useApp }         from '../../context/AppContext'
import { useSettlement }  from '../../hooks/useSettlement'
import { formatCurrency, amountColor } from '../../utils/formatters'
import AvatarScene        from './AvatarScene'
import BalanceCard        from './BalanceCard'
import BalanceExplainer   from './BalanceExplainer'

export default function Dashboard() {
  const { userProfile, groupMembers, loading } = useApp()
  const { summary } = useSettlement()

  const getMemberName = id => groupMembers.find(m => m.id === id)?.name || '?'

  // Saldo total del usuario (incluye lo que le deben pero aún no han pagado)
  const myBalance = userProfile ? (summary.balances[userProfile.id] ?? 0) : null

  // Pagos óptimos donde el usuario es el acreedor (le deben pagar)
  const pendingFrom = useMemo(() => {
    if (!userProfile) return []
    return summary.pagosOptimos.filter(p => p.a === userProfile.id)
  }, [summary.pagosOptimos, userProfile])

  const myPendingReceivable = pendingFrom.reduce((s, p) => s + p.monto, 0)
  // Dinero realmente disponible (descontando lo que otros aún no han pagado)
  const myAvailableBalance = myBalance !== null ? myBalance - myPendingReceivable : null

  const cards = [
    {
      label:      'Saldo Colectivo',
      value:      summary.saldoColectivo,
      icon:       Wallet,
      color:      summary.saldoColectivo >= 0 ? 'emerald' : 'red',
      isCurrency: true,
    },
    {
      label:      'Total Ingresos',
      value:      summary.totalIngresos,
      icon:       TrendingUp,
      color:      'emerald',
      isCurrency: true,
    },
    {
      label:      'Total Gastos',
      value:      summary.totalGastos,
      icon:       TrendingDown,
      color:      'red',
      isCurrency: true,
    },
    {
      label:      'Miembros',
      value:      groupMembers.length,
      icon:       Users,
      color:      'blue',
      isCurrency: false,
    },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Avatares animados de todos los miembros */}
      <AvatarScene
        users={groupMembers}
        balances={summary.balances}
        activeUser={userProfile}
      />

      {/* Mi saldo: número grande, protagonista */}
      {userProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          data-tutorial="my-balance"
          className="glass rounded-2xl p-6 text-center"
        >
          <p className="text-slate-400 text-sm mb-1">Tu saldo, {userProfile.name}</p>
          <p className={`text-5xl font-bold tabular-nums ${amountColor(myAvailableBalance)}`}>
            {formatCurrency(myAvailableBalance, true)}
          </p>
          {myPendingReceivable > 0.01 && (
            <p className="text-amber-400 text-xs mt-2 space-x-1">
              <span>+ {formatCurrency(myPendingReceivable)} pendiente de cobro</span>
              {pendingFrom.map((p, i) => (
                <span key={i}>
                  {i === 0 ? 'de' : 'y'} <span className="font-medium">{getMemberName(p.de)}</span>
                </span>
              ))}
            </p>
          )}
          <p className="text-slate-500 text-xs mt-1.5">
            {myBalance > 0
              ? 'Te deben dinero ✅'
              : myBalance < 0
              ? 'Debes dinero ⚠️'
              : 'Estás en paz 🎉'}
          </p>
        </motion.div>
      )}

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-xs">{card.label}</p>
                <Icon size={16} className={`text-${card.color}-400`}/>
              </div>
              <p className={`text-xl font-bold tabular-nums ${
                !card.isCurrency
                  ? 'text-white'
                  : card.color === 'red'
                  ? 'text-red-400'
                  : card.color === 'emerald'
                  ? 'text-emerald-400'
                  : amountColor(card.value)
              }`}>
                {card.isCurrency ? formatCurrency(card.value) : card.value}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Saldo individual de cada miembro */}
      {groupMembers.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Saldo por persona</p>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(groupMembers.length, 3)}, 1fr)` }}>
            {groupMembers.map(member => {
              const bal = summary.balances[member.id] ?? 0
              return (
                <div key={member.id} className="text-center p-3 rounded-xl bg-slate-800/40">
                  <p className="text-slate-300 text-sm font-medium truncate">{member.name}</p>
                  <p className={`text-lg font-bold tabular-nums mt-1 ${amountColor(bal)}`}>
                    {formatCurrency(bal, true)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Explicación de saldos */}
      <BalanceExplainer />

      {/* Pagos óptimos y confirmaciones pendientes */}
      <BalanceCard />
    </div>
  )
}
