import { useMemo, useState, useEffect, useRef } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
} from 'recharts'
import { animate, stagger }    from 'animejs'
import { useApp }              from '../../context/AppContext'
import { formatCurrency }      from '../../utils/formatters'
import { revealOnScroll }      from '../../utils/animeHelpers'
import { format }              from 'date-fns'
import { es }                  from 'date-fns/locale'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

/** Encabezado que se revela palabra a palabra */
function AnimatedHeading({ children, className }) {
  const ref  = useRef(null)
  const words = String(children).split(' ')

  useEffect(() => {
    if (!ref.current) return
    const spans = ref.current.querySelectorAll('.word')
    // Set initial hidden state before animate (no flash)
    spans.forEach(s => { s.style.opacity = '0'; s.style.transform = 'translateY(8px)' })
    animate(spans, {
      opacity:    [0, 1],
      translateY: [8, 0],
      duration:   400,
      delay:      stagger(80),
      easing:     'easeOutExpo',
    })
  }, [])

  return (
    <h2 ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} className="word inline-block mr-1">{w}</span>
      ))}
    </h2>
  )
}

export default function StatisticsPage() {
  const { transactions, groupMembers, categories, userProfile } = useApp()
  const [view, setView] = useState('personal')

  // Scroll reveal solo para la sección de totales (siempre renderizada)
  const totalsRef = useRef(null)

  useEffect(() => {
    const cleanup = revealOnScroll(totalsRef.current, { delay: 0 })
    return () => { if (cleanup) cleanup() }
  }, [])

  // Animación del toggle de vista
  const toggleRef = useRef(null)
  function handleViewChange(v) {
    if (toggleRef.current) {
      animate(toggleRef.current, {
        scale:    [1, 0.93, 1],
        duration: 250,
        easing:   'easeOutSine',
      })
    }
    setView(v)
  }

  const filteredTx = useMemo(() => {
    if (view === 'group') return transactions
    const uid = userProfile?.id
    if (!uid) return []
    return transactions.filter(tx => {
      if (tx.type === 'income') return tx.paidBy === uid
      return (tx.splitAmong || []).includes(uid) || tx.paidBy === uid
    })
  }, [transactions, view, userProfile])

  const byCategory = useMemo(() => {
    const map = {}
    const uid = userProfile?.id
    filteredTx
      .filter(tx => tx.type === 'expense' && !tx.isSettlement)
      .forEach(tx => {
        const label = tx.categoryLabel || 'Otros'
        let amount = tx.amount
        if (view === 'personal' && uid) {
          const n = (tx.splitAmong || []).length || 1
          amount = (tx.splitAmong || []).includes(uid) ? tx.amount / n : 0
        }
        map[label] = (map[label] || 0) + amount
      })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7)
  }, [filteredTx, view, userProfile])

  const byMember = useMemo(() => {
    if (view === 'personal') return []
    return groupMembers.map(m => {
      const total = transactions
        .filter(tx => tx.type === 'expense' && !tx.isSettlement && tx.paidBy === m.id)
        .reduce((s, tx) => s + tx.amount, 0)
      return { name: m.name, total }
    })
  }, [transactions, groupMembers, view])

  const monthly = useMemo(() => {
    const months = {}
    const uid = userProfile?.id
    filteredTx
      .filter(tx => tx.type === 'expense' && !tx.isSettlement)
      .forEach(tx => {
        const d   = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date)
        const key = format(d, 'MMM yy', { locale: es })
        let amount = tx.amount
        if (view === 'personal' && uid) {
          const n = (tx.splitAmong || []).length || 1
          amount = (tx.splitAmong || []).includes(uid) ? tx.amount / n : 0
        }
        months[key] = (months[key] || 0) + amount
      })
    return Object.entries(months).map(([mes, total]) => ({ mes, total })).slice(-6)
  }, [filteredTx, view, userProfile])

  const totalGastos   = filteredTx.filter(tx => tx.type === 'expense' && !tx.isSettlement).reduce((s, tx) => s + tx.amount, 0)
  const totalIngresos = filteredTx.filter(tx => tx.type === 'income'  && !tx.isSettlement).reduce((s, tx) => s + tx.amount, 0)

  const myExpense = useMemo(() => {
    if (view !== 'personal' || !userProfile?.id) return null
    const uid = userProfile.id
    return filteredTx
      .filter(tx => tx.type === 'expense' && !tx.isSettlement)
      .reduce((s, tx) => {
        const n = (tx.splitAmong || []).length || 1
        if ((tx.splitAmong || []).includes(uid)) return s + tx.amount / n
        return s
      }, 0)
  }, [filteredTx, view, userProfile])

  if (!transactions.length) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-slate-400">Aún no hay datos suficientes para mostrar estadísticas.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <AnimatedHeading className="text-xl font-bold text-white">
          Estadísticas
        </AnimatedHeading>

        {/* Toggle vista con animación */}
        <div
          ref={toggleRef}
          data-tutorial="view-toggle"
          className="flex gap-1 bg-slate-800/60 rounded-xl p-1"
        >
          <button
            onClick={() => handleViewChange('personal')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              view === 'personal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mis datos
          </button>
          <button
            onClick={() => handleViewChange('group')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              view === 'group' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Del grupo
          </button>
        </div>
      </div>

      {/* Totales — scroll reveal (siempre visible) */}
      <div ref={totalsRef} className="grid grid-cols-2 gap-3" style={{ opacity: 0 }}>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400 mb-1">
            {view === 'personal' ? 'Mi parte de gastos' : 'Total Gastos'}
          </p>
          <p className="text-2xl font-bold text-red-400">
            {formatCurrency(view === 'personal' && myExpense !== null ? myExpense : totalGastos)}
          </p>
          {view === 'personal' && myExpense !== null && totalGastos > myExpense + 0.01 && (
            <p className="text-xs text-slate-500 mt-1">
              Total del grupo: <span className="text-slate-400">{formatCurrency(totalGastos)}</span>
            </p>
          )}
        </div>
        <div className="glass rounded-2xl p-4">
          <p className="text-xs text-slate-400 mb-1">
            {view === 'personal' ? 'Mis ingresos' : 'Total Ingresos'}
          </p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalIngresos)}</p>
        </div>
      </div>

      {/* Gastos por categoría — Recharts maneja la animación */}
      {byCategory.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Por categoría</p>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-full md:w-64 h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    isAnimationActive
                    animationBegin={200}
                    animationDuration={800}
                  >
                    {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatCurrency(v)}
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2 w-full">
              {byCategory.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }}/>
                  <p className="text-sm text-slate-300 flex-1 truncate">{c.name}</p>
                  <p className="text-sm text-white font-medium">{formatCurrency(c.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gastos por persona (grupo) */}
      {view === 'group' && byMember.some(m => m.total > 0) && (
        <div className="glass rounded-2xl p-5">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Gastos pagados por persona</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMember} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }}/>
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `€${v}`}/>
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} isAnimationActive animationBegin={300} animationDuration={900}>
                  {byMember.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Evolución mensual */}
      {monthly.length > 1 && (
        <div className="glass rounded-2xl p-5">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Evolución mensual</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                <XAxis dataKey="mes" tick={{ fill: '#94a3b8', fontSize: 12 }}/>
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `€${v}`}/>
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6 }}
                  isAnimationActive
                  animationBegin={200}
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
