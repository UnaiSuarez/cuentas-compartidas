import { useState, useMemo } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths,
  isToday, isSameMonth, differenceInCalendarDays, format,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Check, X as XIcon } from 'lucide-react'
import { buildCalendarDays } from '../../utils/calculateCleaningRotation'

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

export default function CleaningCalendar({ settings, members, tasksByKey, selectedDate, onSelectDate }) {
  const [monthOffset, setMonthOffset] = useState(0)

  const monthDate = useMemo(() => addMonths(new Date(), monthOffset), [monthOffset])
  const gridStart = useMemo(
    () => startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1, locale: es }),
    [monthDate]
  )
  const gridEnd = useMemo(
    () => endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1, locale: es }),
    [monthDate]
  )
  const totalDays = differenceInCalendarDays(gridEnd, gridStart) + 1

  const days = useMemo(
    () => buildCalendarDays(settings, members, tasksByKey, gridStart, 0, totalDays - 1),
    [settings, members, tasksByKey, gridStart, totalDays]
  )

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMonthOffset(o => o - 1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all">
          <ChevronLeft size={16}/>
        </button>
        <p className="text-sm text-slate-300 font-medium capitalize">
          {format(monthDate, 'MMMM yyyy', { locale: es })}
        </p>
        <button onClick={() => setMonthOffset(o => o + 1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all">
          <ChevronRight size={16}/>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map(d => (
          <div key={d} className="text-center text-[10px] text-slate-500 uppercase">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const inMonth    = isSameMonth(day.dateObj, monthDate)
          const isSelected = selectedDate === day.date
          const todayCell  = isToday(day.dateObj)
          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={`flex flex-col items-start gap-0.5 p-1 rounded-lg min-h-[56px] text-left transition-all
                         ${!inMonth ? 'opacity-30' : ''}
                         ${isSelected ? 'bg-blue-600/20 border border-blue-500/40'
                           : todayCell ? 'bg-slate-800/70 border border-slate-700/60'
                           : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/60'}`}
            >
              <span className={`text-xs font-semibold ${todayCell ? 'text-blue-400' : 'text-white'}`}>
                {format(day.dateObj, 'd')}
              </span>
              <div className="flex flex-col gap-0.5 w-full">
                {day.slots.map(slot => {
                  const member = members.find(m => m.id === slot.assignedTo)
                  const nameColor = slot.status === 'missed' ? 'text-red-400'
                    : slot.status === 'done' ? 'text-emerald-400' : 'text-slate-400'
                  return (
                    <div key={slot.slotId} className="flex items-center gap-0.5 w-full leading-tight">
                      {slot.status === 'done'   && <Check size={9} className="text-emerald-400 shrink-0"/>}
                      {slot.status === 'missed' && <XIcon size={9} className="text-red-400 shrink-0"/>}
                      {slot.status === 'pending' && (
                        <span className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: member?.color || '#475569' }}/>
                      )}
                      <span className={`text-[9px] truncate ${nameColor}`}>
                        {member?.name?.split(' ')[0] || (slot.assignedTo ? '?' : '—')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
