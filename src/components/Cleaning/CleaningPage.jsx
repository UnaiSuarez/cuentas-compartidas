import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { SlidersHorizontal, Check, UserPlus, UserMinus, X, CalendarOff } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useCleaning } from '../../hooks/useCleaning'
import { buildCalendarDays, todayStr } from '../../utils/calculateCleaningRotation'
import { getAvatarByKey } from '../../assets/avatars'
import Confetti from '../Common/Confetti'
import CleaningCalendar from './CleaningCalendar'
import CleaningStats from './CleaningStats'
import CleaningSettingsPanel from './CleaningSettingsPanel'

const STATUS_LABEL = {
  pending: null,
  done:    { text: '✅ Hecho', cls: 'text-emerald-400' },
  missed:  { text: '❌ No se hizo', cls: 'text-red-400' },
}

function SlotCard({ slot, members, isAdmin, myUid, mode, onDone, onClaim, onAssign, onUnassign, submitting }) {
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
            <div className="w-4 h-4 shrink-0">{Av && <Av state="normal" color={member.color || '#2563eb'} size={16}/>}</div>
            <p className="text-slate-400 text-xs truncate">{member.name}{isMine && ' (tú)'}</p>
          </div>
        ) : (
          <p className="text-slate-500 text-xs mt-0.5">Sin asignar</p>
        )}
      </div>

      {status && <span className={`text-xs font-medium shrink-0 ${status.cls}`}>{status.text}</span>}

      {slot.status === 'pending' && (
        <div className="flex items-center gap-1.5 shrink-0">
          {isMine && (
            <button onClick={() => onDone(slot)} disabled={submitting}
              className="flex items-center gap-1 text-xs bg-emerald-600/20 text-emerald-400 border border-emerald-500/30
                         px-3 py-1.5 rounded-lg hover:bg-emerald-600/30 transition-all disabled:opacity-50">
              <Check size={13}/> Hecho
            </button>
          )}
          {mode === 'manual' && !slot.assignedTo && (
            <button onClick={() => onClaim(slot)} disabled={submitting}
              className="flex items-center gap-1 text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30
                         px-3 py-1.5 rounded-lg hover:bg-blue-600/30 transition-all disabled:opacity-50">
              <UserPlus size={13}/> Apuntarme
            </button>
          )}
          {mode === 'manual' && isAdmin && slot.assignedTo && !isMine && (
            <button onClick={() => onUnassign(slot)} disabled={submitting}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all" title="Quitar asignación">
              <UserMinus size={14}/>
            </button>
          )}
          {mode === 'manual' && isAdmin && (
            <div className="relative">
              <button onClick={() => setAssigning(a => !a)}
                className="text-xs px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all">
                {assigning ? <X size={13}/> : 'Asignar'}
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
      )}
    </motion.div>
  )
}

export default function CleaningPage() {
  const { userProfile, groupMembers, isAdmin, cleaningTasks, cleaningSettings } = useApp()
  const {
    tasksByKey, markDone, claimSlot, assignSlot, unassignSlot,
    runChecks, updateCleaningSettings, submitting,
  } = useCleaning()

  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [showSettings, setShowSettings] = useState(false)
  const [confetti, setConfetti] = useState(false)

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

  async function handleDone(slot) {
    await markDone(slot)
    if (isToday) setConfetti(c => !c)
  }

  return (
    <div className="space-y-6">
      <Confetti trigger={confetti}/>

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
                onAssign={assignSlot}
                onUnassign={unassignSlot}
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
              </>
            ) : (
              <p className="text-sm">Este día no toca limpiar.</p>
            )}
          </div>
        )}
      </div>

      <CleaningStats cleaningTasks={cleaningTasks} members={groupMembers}/>
    </div>
  )
}
