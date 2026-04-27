import { useMemo, useEffect, useRef } from 'react'
import { motion }         from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, Users } from 'lucide-react'
import { useApp }         from '../../context/AppContext'
import { useSettlement }  from '../../hooks/useSettlement'
import { formatCurrency, amountColor } from '../../utils/formatters'
import { useAnimatedCounter }          from '../../hooks/useAnimatedCounter'
import { setupTilt, revealOnScroll }   from '../../utils/animeHelpers'
import AvatarScene        from './AvatarScene'
import BalanceCard        from './BalanceCard'
import BalanceExplainer   from './BalanceExplainer'

/** Tarjeta con tilt 3D y scroll reveal */
function TiltCard({ children, className, delay = 0 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const cleanup = setupTilt(ref.current)
    const cleanReveal = revealOnScroll(ref.current, { delay })
    return () => { cleanup(); cleanReveal() }
  }, [])
  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const { userProfile, groupMembers, loading } = useApp()
  const { summary } = useSettlement()

  const getMemberName = id => groupMembers.find(m => m.id === id)?.name || '?'

  const myBalance = userProfile ? (summary.balances[userProfile.id] ?? 0) : null

  const pendingFrom = useMemo(() => {
    if (!userProfile) return []
    return summary.pagosOptimos.filter(p => p.a === userProfile.id)
  }, [summary.pagosOptimos, userProfile])

  const myPendingReceivable = pendingFrom.reduce((s, p) => s + p.monto, 0)
  const myAvailableBalance  = myBalance !== null ? myBalance - myPendingReceivable : null

  // Contador animado del saldo principal
  const balanceRef = useAnimatedCounter(
    myAvailableBalance ?? 0,
    v => formatCurrency(v, true),
    950,
  )

  // Refs para scroll reveal de las secciones
  const balanceCardRef  = useRef(null)
  const summaryGridRef  = useRef(null)
  const memberGridRef   = useRef(null)
  const explainerRef    = useRef(null)
  const paymentCardRef  = useRef(null)

  useEffect(() => {
    if (loading) return
    const cleanups = [
      revealOnScroll(summaryGridRef.current,  { delay: 0,   translateY: 20 }),
      revealOnScroll(memberGridRef.current,   { delay: 80,  translateY: 20 }),
      revealOnScroll(explainerRef.current,    { delay: 120, translateY: 20 }),
      revealOnScroll(paymentCardRef.current,  { delay: 160, translateY: 20 }),
    ].filter(Boolean)
    return () => cleanups.forEach(fn => fn())
  }, [loading])

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
      <AvatarScene
        users={groupMembers}
        balances={summary.balances}
        activeUser={userProfile}
      />

      {/* Mi saldo: número grande animado */}
      {userProfile && (
        <motion.div
          ref={balanceCardRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          data-tutorial="my-balance"
          className="glass rounded-2xl p-6 text-center"
        >
          <p className="text-slate-400 text-sm mb-1">Tu saldo, {userProfile.name}</p>
          <p
            ref={balanceRef}
            className={`text-5xl font-bold tabular-nums ${amountColor(myAvailableBalance)}`}
          />
          {pendingFrom.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {pendingFrom.map((p, i) => (
                <p key={i} className="text-amber-400 text-xs">
                  +{formatCurrency(p.monto)} pendiente de cobro
                  de <span className="font-semibold">{getMemberName(p.de)}</span>
                </p>
              ))}
            </div>
          )}
          <p className="text-slate-500 text-xs mt-1.5">
            {myAvailableBalance > 0.01
              ? 'Saldo disponible ✅'
              : myAvailableBalance < -0.01
              ? 'Necesitas aportar fondos ⚠️'
              : myPendingReceivable > 0.01
              ? 'Pendiente de cobro ⏳'
              : 'Estás en paz 🎉'}
          </p>
        </motion.div>
      )}

      {/* Tarjetas de resumen con tilt 3D y scroll reveal */}
      <div ref={summaryGridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ opacity: 0 }}>
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <TiltCard
              key={card.label}
              delay={i * 60}
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
            </TiltCard>
          )
        })}
      </div>

      {/* Saldo por persona */}
      {groupMembers.length > 0 && (
        <div ref={memberGridRef} className="glass rounded-2xl p-4" style={{ opacity: 0 }}>
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

      <div ref={explainerRef} style={{ opacity: 0 }}>
        <BalanceExplainer />
      </div>

      <div ref={paymentCardRef} style={{ opacity: 0 }}>
        <BalanceCard />
      </div>
    </div>
  )
}
