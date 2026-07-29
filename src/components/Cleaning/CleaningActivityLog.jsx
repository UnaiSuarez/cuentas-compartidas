import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, ChevronDown, ChevronUp, Check, Flag, FileText, ThumbsUp, UserPlus, UserMinus, Undo2, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const EVENT = {
  claimed: { label: 'se apuntó', Icon: UserPlus, color: 'text-blue-400' },
  recurring_claimed: { label: 'creó una asignación repetida', Icon: UserPlus, color: 'text-blue-400' },
  assigned: { label: 'asignó la tarea', Icon: UserPlus, color: 'text-blue-400' },
  reassigned: { label: 'reasignó la tarea', Icon: UserPlus, color: 'text-blue-400' },
  unassigned: { label: 'quitó la asignación', Icon: UserMinus, color: 'text-slate-400' },
  done: { label: 'marcó la tarea como hecha', Icon: Check, color: 'text-emerald-400' },
  historical_done: { label: 'registró una limpieza pasada', Icon: Check, color: 'text-emerald-400' },
  historical_missed: { label: 'registró una limpieza pasada como no hecha', Icon: X, color: 'text-red-400' },
  missed: { label: 'marcó la tarea como no hecha', Icon: X, color: 'text-red-400' },
  missed_corrected: { label: 'corrigió un fallo', Icon: Undo2, color: 'text-slate-400' },
  disputed: { label: 'puso en duda la confirmación', Icon: Flag, color: 'text-amber-400' },
  justification_submitted: { label: 'presentó un justificante', Icon: FileText, color: 'text-amber-400' },
  justification_vote: { label: 'aprobó el justificante', Icon: ThumbsUp, color: 'text-emerald-400' },
  justification_approved: { label: 'aprobó el justificante final', Icon: ThumbsUp, color: 'text-emerald-400' },
  justification_rejected: { label: 'rechazó el justificante', Icon: X, color: 'text-red-400' },
  justification_expired: { label: 'cerró un justificante sin aprobar', Icon: X, color: 'text-red-400' },
}

export default function CleaningActivityLog({ activity, members }) {
  const [open, setOpen] = useState(false)
  if (!activity.length) return null

  const memberName = uid => members.find(member => member.id === uid)?.name || 'Alguien'

  return (
    <div className="glass rounded-2xl p-5">
      <button onClick={() => setOpen(value => !value)} className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-blue-400"/>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Registro de actividad</p>
            <p className="text-xs text-slate-500">{activity.length} {activity.length === 1 ? 'evento' : 'eventos'}</p>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-4 max-h-96 space-y-1.5 overflow-y-auto border-t border-slate-800 pt-4">
              {activity.map(event => {
                const item = EVENT[event.type] || { label: 'actualizó la tarea', Icon: ClipboardList, color: 'text-slate-400' }
                const eventDate = event.createdAt?.toDate?.()
                const day = event.date ? format(new Date(`${event.date}T00:00:00`), 'd MMM', { locale: es }) : ''
                const timestamp = eventDate ? format(eventDate, 'd MMM, HH:mm', { locale: es }) : day
                return (
                  <div key={event.id} className="rounded-xl bg-slate-800/40 p-2.5">
                    <div className="flex items-start gap-2">
                      <item.Icon size={14} className={`mt-0.5 shrink-0 ${item.color}`}/>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-200">
                          <span className="font-medium text-white">{event.actorName || 'Sistema'}</span> {item.label}
                        </p>
                        <p className="truncate text-xs text-slate-500">{event.zoneLabel} ({day}) · {timestamp}</p>
                        {event.type === 'reassigned' && <p className="text-xs text-slate-500">{memberName(event.previousAssignedTo)} → {memberName(event.assignedTo)}</p>}
                        {event.reason && <p className="mt-1 text-xs text-amber-200/80">“{event.reason}”</p>}
                      </div>
                    </div>
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
