import { useState, useEffect }     from 'react'
import { motion }                  from 'framer-motion'
import { Plus, X, Check, TrendingUp, TrendingDown, Users, ChevronDown } from 'lucide-react'
import { useApp }                  from '../../context/AppContext'
import { useTransactions }         from '../../hooks/useTransactions'
import { useChat }                 from '../../hooks/useChat'
import { formatCurrency }          from '../../utils/formatters'

const today = () => new Date().toISOString().split('T')[0]

const MODES = { EXPENSE: 'expense', INCOME: 'income', COMMON: 'common' }

const EMPTY_FORM = {
  mode:        MODES.EXPENSE,
  amount:      '',
  category:    '',
  description: '',
  paidBy:      '',
  splitAmong:  [],
  date:        today(),
}

export default function TransactionForm({ onClose, editData = null }) {
  const { userProfile, groupMembers, categories } = useApp()
  const { createTransaction, updateTransaction, submitting, error } = useTransactions()
  const { sendSystemMessage } = useChat()

  const [form, setForm] = useState(() => {
    if (editData) {
      const mode = editData.paymentMode === 'common'
        ? MODES.COMMON
        : editData.type === 'income'
        ? MODES.INCOME
        : MODES.EXPENSE
      return {
        mode,
        amount:      editData.amount?.toString() || '',
        category:    editData.category    || '',
        description: editData.description || '',
        paidBy:      editData.paidBy      || userProfile?.id || '',
        splitAmong:  editData.splitAmong  || groupMembers.map(m => m.id),
        date:        editData.date?.toDate
          ? editData.date.toDate().toISOString().split('T')[0]
          : today(),
      }
    }
    return {
      ...EMPTY_FORM,
      paidBy:     userProfile?.id || '',
      splitAmong: groupMembers.map(m => m.id),
    }
  })

  useEffect(() => {
    if (!form.category) return
    const cat = categories.find(c => c.id === form.category)
    if (cat?.suggestedAmount && !form.amount) {
      setForm(f => ({ ...f, amount: cat.suggestedAmount.toString() }))
    }
  }, [form.category])

  function set(field, value) { setForm(f => ({ ...f, [field]: value })) }

  function toggleParticipant(userId) {
    setForm(f => ({
      ...f,
      splitAmong: f.splitAmong.includes(userId)
        ? f.splitAmong.filter(id => id !== userId)
        : [...f.splitAmong, userId],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const isCommon  = form.mode === MODES.COMMON
    const isIncome  = form.mode === MODES.INCOME
    const isExpense = form.mode === MODES.EXPENSE

    const payload = {
      type:         isIncome ? 'income' : 'expense',
      paymentMode:  isCommon ? 'common' : 'individual',
      amount:       parseFloat(form.amount),
      category:     form.category || 'other',
      description:  form.description.trim(),
      paidBy:       isCommon ? 'common' : form.paidBy,
      splitAmong:   isIncome ? [form.paidBy] : form.splitAmong,
      date:         new Date(form.date),
    }

    try {
      if (editData?.id) {
        await updateTransaction(editData.id, payload)
      } else {
        await createTransaction(payload)
        const catLabel = categories.find(c => c.id === form.category)?.label || ''
        let msg = ''
        if (isCommon) {
          msg = `🏦 Gasto común de ${formatCurrency(parseFloat(form.amount))}${catLabel ? ` en ${catLabel}` : ''}`
        } else if (isIncome) {
          const name = groupMembers.find(m => m.id === form.paidBy)?.name || 'Alguien'
          msg = `💰 ${name} añadió un ingreso de ${formatCurrency(parseFloat(form.amount))}${catLabel ? ` en ${catLabel}` : ''}`
        } else {
          const name = groupMembers.find(m => m.id === form.paidBy)?.name || 'Alguien'
          msg = `💳 ${name} registró un gasto de ${formatCurrency(parseFloat(form.amount))}${catLabel ? ` en ${catLabel}` : ''}`
        }
        await sendSystemMessage(msg)
      }
      onClose?.()
    } catch (_) {}
  }

  const isCommon  = form.mode === MODES.COMMON
  const isIncome  = form.mode === MODES.INCOME
  const isExpense = form.mode === MODES.EXPENSE

  const parteEstimada = !isIncome && form.amount && form.splitAmong.length
    ? parseFloat(form.amount) / form.splitAmong.length
    : null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="glass rounded-2xl p-5 w-full max-w-lg mx-auto"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-semibold text-lg">
          {editData ? 'Editar' : 'Nueva'} transacción
        </h2>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20}/>
          </button>
        )}
      </div>

      {/* Selector de modo */}
      <div className="grid grid-cols-3 rounded-xl overflow-hidden border border-slate-700/60 mb-4">
        <button
          type="button"
          onClick={() => set('mode', MODES.EXPENSE)}
          className={`flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all
                     ${isExpense ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-white'}`}
        >
          <TrendingDown size={14}/> Gasto
        </button>
        <button
          type="button"
          onClick={() => set('mode', MODES.INCOME)}
          className={`flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all
                     border-x border-slate-700/60
                     ${isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
        >
          <TrendingUp size={14}/> Ingreso
        </button>
        <button
          type="button"
          onClick={() => set('mode', MODES.COMMON)}
          className={`flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-all
                     ${isCommon ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white'}`}
        >
          <Users size={14}/> Común
        </button>
      </div>

      {isCommon && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300 mb-4">
          El gasto sale del fondo común. Nadie adelanta dinero individualmente; se divide entre los participantes.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Monto */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Monto (€)</label>
          <input
            type="number" min="0.01" step="0.01" required
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            placeholder="0,00"
            className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3
                       text-white text-xl font-bold placeholder-slate-600
                       focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/60 transition-all"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Categoría</label>
          <div className="relative">
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className="w-full appearance-none bg-slate-800/60 border border-slate-700/60 rounded-xl
                         px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            >
              <option value="">Sin categoría</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.label}
                  {c.suggestedAmount ? ` · ${formatCurrency(c.suggestedAmount)} sugerido` : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Descripción (opcional)</label>
          <input
            type="text"
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="¿En qué se gastó?"
            maxLength={200}
            className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3
                       text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
          />
        </div>

        {/* Fecha */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Fecha</label>
          <input
            type="date" required
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3
                       text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
          />
        </div>

        {/* Pagado por (no en modo común) */}
        {!isCommon && (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              {isIncome ? 'Aportado por' : 'Pagado por'}
            </label>
            <div className="flex gap-2 flex-wrap">
              {groupMembers.map(m => (
                <button
                  key={m.id} type="button"
                  onClick={() => set('paidBy', m.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                             ${form.paidBy === m.id
                               ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                               : 'bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:text-white'
                             }`}
                >
                  {m.name}
                  {m.id === userProfile?.id && <span className="text-slate-500 ml-1">(tú)</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dividido entre (gastos y común) */}
        {!isIncome && (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Dividido entre</label>
            <div className="flex gap-2 flex-wrap">
              {groupMembers.map(m => (
                <button
                  key={m.id} type="button"
                  onClick={() => toggleParticipant(m.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                             ${form.splitAmong.includes(m.id)
                               ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                               : 'bg-slate-800/60 text-slate-500 border border-slate-700/40 hover:text-white'
                             }`}
                >
                  {form.splitAmong.includes(m.id) && <Check size={12} className="inline mr-1"/>}
                  {m.name}
                </button>
              ))}
            </div>
            {parteEstimada && (
              <p className="text-xs text-slate-400 mt-1.5">
                Cada persona: <span className="text-white font-medium">{formatCurrency(parteEstimada)}</span>
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2 px-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={
            submitting ||
            !form.amount ||
            (!isCommon && !form.paidBy) ||
            (!isIncome && !form.splitAmong.length)
          }
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold
                      transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
                      ${isIncome
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : isCommon
                        ? 'bg-blue-700 hover:bg-blue-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
        >
          {submitting
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            : <><Plus size={18}/> {editData ? 'Guardar cambios' : 'Añadir'}</>
          }
        </button>
      </form>
    </motion.div>
  )
}
