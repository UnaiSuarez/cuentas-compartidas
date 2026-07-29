import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Landmark, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCurrency } from '../../utils/formatters'
import { activeUniqueFines } from '../../utils/cleaningFines'

/**
 * Fondo de multas: totalmente aparte del saldo colectivo/transacciones.
 * Ese dinero no es de nadie — solo se resta a quien falla. Aquí se ve el
 * total y, al hacer click, el registro completo (incluidas las revertidas,
 * para que quede constancia de todo y nadie pueda hacer trampas).
 */
export default function CleaningFinesLog({ fines }) {
  const [open, setOpen] = useState(false)

  const activeFines = useMemo(() => activeUniqueFines(fines), [fines])
  const total = useMemo(() => activeFines.reduce((s, f) => s + (f.amount || 0), 0), [activeFines])

  if (!fines.length) return null

  return (
    <div className="glass rounded-2xl p-5">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark size={16} className="text-amber-400"/>
          <div className="text-left">
            <p className="text-white text-sm font-semibold">Fondo de multas</p>
            <p className="text-slate-500 text-xs">{activeFines.length} {activeFines.length === 1 ? 'multa' : 'multas'} · no es de nadie, es del grupo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold tabular-nums">{formatCurrency(total)}</span>
          {open ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 mt-4 pt-4 border-t border-slate-800">
              {[...activeFines, ...fines.filter(f => f.status === 'reversed')].map(f => {
                const isReversed = f.status === 'reversed'
                const dateLabel = f.date ? format(new Date(`${f.date}T00:00:00`), 'd MMM', { locale: es }) : ''
                return (
                  <div key={f.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${isReversed ? 'bg-slate-800/20 opacity-60' : 'bg-slate-800/40'}`}>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${isReversed ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {f.memberName} — {f.zoneLabel} ({dateLabel})
                      </p>
                      {isReversed && (
                        <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <RotateCcw size={11}/> Revertida por {f.reversedByName || 'alguien'}
                        </p>
                      )}
                    </div>
                    <span className={`text-sm font-medium tabular-nums shrink-0 ${isReversed ? 'text-slate-500 line-through' : 'text-amber-400'}`}>
                      {formatCurrency(f.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
