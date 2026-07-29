import { useState, useEffect, useMemo, useRef, createElement } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { SlidersHorizontal, Check, UserPlus, UserMinus, X, CalendarOff, Undo2, Flag, CalendarRange, FileText, ThumbsUp, ThumbsDown } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useCleaning } from '../../hooks/useCleaning'
import { buildCalendarDays, todayStr } from '../../utils/calculateCleaningRotation'
import { getAvatarByKey } from '../../assets/avatars'
import Confetti from '../Common/Confetti'
import CleaningCalendar from './CleaningCalendar'
import CleaningStats from './CleaningStats'
import CleaningSettingsPanel from './CleaningSettingsPanel'
import CleaningFinesLog from './CleaningFinesLog'
import CleaningActivityLog from './CleaningActivityLog'
import { RecurringClaimModal, JustificationModal, HistoricalCleaningModal } from './CleaningActionModals'

const STATUS_LABEL = {
  pending: null,
  done:    { text: '✅ Hecho', cls: 'text-emerald-400' },
  missed:  { text: '❌ No se hizo', cls: 'text-red-400' },
  justification_pending: { text: '🧾 En revisión', cls: 'text-amber-400' },
  excused: { text: '✓ Justificado', cls: 'text-blue-400' },
}

function SlotCard({ slot, members, isAdmin, myUid, mode, onDone, onClaim, onClaimRecurring, onJustify, onVoteJustification, onAssign, onUnassign, onUndo, onDispute, submitting }) {
  const [assigning, setAssigning] = useState(false)
  const member = members.find(m => m.id === slot.assignedTo)
  const Av = member ? getAvatarByKey(member.avatar) : null
  const status = STATUS_LABEL[slot.status]
  const isMine = slot.assignedTo === myUid

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40"
    >
      <span className="text-2xl shrink-0">{slot.zoneIcon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{slot.zoneLabel}</p>
        {member ? (
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-4 h-4 shrink-0">{Av && createElement(Av, { state: 'normal', color: member.color || '#2563eb', size: 16 })}</div>
            <p className="text-slate-400 text-xs truncate">{member.name}{isMine && ' (tú)'}</p>
          </div>
        ) : (
          <p className="text-slate-500 text-xs mt-0.5">Sin asignar</p>
        )}
      </div>

      {status && <span className={`text-xs font-medium shrink-0 ${status.cls}`}>{status.text}</span>}

      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
        {slot.status === 'done' && isAdmin && (
          <button onClick={() => onDispute(slot)} disabled={submitting} title="Poner en duda esta confirmación (por si mintió)"
            className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all">
            <Flag size={14}/>
          </button>
        )}

        {slot.status === 'missed' && (isMine || isAdmin) && (
          <button onClick={() => onUndo(slot)} disabled={submitting} title="Sí lo hice, deshacer el fallo"
            className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300
                       px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
            <Undo2 size={13}/> Sí lo hice
          </button>
        )}

        {slot.status === 'pending' && (isMine || isAdmin) && (
          <button onClick={() => onDone(slot)} disabled={submitting}
            title={!isMine ? 'Marcar como hecho en nombre de esta persona' : undefined}
            className="flex items-center gap-1 text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30
                       px-3 py-1.5 rounded-lg hover:bg-emerald-600/30 transition-all disabled:opacity-50">
            <Check size={13}/> Hecho
          </button>
        )}

        {slot.status === 'pending' && mode === 'manual' && !slot.assignedTo && (
          <>
            <button onClick={() => onClaim(slot)} disabled={submitting}
              className="flex items-center gap-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30
                         px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-all disabled:opacity-50">
              <UserPlus size={13}/> Apuntarme
            </button>
            <button onClick={() => onClaimRecurring(slot)} disabled={submitting} title="Apuntarme de forma repetida"
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-blue-400 transition-all disabled:opacity-50">
              <CalendarRange size={14}/>
            </button>
          </>
        )}

        {slot.status === 'pending' && isMine && (
          <button onClick={() => onJustify(slot)} disabled={submitting}
            className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-600/10 px-3 py-1.5 text-xs text-amber-400 transition-all hover:bg-amber-600/20 disabled:opacity-50">
            <FileText size={13}/> Justificar
          </button>
        )}

        {slot.status === 'justification_pending' && !isMine && !slot.task?.justification?.approvals?.[myUid] && !slot.task?.justification?.rejections?.[myUid] && (
          <div className="flex items-center gap-1">
            <button onClick={() => onVoteJustification(slot, true)} disabled={submitting} title="Aprobar justificante"
              className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"><ThumbsUp size={14}/></button>
            <button onClick={() => onVoteJustification(slot, false)} disabled={submitting} title="Rechazar justificante"
              className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 disabled:opacity-50"><ThumbsDown size={14}/></button>
          </div>
        )}

        {slot.status === 'pending' && mode === 'manual' && isMine && (
          <button onClick={() => onUnassign(slot)} disabled={submitting}
            className="flex items-center gap-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300
                       px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
            <UserMinus size={13}/> Cancelar apunte
          </button>
        )}

        {slot.status === 'pending' && mode === 'manual' && isAdmin && slot.assignedTo && !isMine && (
          <button onClick={() => onUnassign(slot)} disabled={submitting}
            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Quitar asignación">
            <UserMinus size={14}/>
          </button>
        )}

        {/* Admin: asignar/reasignar en cualquier modo y estado, para poder corregir días antiguos */}
        {isAdmin && (
          <div className="relative">
            <button onClick={() => setAssigning(a => !a)}
              className="text-xs px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all">
              {assigning ? <X size={13}/> : slot.assignedTo ? 'Reasignar' : 'Asignar'}
            </button>
            {assigning && (
              <div className="absolute right-0 top-full mt-1 z-10 bg-slate-800 border border-slate-700 rounded-xl p-1.5 w-40 shadow-xl">
                {members.map(m => (
                  <button key={m.id} onClick={() => { onAssign(slot, m.id); setAssigning(false) }}
                    className="w-full text-left text-xs px-2 py-1.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
                    {m.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function CleaningPage() {
  const { userProfile, groupMembers, isAdmin, cleaningTasks, cleaningActivity, cleaningSettings, fines } = useApp()
  const {
    tasksByKey, markDone, claimSlot, claimRecurring, addHistoricalCleaning, assignSlot, unassignSlot, undoMissed, disputeMark,
    submitJustification, voteJustification,
    runChecks, updateCleaningSettings, submitting,
  } = useCleaning()

  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [showSettings, setShowSettings] = useState(false)
  const [confetti, setConfetti] = useState(false)
  const [recurringSlot, setRecurringSlot] = useState(null)
  const [justificationSlot, setJustificationSlot] = useState(null)
  const [historicalDate, setHistoricalDate] = useState(null)

  const checkedRef = useRef(false)
  useEffect(() => {
    if (checkedRef.current || !groupMembers.length) return
    checkedRef.current = true
    runChecks()
  }, [groupMembers.length, runChecks])

  const selectedDay = useMemo(() => {
    const centerDate = new Date(`${selectedDate}T00:00:00`)
    return buildCalendarDays(cleaningSettings, groupMembers, tasksByKey, centerDate, 0, 0)[0]
  }, [selectedDate, cleaningSettings, groupMembers, tasksByKey])

  const isToday = selectedDate === todayStr()
  const isPast = selectedDate < todayStr()

  async function handleDone(slot) {
    await markDone(slot)
    if (isToday) setConfetti(c => !c)
  }

  async function handleDispute(slot) {
    if (!confirm('¿Poner en duda esta confirmación? Vuelve a quedar pendiente y, si el día ya pasó, puede contar como fallo.')) return
    await disputeMark(slot)
  }

  return (
    <div className="space-y-6">
      <Confetti trigger={confetti}/>
      {recurringSlot && <RecurringClaimModal slot={recurringSlot} onSubmit={(start, end) => claimRecurring(recurringSlot, start, end)} onClose={() => setRecurringSlot(null)} submitting={submitting}/>}
      {justificationSlot && <JustificationModal onSubmit={reason => submitJustification(justificationSlot, reason)} onClose={() => setJustificationSlot(null)} submitting={submitting}/>}
      {historicalDate && <HistoricalCleaningModal date={historicalDate} settings={cleaningSettings} members={groupMembers} userProfile={userProfile} isAdmin={isAdmin} onSubmit={(slotId, assignedTo, status) => addHistoricalCleaning(historicalDate, slotId, assignedTo, status)} onClose={() => setHistoricalDate(null)} submitting={submitting}/>}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Limpieza en casa</h2>
        {isAdmin && (
          <button onClick={() => setShowSettings(s => !s)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all">
            <SlidersHorizontal size={18}/>
          </button>
        )}
      </div>

      {showSettings && (
        <CleaningSettingsPanel
          settings={cleaningSettings}
          members={groupMembers}
          onSave={updateCleaningSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      <CleaningCalendar
        settings={cleaningSettings}
        members={groupMembers}
        tasksByKey={tasksByKey}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <div className="glass rounded-2xl p-5">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">
          {isToday ? 'Hoy' : format(new Date(`${selectedDate}T00:00:00`), "d 'de' MMMM", { locale: es })}
        </p>
        {selectedDay?.slots.length ? (
          <div className="space-y-2">
            {selectedDay.slots.map(slot => (
              <SlotCard
                key={slot.slotId}
                slot={slot}
                members={groupMembers}
                isAdmin={isAdmin}
                myUid={userProfile?.id}
                mode={cleaningSettings.mode}
                onDone={handleDone}
                onClaim={claimSlot}
                onClaimRecurring={setRecurringSlot}
                onJustify={setJustificationSlot}
                onVoteJustification={voteJustification}
                onAssign={assignSlot}
                onUnassign={unassignSlot}
                onUndo={undoMissed}
                onDispute={handleDispute}
                submitting={submitting}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-6 text-slate-500">
            <CalendarOff size={22} className="mb-2"/>
            {!cleaningSettings.startDate ? (
              <>
                <p className="text-sm">Todavía no se ha configurado la limpieza del grupo.</p>
                {isAdmin && (
                  <button onClick={() => setShowSettings(true)}
                    className="mt-3 text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30
                               px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-all">
                    Configurar ahora
                  </button>
                )}
                {isPast && (
                  <button onClick={() => setHistoricalDate(selectedDate)}
                    className="mt-3 flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/10 px-3 py-1.5 text-xs text-emerald-400 transition-all hover:bg-emerald-600/20">
                    <Check size={13}/> Añadir limpieza pasada
                  </button>
                )}
              </>
            ) : (
              <>
                <p className="text-sm">Este día no toca limpiar.</p>
                {isPast && (
                  <button onClick={() => setHistoricalDate(selectedDate)}
                    className="mt-3 flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-600/10 px-3 py-1.5 text-xs text-emerald-400 transition-all hover:bg-emerald-600/20">
                    <Check size={13}/> Añadir limpieza pasada
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <CleaningFinesLog fines={fines}/>

      <CleaningActivityLog activity={cleaningActivity} members={groupMembers}/>

      <CleaningStats cleaningTasks={cleaningTasks} members={groupMembers} fines={fines}/>
    </div>
  )
}
