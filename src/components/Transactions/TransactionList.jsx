import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence }     from 'framer-motion'
import {
  Plus, Search, Pencil, Trash2,
  TrendingUp, TrendingDown, Landmark, X, Download,
  ChevronDown, ArrowDownUp, Calendar,
} from 'lucide-react'
import { useApp }                      from '../../context/AppContext'
import { useTransactions }             from '../../hooks/useTransactions'
import { exportToExcel, exportToPDF, exportToCSV } from '../../utils/exporters'
import { formatCurrency, formatDate }  from '../../utils/formatters'
import { addRipple, addHoverParticles, staggerReveal } from '../../utils/animeHelpers'
import TransactionForm                 from './TransactionForm'

const DATE_FILTERS = [
  { label: 'Todo',        value: 'all'   },
  { label: 'Hoy',         value: 'today' },
  { label: 'Esta semana', value: 'week'  },
  { label: 'Este mes',    value: 'month' },
]

/** Botón con ripple y partículas al hover */
function AnimatedButton({ onClick, className, children, 'data-tutorial': dataTutorial, particleColor = '#3b82f6' }) {
  const btnRef = useRef(null)

  const handleClick = useCallback((e) => {
    if (btnRef.current) addRipple(e, btnRef.current)
    onClick?.(e)
  }, [onClick])

  const handleMouseEnter = useCallback(() => {
    if (btnRef.current) addHoverParticles(btnRef.current, particleColor)
  }, [particleColor])

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={className}
      data-tutorial={dataTutorial}
    >
      {children}
    </button>
  )
}

/** Extrae timestamp comparable de una transacción (createdAt > date como fallback) */
function getTxTimestamp(tx) {
  if (tx.createdAt?.toDate) return tx.createdAt.toDate().getTime()
  if (tx.createdAt)         return new Date(tx.createdAt).getTime()
  if (tx.date?.toDate)      return tx.date.toDate().getTime()
  return new Date(tx.date).getTime()
}

