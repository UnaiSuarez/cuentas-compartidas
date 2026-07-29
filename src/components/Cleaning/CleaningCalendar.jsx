import { useState, useMemo } from 'react'
import { startOfWeek, addWeeks, isToday, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buildCalendarDays } from '../../utils/calculateCleaningRotation'
import { getAvatarByKey } from '../../assets/avatars'

const STATUS_DOT = {
  done:    'bg-emerald-500',
  missed:  'bg-red-500',
  pending: 'bg-slate-600',
}

export default function CleaningCalendar({ settings, members, tasksByKey, selectedDate, onSelectDate }) {
  const [weekOffset, setWeekOffset] = useState(0)

  const weekStart = useMemo(
    () => addWeeks(startOfWeek(new Date(), { weekStartsOn: 1, locale: es }), weekOffset),
    [weekOffset]
  )

  const days = useMemo(
    () => buildCalendarDays(settings, members, tasksByKey, weekStart, 0, 6),
    [settings, members, tasksByKey, weekStart]
  )

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setWeekOffset(w => w - 1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all">
          <ChevronLeft size={16}/>
        </button>
        <p className="text-sm text-slate-300 font-medium">
          {format(weekStart, "'Semana del' d MMM", { locale: es })}
        </p>
        <button onClick={() => setWeekOffset(w => w + 1)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all">
          <ChevronRight size={16}/>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map(day => {
          const isSelected = selectedDate === day.date
          const todayCol    = isToday(day.dateObj)
          return (
            <button
              key={day.date}
              onClick={() => onSelectDate(day.date)}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all
                         ${isSelected ? 'bg-blue-600/20 border border-blue-500/40'
                           : todayCol ? 'bg-slate-800/70 border border-slate-700/60'
                           : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/60'}`}
            >
              <span className="text-[10px] uppercase text-slate-500">{format(day.dateObj, 'EEE', { locale: es })}</span>
              <span className={`text-sm font-semibold ${todayCol ? 'text-blue-400' : 'text-white'}`}>
                {format(day.dateObj, 'd')}
              </span>
              <div className="flex flex-wrap justify-center gap-0.5 mt-0.5 max-w-full">
                {day.slots.map(slot => {
                  const member = members.find(m => m.id === slot.assignedTo)
                  const Av = member ? getAvatarByKey(member.avatar) : null
                  return Av ? (
                    <div key={slot.slotId} className="relative w-4 h-4 shrink-0">
                      <Av state="normal" color={member.color || '#2563eb'} size={16}/>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${STATUS_DOT[slot.status]}`}/>
                    </div>
                  ) : (
                    <span key={slot.slotId} className={`w-2 h-2 rounded-full ${STATUS_DOT[slot.status]}`}/>
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
