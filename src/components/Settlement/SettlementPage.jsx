import { useRef, useEffect, useState } from 'react'
import { useNavigate }   from 'react-router-dom'
import { motion }        from 'framer-motion'
import { Plus }          from 'lucide-react'
import { animate, svg }  from 'animejs'
import { useApp }        from '../../context/AppContext'
import { useSettlement } from '../../hooks/useSettlement'
import { formatCurrency, amountColor } from '../../utils/formatters'
import { getAvatarByKey } from '../../assets/avatars'
import { revealOnScroll } from '../../utils/animeHelpers'
import Confetti           from '../Common/Confetti'

/** Flecha SVG que se dibuja sola con anime.js */
function AnimatedArrow({ delay = 0 }) {
  const pathRef = useRef(null)
  useEffect(() => {
    if (!pathRef.current) return
    // Wait for parent revealOnScroll (~700ms) + framer-motion enter delay before drawing
    const t = setTimeout(() => {
      if (!pathRef.current) return
      const drawable = svg.createDrawable(pathRef.current)
      animate(drawable, {
        draw:     ['0 0', '0 1'],
        duration: 700,
        easing:   'easeInOutQuart',
      })
    }, delay)
    return () => clearTimeout(t)
  }, [delay])

  return (
    <svg width="72" height="18" viewBox="0 0 72 18" fill="none" className="shrink-0">
      <path
        ref={pathRef}
        d="M 4 9 L 56 9 M 48 3 L 58 9 L 48 15"
        stroke="#334155"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function SettlementPage() {
  const navigate = useNavigate()
  const { userProfile, groupMembers } = useApp()
  const { summary }                   = useSettlement()

  const getMemberName = id => groupMembers.find(m => m.id === id)?.name || '?'

  const myDebts     = summary.pagosOptimos.filter(p => p.de === userProfile?.id)
  const myCredits   = summary.pagosOptimos.filter(p => p.a  === userProfile?.id)
  const isDebtor    = myDebts.length   > 0
  const isCreditor  = myCredits.length > 0

  // Confeti cuando no hay deudas
  const [confetti, setConfetti] = useState(false)
  const prevPagos = useRef(-1)
  useEffect(() => {
    const count = summary.pagosOptimos.length
    if (prevPagos.current > 0 && count === 0) {
      setConfetti(c => !c)   // toggle para re-trigger
    }
    prevPagos.current = count
  }, [summary.pagosOptimos.length])

  // Scroll reveal solo para la sección de saldos (siempre montada)
  const balanceSectionRef = useRef(null)
  useEffect(() => {
    const c1 = revealOnScroll(balanceSectionRef.current, { delay: 0 })
    return () => { c1() }
  }, [])

  return (
    <div className="space-y-6">
      <Confetti trigger={confetti}/>

      <h2 className="text-xl font-bold text-white">Liquidación</h2>

      {/* Info contextual para el usuario */}
      {isDebtor && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4"
        >
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
        </motion.div>
      )}

      {isCreditor && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4"
        >
          <p className="text-emerald-300 text-sm font-medium mb-1">Te deben dinero</p>
          {myCredits.map((p, i) => (
            <p key={i} className="text-slate-300 text-sm">
              <span className="text-amber-400 font-medium">{getMemberName(p.de)}</span>{' '}
              te debe <span className="text-white font-bold">{formatCurrency(p.monto)}</span>.
              Tu saldo se actualizará en cuanto añada fondos al grupo.
            </p>
          ))}
        </motion.div>
      )}

      {/* Saldo por persona */}
      <div ref={balanceSectionRef} className="glass rounded-2xl p-5" style={{ opacity: 0 }}>
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
                  <Av key={state} state={state} color={member.color || '#2563eb'} size={48}/>
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

      {/* Pagos óptimos con flecha SVG animada */}
      {summary.pagosOptimos.length > 0 ? (
        <motion.div
          data-tutorial="optimal-payments"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="glass rounded-2xl p-5"
        >
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Pagos a realizar</p>
          <p className="text-slate-500 text-xs mb-4">
            Añade el importe como ingreso y el saldo se ajustará solo.
          </p>
          <div className="space-y-3">
            {summary.pagosOptimos.map((p, i) => {
              const isMe = userProfile?.id === p.de
              return (
                <motion.div
                  key={`${p.de}-${p.a}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-xl
                              ${isMe ? 'bg-red-500/10 border border-red-500/20' : 'bg-slate-800/40'}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-wrap">
                    <p className="text-xs text-red-400 font-medium">{getMemberName(p.de)}</p>
                    <div className="flex flex-col items-center gap-0.5">
                      <AnimatedArrow delay={900 + i * 120}/>
                      <span className="text-white font-bold text-sm">{formatCurrency(p.monto)}</span>
                    </div>
                    <p className="text-xs text-emerald-400 font-medium">{getMemberName(p.a)}</p>
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
        </motion.div>
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
