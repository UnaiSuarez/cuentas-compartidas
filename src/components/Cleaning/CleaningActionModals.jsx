import { useState } from 'react'
import { CalendarRange, FileText, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function ModalShell({ title, icon, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white">
            {icon}
            <h3 className="text-base font-semibold">{title}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Cerrar">
            <X size={17}/>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function RecurringClaimModal({ slot, onSubmit, onClose, submitting }) {
  const [startDate, setStartDate] = useState(slot.date)
  const [endDate, setEndDate] = useState(slot.date)
  const weekday = format(new Date(`${slot.date}T00:00:00`), 'EEEE', { locale: es })

  async function submit(event) {
    event.preventDefault()
    await onSubmit(startDate, endDate)
    onClose()
  }

  return (
    <ModalShell title="Repetir apunte" icon={<CalendarRange size={18} className="text-blue-400"/>} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-400">{slot.zoneLabel} se asignará cada {weekday} que esté activo.</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-slate-400">Desde
            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-2 text-sm text-white"/>
          </label>
          <label className="text-xs text-slate-400">Hasta
            <input type="date" required min={startDate} value={endDate} onChange={e => setEndDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-2 text-sm text-white"/>
          </label>
        </div>
        <button type="submit" disabled={submitting} className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">
          Guardar repetición
        </button>
      </form>
    </ModalShell>
  )
}

export function JustificationModal({ onSubmit, onClose, submitting }) {
  const [reason, setReason] = useState('')

  async function submit(event) {
    event.preventDefault()
    await onSubmit(reason)
    onClose()
  }

  return (
    <ModalShell title="Presentar justificante" icon={<FileText size={18} className="text-amber-400"/>} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-400">El resto del grupo debe aprobarlo antes de dos días para que no cuente como fallo.</p>
        <label className="block text-xs text-slate-400">Motivo
          <textarea required minLength={4} maxLength={500} value={reason} onChange={e => setReason(e.target.value)} rows={4}
            placeholder="Explica qué ha pasado"
            className="mt-1.5 w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-600"/>
        </label>
        <button type="submit" disabled={submitting || !reason.trim()} className="w-full rounded-xl bg-amber-600 py-2.5 text-sm font-medium text-white hover:bg-amber-500 disabled:opacity-50">
          Enviar a aprobación
        </button>
      </form>
    </ModalShell>
  )
}
