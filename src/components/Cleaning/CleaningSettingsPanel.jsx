import { useState, useMemo } from 'react'
import { Plus, X, Save, ArrowUp, ArrowDown } from 'lucide-react'
import { getAvatarByKey } from '../../assets/avatars'
import { todayStr } from '../../utils/calculateCleaningRotation'

const WEEKDAYS = [
  { iso: 1, label: 'L' }, { iso: 2, label: 'M' }, { iso: 3, label: 'X' },
  { iso: 4, label: 'J' }, { iso: 5, label: 'V' }, { iso: 6, label: 'S' }, { iso: 7, label: 'D' },
]

export default function CleaningSettingsPanel({ settings, members, onSave, onClose }) {
  const [mode,        setMode]        = useState(settings.mode)
  const [granularity, setGranularity] = useState(settings.granularity)
  const [zones,        setZones]        = useState(settings.zones.map(z => ({ ...z })))
  const [activeDays,   setActiveDays]   = useState(settings.activeDays || [])
  const [rotationOrder, setRotationOrder] = useState(
    settings.rotationOrder?.length ? [...settings.rotationOrder] : members.map(m => m.id)
  )
  const [penaltyEnabled, setPenaltyEnabled] = useState(settings.penalty?.enabled ?? true)
  const [penaltyFine,    setPenaltyFine]    = useState(settings.penalty?.fine ?? false)
  const [fineAmount,     setFineAmount]     = useState(settings.penalty?.fineAmount ?? 2)
  const [saving, setSaving] = useState(false)

  function toggleDay(iso) {
    setActiveDays(prev => prev.includes(iso) ? prev.filter(d => d !== iso) : [...prev, iso].sort())
  }

  // Incluye a cualquier miembro nuevo que se haya unido mientras el orden guardado no lo contemplaba
  const displayOrder = useMemo(() => {
    const known = rotationOrder.filter(uid => members.some(m => m.id === uid))
    const missing = members.filter(m => !known.includes(m.id)).map(m => m.id)
    return [...known, ...missing]
  }, [rotationOrder, members])

  function updateZone(i, field, value) {
    setZones(prev => prev.map((z, idx) => idx === i ? { ...z, [field]: value } : z))
  }
  function addZone() {
    setZones(prev => [...prev, { id: `zone_${Date.now()}`, label: 'Nueva zona', icon: '🧹' }])
  }
  function removeZone(i) {
    if (zones.length <= 1) return
    setZones(prev => prev.filter((_, idx) => idx !== i))
  }
  function moveMember(i, dir) {
    const next = [...displayOrder]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    setRotationOrder(next)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave({
        mode, granularity, zones, rotationOrder: displayOrder, activeDays,
        // La rotación empieza a contar desde que se configura por primera vez,
        // nunca desde antes — así el calendario no aparece ya relleno.
        startDate: settings.startDate || todayStr(),
        penalty: { enabled: penaltyEnabled, fine: penaltyFine, fineAmount: Number(fineAmount) || 0 },
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-5">
      <p className="text-slate-400 text-xs uppercase tracking-wider">Ajustes de limpieza</p>

      {/* Modo */}
      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">Modo de asignación</label>
        <div className="flex gap-2">
          <button onClick={() => setMode('auto')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                       ${mode === 'auto' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' : 'bg-slate-800/60 text-slate-400 border border-slate-700/40'}`}>
            Automático (rotación)
          </button>
          <button onClick={() => setMode('manual')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                       ${mode === 'manual' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' : 'bg-slate-800/60 text-slate-400 border border-slate-700/40'}`}>
            Manual (apuntarse / asignar)
          </button>
        </div>
      </div>

      {/* Días activos / frecuencia semanal */}
      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">
          ¿Qué días se limpia? ({activeDays.length} {activeDays.length === 1 ? 'vez' : 'veces'} por semana)
        </label>
        <div className="flex gap-1.5">
          {WEEKDAYS.map(({ iso, label }) => (
            <button key={iso} onClick={() => toggleDay(iso)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                         ${activeDays.includes(iso) ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' : 'bg-slate-800/60 text-slate-400 border border-slate-700/40'}`}>
              {label}
            </button>
          ))}
        </div>
        {activeDays.length === 0 && (
          <p className="text-xs text-slate-500 mt-1.5">Sin días marcados, el calendario no genera ninguna tarea.</p>
        )}
      </div>

      {/* Granularidad */}
      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">¿Cómo se reparte cada día?</label>
        <div className="flex gap-2">
          <button onClick={() => setGranularity('day')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                       ${granularity === 'day' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' : 'bg-slate-800/60 text-slate-400 border border-slate-700/40'}`}>
            Una persona para todo
          </button>
          <button onClick={() => setGranularity('task')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                       ${granularity === 'task' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' : 'bg-slate-800/60 text-slate-400 border border-slate-700/40'}`}>
            Una persona por tarea
          </button>
        </div>
      </div>

      {/* Zonas / tareas (solo relevante si granularity=task) */}
      {granularity === 'task' && (
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Tareas a repartir</label>
          <div className="space-y-2">
            {zones.map((z, i) => (
              <div key={z.id} className="flex items-center gap-2">
                <input type="text" value={z.icon} onChange={e => updateZone(i, 'icon', e.target.value)}
                  maxLength={4} className="w-12 bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-center text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40"/>
                <input type="text" value={z.label} onChange={e => updateZone(i, 'label', e.target.value)}
                  maxLength={24} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/40"/>
                <button onClick={() => removeZone(i)} disabled={zones.length <= 1}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-30">
                  <X size={14}/>
                </button>
              </div>
            ))}
            <button onClick={addZone}
              className="w-full py-2 rounded-lg border border-dashed border-slate-600 text-slate-400
                         hover:border-blue-500/40 hover:text-blue-400 text-sm flex items-center justify-center gap-1.5 transition-all">
              <Plus size={14}/> Añadir tarea
            </button>
          </div>
        </div>
      )}

      {/* Orden de rotación (modo auto) */}
      {mode === 'auto' && (
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Orden de rotación</label>
          <div className="space-y-1.5">
            {displayOrder.map((uid, i) => {
              const m = members.find(mm => mm.id === uid)
              if (!m) return null
              const Av = getAvatarByKey(m.avatar)
              return (
                <div key={uid} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/40">
                  <span className="text-xs text-slate-500 w-4 text-center">{i + 1}</span>
                  <Av state="normal" color={m.color || '#2563eb'} size={26}/>
                  <p className="flex-1 text-sm text-white truncate">{m.name}</p>
                  <button onClick={() => moveMember(i, -1)} disabled={i === 0}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-20"><ArrowUp size={14}/></button>
                  <button onClick={() => moveMember(i, 1)} disabled={i === displayOrder.length - 1}
                    className="p-1 text-slate-400 hover:text-white disabled:opacity-20"><ArrowDown size={14}/></button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Penalización */}
      <div>
        <label className="text-xs text-slate-400 mb-1.5 block">Penalización si alguien no limpia</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={penaltyEnabled} onChange={e => setPenaltyEnabled(e.target.checked)}
              className="w-4 h-4 rounded accent-blue-600"/>
            Avisar al grupo y contar el fallo (puntos/racha)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input type="checkbox" checked={penaltyFine} onChange={e => setPenaltyFine(e.target.checked)} disabled={!penaltyEnabled}
              className="w-4 h-4 rounded accent-blue-600 disabled:opacity-40"/>
            Además, cargar una multa al fondo común
          </label>
          {penaltyFine && penaltyEnabled && (
            <div className="flex items-center gap-2 pl-6">
              <input type="number" min="0" step="0.5" value={fineAmount} onChange={e => setFineAmount(e.target.value)}
                className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-blue-500/40"/>
              <span className="text-sm text-slate-400">€ por fallo</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} disabled={saving}
          className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save size={14}/> Guardar</>}
        </button>
        <button onClick={onClose}
          className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 py-2.5 rounded-xl text-sm transition-all">
          Cancelar
        </button>
      </div>
    </div>
  )
}