/** Formatea Date → "YYYY-MM-DD" para input[type=date] */
function toInputDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function TransactionList() {
  const { transactions, groupMembers, categories, userProfile } = useApp()
  const { deleteTransaction } = useTransactions()

  const [showForm,     setShowForm]     = useState(false)
  const [editData,     setEditData]     = useState(null)
  const [search,       setSearch]       = useState('')
  const [dateFilter,   setDateFilter]   = useState('all')
  const [typeFilter,   setTypeFilter]   = useState('all')
  const [catFilter,    setCatFilter]    = useState('')
  const [sortOrder,    setSortOrder]    = useState('newest')  // 'newest' | 'oldest'
  const [specificDate, setSpecificDate] = useState('')        // 'YYYY-MM-DD' | ''
  const [deleting,     setDeleting]     = useState(null)
  const [showExport,   setShowExport]   = useState(false)

  const listRef = useRef(null)

  const getMemberName = id => groupMembers.find(m => m.id === id)?.name || '—'

  // ── Filtrado
  const filtered = useMemo(() => {
    const now = new Date()
    const sod = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sow = new Date(sod); sow.setDate(sod.getDate() - sod.getDay())
    const som = new Date(now.getFullYear(), now.getMonth(), 1)

    return transactions.filter(tx => {
      if (search) {
        const q = search.toLowerCase()
        const match =
          tx.description?.toLowerCase().includes(q) ||
          tx.categoryLabel?.toLowerCase().includes(q) ||
          getMemberName(tx.paidBy).toLowerCase().includes(q)
        if (!match) return false
      }
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false
      if (catFilter && tx.category !== catFilter) return false

      const txDate = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date)

      // Filtro por fecha concreta (tiene prioridad sobre el rango)
      if (specificDate) {
        return toInputDate(txDate) === specificDate
      }

      if (dateFilter !== 'all') {
        if (dateFilter === 'today' && txDate < sod) return false
        if (dateFilter === 'week'  && txDate < sow) return false
        if (dateFilter === 'month' && txDate < som) return false
      }
      return true
    })
  }, [transactions, search, dateFilter, typeFilter, catFilter, specificDate, groupMembers])

  // ── Ordenación por createdAt (o date como fallback)
  const sorted = useMemo(() => (
    [...filtered].sort((a, b) =>
      sortOrder === 'newest'
        ? getTxTimestamp(b) - getTxTimestamp(a)
        : getTxTimestamp(a) - getTxTimestamp(b)
    )
  ), [filtered, sortOrder])

  // ── Stagger al cambiar filtros
  useEffect(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll('[data-tx-item]')
    if (!items.length) return
    staggerReveal(items, { duration: 350, staggerMs: 30, translateY: 10 })
  }, [sorted.length, search, dateFilter, typeFilter, catFilter, specificDate, sortOrder])

  function openEdit(tx) { setEditData(tx);  setShowForm(true) }
  function openNew()    { setEditData(null); setShowForm(true) }

  function handleDateFilterClick(value) {
    setDateFilter(value)
    setSpecificDate('')  // limpia fecha concreta al usar un rango
  }

  function handleSpecificDate(v) {
    setSpecificDate(v)
    if (v) setDateFilter('all')  // limpia rango al usar fecha concreta
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta transacción? No se puede deshacer.')) return
    setDeleting(id)
    try { await deleteTransaction(id) }
    finally { setDeleting(null) }
  }

  function prepareExportData() {
    return sorted.map(tx => ({
      fecha:       tx.date?.toDate ? tx.date.toDate() : new Date(tx.date),
      tipo:        tx.type === 'income' ? 'Ingreso' : 'Gasto',
      monto:       tx.amount,
      categoria:   tx.categoryLabel || tx.category || '—',
      descripcion: tx.description || '—',
      pagado_por:  getMemberName(tx.paidBy),
    }))
  }

  function handleExport(format) {
    const data = prepareExportData()
    if (format === 'excel') exportToExcel(data, groupMembers)
    if (format === 'pdf')   exportToPDF(data, groupMembers)
    if (format === 'csv')   exportToCSV(data)
    setShowExport(false)
  }

  return (
    <div className="space-y-4">
      {/* ── Cabecera */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Transacciones</h2>
        <div className="flex gap-2">
          {/* Exportar */}
          <div className="relative">
            <button
              onClick={() => setShowExport(s => !s)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300
                         px-3 py-2 rounded-xl text-sm transition-all"
            >
              <Download size={15}/>
              <span className="hidden sm:inline">Exportar</span>
              <ChevronDown size={14}/>
            </button>
            {showExport && (
              <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-700
                              rounded-xl shadow-2xl overflow-hidden z-10 min-w-[140px]">
                {[
                  { f: 'excel', label: '📊 Excel (.xlsx)' },
                  { f: 'pdf',   label: '📄 PDF'           },
                  { f: 'csv',   label: '📋 CSV'           },
                ].map(({ f, label }) => (
                  <button
                    key={f}
                    onClick={() => handleExport(f)}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-300
                               hover:bg-slate-700 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nueva transacción */}
          <AnimatedButton
            data-tutorial="new-transaction"
            onClick={openNew}
            particleColor="#3b82f6"
            className="relative flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white
                       px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 overflow-hidden"
          >
            <Plus size={16}/>
            Nueva
          </AnimatedButton>
        </div>
      </div>

      {/* ── Formulario */}
      <AnimatePresence>
        {showForm && (
          <TransactionForm
            onClose={() => { setShowForm(false); setEditData(null) }}
            editData={editData}
          />
        )}
      </AnimatePresence>

      {/* ── Búsqueda */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por descripción, categoría o persona..."
          className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-9 pr-10 py-3
                     text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X size={16}/>
          </button>
        )}
      </div>

      {/* ── Controles: ordenación + fecha concreta */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Toggle orden */}
        <button
          onClick={() => setSortOrder(o => o === 'newest' ? 'oldest' : 'newest')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                     bg-slate-800/60 border border-slate-700/40 text-slate-300 hover:text-white
                     transition-all"
          title={sortOrder === 'newest' ? 'Más recientes primero' : 'Más antiguas primero'}
        >
          <ArrowDownUp size={13}/>
          {sortOrder === 'newest' ? 'Más recientes' : 'Más antiguas'}
        </button>

        {/* Fecha concreta */}
        <div className="relative flex items-center">
          <Calendar size={13} className="absolute left-2.5 text-slate-400 pointer-events-none"/>
          <input
            type="date"
            value={specificDate}
            onChange={e => handleSpecificDate(e.target.value)}
            className="bg-slate-800/60 border border-slate-700/40 rounded-lg pl-8 pr-2 py-1.5
                       text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40
                       [color-scheme:dark]"
          />
          {specificDate && (
            <button
              onClick={() => setSpecificDate('')}
              className="absolute right-1.5 text-slate-500 hover:text-white"
            >
              <X size={12}/>
            </button>
          )}
        </div>
      </div>

      {/* ── Filtros de tipo y rango de fecha */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all',     label: 'Todo'        },
          { value: 'expense', label: '📉 Gastos'   },
          { value: 'income',  label: '📈 Ingresos' },
        ].map(t => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                       ${typeFilter === t.value
                         ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                         : 'bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:text-white'
                       }`}
          >
            {t.label}
          </button>
        ))}
        {DATE_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => handleDateFilterClick(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                       ${dateFilter === f.value && !specificDate
                         ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                         : 'bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:text-white'
                       }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        {sorted.length} resultado{sorted.length !== 1 ? 's' : ''}
      </p>

      {/* ── Lista */}
      {sorted.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-slate-400">No hay transacciones que coincidan.</p>
        </div>
      ) : (
        <div ref={listRef} className="space-y-2">
          {sorted.map((tx) => {
            const isIncome = tx.type === 'income'
            const isCommon = tx.paidBy === 'common' || tx.paymentMode === 'common'
            const txDate   = tx.date?.toDate ? tx.date.toDate() : new Date(tx.date)

            const ItemIcon   = isCommon ? Landmark : isIncome ? TrendingUp : TrendingDown
            const iconBg     = isCommon ? 'bg-blue-500/15'    : isIncome ? 'bg-emerald-500/15' : 'bg-red-500/15'
            const iconColor  = isCommon ? 'text-blue-400'     : isIncome ? 'text-emerald-400'  : 'text-red-400'
            const borderLeft = isCommon ? 'border-l-blue-500/50' : isIncome ? 'border-l-emerald-500/50' : 'border-l-red-500/50'
            const amountColor = isCommon ? 'text-blue-400'   : isIncome ? 'text-emerald-400'  : 'text-red-400'

            return (
              <div
                key={tx.id}
                data-tx-item
                className={`glass rounded-xl p-4 flex items-center gap-3
                           hover:bg-slate-800/60 transition-colors cursor-default
                           border-l-2 ${borderLeft}`}
              >
                {/* Icono */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                  <ItemIcon size={18} className={iconColor}/>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {tx.description || tx.categoryLabel || (isIncome ? 'Ingreso' : isCommon ? 'Gasto común' : 'Gasto')}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {tx.categoryLabel && (
                      <span className="text-xs text-slate-500">{tx.categoryLabel}</span>
                    )}
                    <span className="text-xs text-slate-700">•</span>
                    {isCommon
                      ? <span className="text-xs px-1.5 py-0.5 rounded-md bg-blue-500/15 text-blue-400 font-medium">Fondo común</span>
                      : <span className="text-xs text-slate-500">{getMemberName(tx.paidBy)}</span>
                    }
                    <span className="text-xs text-slate-700">•</span>
                    <span className="text-xs text-slate-500">{formatDate(txDate)}</span>
                  </div>
                  {!isIncome && tx.splitAmong?.length > 0 && (
                    <p className="text-xs text-slate-600 mt-0.5">
                      ÷ {tx.splitAmong.map(getMemberName).join(', ')}
                    </p>
                  )}
                </div>

                {/* Monto */}
                <div className="text-right shrink-0">
                  <p className={`font-bold tabular-nums text-sm ${amountColor}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(tx)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                  >
                    <Pencil size={14}/>
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deleting === tx.id}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    {deleting === tx.id
                      ? <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin"/>
                      : <Trash2 size={14}/>
                    }
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
