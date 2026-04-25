/**
 * Formulario dual para crear o editar transacciones (Gasto / Ingreso).
 *
 * Al elegir categoría, el monto sugerido se autocompleta automáticamente
 * si el campo de monto está vacío.
 *
 * Campos:
 *   type:        'expense' | 'income'
 *   amount:      número positivo en EUR
 *   category:    id de categoría
 *   description: texto libre opcional
 *   paidBy:      userId del que pagó/aportó
 *   splitAmong:  [userId] entre quiénes se divide (solo gastos)
 *   date:        fecha ISO (ej: '2025-04-25')
 */

import { useState, useEffect }        from 'react'
import { motion }                     from 'framer-motion'
import { Plus, X, Check, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'
import { useApp }                     from '../../context/AppContext'
import { useTransactions }            from '../../hooks/useTransactions'
import { useChat }                    from '../../hooks/useChat'
import { formatCurrency }             from '../../utils/formatters'

const today = () => new Date().toISOString().split('T')[0]

const EMPTY_FORM = {
  type:        'expense',
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
      // Adapta los datos existentes al formato del formulario
      return {
        type:        editData.type        || 'expense',
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

  // Autocompletar monto sugerido al elegir categoría
  useEffect(() => {
    if (!form.category) return
    const cat = categories.find(c => c.id === form.category)
    if (cat?.suggestedAmount && !form.amount) {
      setForm(f => ({ ...f, amount: cat.suggestedAmount.toString() }))
    }
  }, [form.category])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

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

    const payload = {
      type:        form.type,
      amount:      parseFloat(form.amount),
      category:    form.category || 'other',
      description: form.description.trim(),
      paidBy:      form.paidBy,
      splitAmong:  form.type === 'income' ? [form.paidBy] : form.splitAmong,
      date:        new Date(form.date),
    }

    try {
      if (editData?.id) {
        await updateTransaction(editData.id, payload)
      } else {
        await createTransaction(payload)

        // Notificación al chat
        const name   = groupMembers.find(m => m.id === form.paidBy)?.name || 'Alguien'
        const catLabel = categories.find(c => c.id === form.category)?.label || ''
        const action = form.type === 'income' ? 'añadió un ingreso' : 'registró un gasto'
        await sendSystemMessage(
          `💳 ${name} ${action} de ${formatCurrency(parseFloat(form.amount))}${catLabel ? ` en ${catLabel}` : ''}`
        )
      }
      onClose?.()
    } catch (_) {}
  }

  // Parte estimada por persona para gastos compartidos
  const parteEstimada = form.amount && form.splitAmong.length
    ? parseFloat(form.amount) / form.splitAmong.length
    : null

  const isExpense = form.type === 'expense'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="glass rounded-2xl p-5 w-full max-w-lg mx-auto"
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-white font-semibold text-lg">
          {editData ? 'Editar' : 'Nueva'} {isExpense ? 'Gasto' : 'Ingreso'}
        </h2>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20}/>
          </button>
        )}
      </div>

      {/* Selector de tipo */}
      <div className="flex rounded-xl overflow-hidden border border-slate-700/60 mb-4">
        <button
          type="button"
          onClick={() => set('type', 'expense')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all
                     ${isExpense ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-white'}`}
        >
          <TrendingDown size={16}/> Gasto
        </button>
        <button
          type="button"
          onClick={() => set('type', 'income')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all
                     ${!isExpense ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
        >
          <TrendingUp size={16}/> Ingreso
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Monto */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Monto (€)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            required
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
            type="date"
            required
            value={form.date}
            onChange={e => set('date', e.target.value)}
            className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3
                       text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
          />
        </div>

        {/* Pagado / Aportado por */}
        <div>
          <label className="text-xs text-slate-400 mb-1 block">
            {isExpense ? 'Pagado por' : 'Aportado por'}
          </label>
          <div className="flex gap-2 flex-wrap">
            {groupMembers.map(m => (
              <button
                key={m.id}
                type="button"
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

        {/* Dividido entre (solo gastos) */}
        {isExpense && (
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Dividido entre</label>
            <div className="flex gap-2 flex-wrap">
              {groupMembers.map(m => (
                <button
                  key={m.id}
                  type="button"
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

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2 px-3">{error}</p>
        )}

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={submitting || !form.paidBy || !form.amount || (!isExpense ? false : !form.splitAmong.length)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold
                      transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
                      ${!isExpense
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
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
