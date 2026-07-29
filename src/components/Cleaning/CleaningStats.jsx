import { Flame, CheckCircle2, XCircle } from 'lucide-react'
import { getAvatarByKey } from '../../assets/avatars'
import { computeCleaningStats } from '../../utils/calculateCleaningRotation'

export default function CleaningStats({ cleaningTasks, members }) {
  const stats = computeCleaningStats(cleaningTasks, members)

  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Estadísticas</p>
      <div className="space-y-2">
        {members.map(m => {
          const s  = stats[m.id] || { done: 0, missed: 0, streak: 0 }
          const Av = getAvatarByKey(m.avatar)
          const state = s.missed > s.done ? 'dead' : s.streak > 0 ? 'happy' : 'normal'
          return (
            <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40">
              <Av state={state} color={m.color || '#2563eb'} size={36}/>
              <p className="flex-1 text-sm text-white font-medium truncate">{m.name}</p>
              <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 size={13}/>{s.done}</span>
              <span className="flex items-center gap-1 text-xs text-red-400"><XCircle size={13}/>{s.missed}</span>
              <span className="flex items-center gap-1 text-xs text-amber-400"><Flame size={13}/>{s.streak}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
