/**
 * Pantalla principal del dashboard.
 * Muestra: avatares animados, saldo personal, tarjetas de resumen y pagos pendientes.
 */

import { motion }         from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, Users } from 'lucide-react'
import { useApp }         from '../../context/AppContext'
import { useSettlement }  from '../../hooks/useSettlement'
import { formatCurrency, amountColor } from '../../utils/formatters'
import AvatarScene        from './AvatarScene'
import BalanceCard        from './BalanceCard'

export default function Dashboard() {
  const { userProfile, groupMembers, loading } = useApp()
  const { summary } = useSettlement()

  // Saldo del usuario autenticado
  const myBalance = userProfile ? (summary.balances[userProfile.id] ?? 0) : null

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
          className="glass rounded-2xl p-6 text-center"
        >
          <p className="text-slate-400 text-sm mb-1">Tu saldo, {userProfile.name}</p>
          <p className={`text-5xl font-bold tabular-nums ${amountColor(myBalance)}`}>
            {formatCurrency(myBalance, true)}
          </p>
          <p className="text-slate-500 text-xs mt-2">
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

      {/* Pagos óptimos y confirmaciones pendientes */}
      <BalanceCard />
    </div>
  )
}
