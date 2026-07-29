/**
 * Motor de rotación y estado de "Limpieza en casa".
 *
 * Modelo:
 *   - El grupo elige qué días de la semana se limpia (`activeDays`, 1=lunes..7=domingo).
 *     Sin días elegidos (grupo recién creado / nunca configurado) el calendario
 *     no genera ninguna tarea — así empieza vacío en vez de rellenarse solo.
 *   - `startDate` se fija automáticamente la primera vez que se guardan los
 *     ajustes: la rotación cuenta ocurrencias de días activos desde ahí, nunca
 *     desde antes de que el grupo lo configurara.
 *   - En modo 'auto' el asignado de un slot (día+zona) se calcula de forma
 *     determinista (rotación por nº de ocurrencia desde startDate) — NO
 *     requiere guardar nada en Firestore mientras esté pendiente.
 *   - En modo 'manual' el asignado se guarda explícitamente (alguien se apunta
 *     o el admin asigna); sin asignación, el slot queda "sin asignar".
 *   - Solo se crea un documento en /cleaningTasks cuando el estado se aparta
 *     de "pendiente" (se marca hecho, se falla, o en manual cuando hay
 *     asignación), igual que un calendario que solo anota excepciones.
 *
 * Doc de /groups/{groupId}/cleaningTasks/{date_slotId}:
 *   date, slotId, zoneId, zoneLabel, assignedTo, status ('pending'|'done'|'missed'),
 *   source ('auto'|'signup'|'recurring'|'admin'), doneBy?, doneAt?, createdAt,
 *   justification?: { reason, submittedBy, approvals, deadline }
 */

import { addDays, format } from 'date-fns'

export function dateStr(d) {
  return format(d, 'yyyy-MM-dd')
}

export function todayStr() {
  return dateStr(new Date())
}

export function taskKeyOf(date, slotId) {
  return `${date}_${slotId}`
}

export function defaultCleaningZones() {
  return [
    { id: 'kitchen',  label: 'Cocina',        icon: '🍳' },
    { id: 'bathroom', label: 'Baño',          icon: '🚿' },
    { id: 'living',   label: 'Salón',          icon: '🛋️' },
    { id: 'trash',    label: 'Basura',        icon: '🗑️' },
    { id: 'rooms',    label: 'Habitaciones',  icon: '🛏️' },
  ]
}

export function defaultCleaningSettings() {
  return {
    mode:          'auto',   // 'auto' | 'manual'
    granularity:   'day',    // 'day' (una persona para todo) | 'task' (una persona por tarea)
    zones:         defaultCleaningZones(),
    rotationOrder: [],       // uids; vacío = orden de groupMembers
    activeDays:    [],       // 1=lunes..7=domingo; vacío = calendario sin configurar (vacío)
    startDate:     null,     // 'YYYY-MM-DD'; se fija solo al guardar por primera vez
    penalty: {
      enabled:    true,
      fine:       false,
      fineAmount: 2,
    },
  }
}

/** Convierte Date → día ISO (1=lunes..7=domingo). */
function isoWeekday(d) {
  const day = d.getDay()
  return day === 0 ? 7 : day
}

export function isActiveDay(dateObj, activeDays) {
  return (activeDays || []).includes(isoWeekday(dateObj))
}

/**
 * Nº de ocurrencia (0-based) de `dateKey` entre los días activos desde `startDate`.
 * null si el grupo no está configurado, la fecha es anterior al inicio, o ese
 * día de la semana no está activo.
 */
export function occurrenceIndex(dateKey, settings) {
  const { activeDays, startDate } = settings
  if (!startDate || !activeDays?.length) return null

  const target = new Date(`${dateKey}T00:00:00`)
  const start  = new Date(`${startDate}T00:00:00`)
  if (target < start) return null
  if (!isActiveDay(target, activeDays)) return null

  let count  = -1
  let cursor = start
  while (cursor <= target) {
    if (isActiveDay(cursor, activeDays)) count++
    cursor = addDays(cursor, 1)
  }
  return count
}

/** Slots de un día según la granularidad configurada; [] si ese día no toca limpiar. */
export function slotsForDate(dateKey, settings) {
  const dateObj = new Date(`${dateKey}T00:00:00`)
  if (!settings.startDate || dateObj < new Date(`${settings.startDate}T00:00:00`)) return []
  if (!isActiveDay(dateObj, settings.activeDays)) return []

  if (settings.granularity === 'task') {
    return (settings.zones || []).map(z => ({ slotId: z.id, zoneId: z.id, zoneLabel: z.label, zoneIcon: z.icon }))
  }
  return [{ slotId: 'day', zoneId: null, zoneLabel: 'Limpieza general', zoneIcon: '🧹' }]
}

/** uid asignado por rotación determinista (modo automático, sin estado guardado). */
export function autoAssignee(dateKey, slotId, members, settings) {
  if (!members.length) return null
  const occ = occurrenceIndex(dateKey, settings)
  if (occ === null) return null

  const order = (settings.rotationOrder?.length
    ? settings.rotationOrder.filter(uid => members.some(m => m.id === uid))
    : members.map(m => m.id))
  if (!order.length) return null

  const zoneOffset = settings.granularity === 'task'
    ? Math.max((settings.zones || []).findIndex(z => z.id === slotId), 0)
    : 0

  const idx = (occ + zoneOffset) % order.length
  return order[idx]
}

/** Asignado efectivo de un slot: doc guardado (si existe) o rotación automática. */
export function resolveAssignee(task, dateKey, slotId, members, settings) {
  if (settings.mode === 'manual') return task?.assignedTo ?? null
  return task?.assignedTo ?? autoAssignee(dateKey, slotId, members, settings)
}

export function resolveStatus(task) {
  return task?.status || 'pending'
}

/**
 * Construye los días a mostrar en el calendario con sus slots resueltos.
 * @returns [{ date, dateObj, slots: [{ slotId, zoneId, zoneLabel, zoneIcon, taskKey, assignedTo, status, task }] }]
 */
export function buildCalendarDays(settings, members, tasksByKey, centerDate, daysBefore, daysAfter) {
  const days = []
  for (let offset = -daysBefore; offset <= daysAfter; offset++) {
    const d   = addDays(centerDate, offset)
    const key = dateStr(d)
    const slots = slotsForDate(key, settings).map(slot => {
      const taskKey    = taskKeyOf(key, slot.slotId)
      const task       = tasksByKey[taskKey] || null
      const assignedTo = resolveAssignee(task, key, slot.slotId, members, settings)
      return { ...slot, taskKey, date: key, assignedTo, status: resolveStatus(task), task }
    })
    days.push({ date: key, dateObj: d, slots })
  }
  return days
}

/**
 * Estadísticas por miembro a partir de los documentos guardados
 * (solo existen para slots ya completados/fallados).
 */
export function computeCleaningStats(cleaningTasks, members) {
  const stats = {}
  members.forEach(m => { stats[m.id] = { done: 0, missed: 0, streak: 0 } })

  const sorted = [...cleaningTasks].sort((a, b) => a.date.localeCompare(b.date))

  sorted.forEach(t => {
    if (!t.assignedTo || !stats[t.assignedTo]) return
    if (t.status === 'done')   stats[t.assignedTo].done++
    if (t.status === 'missed') stats[t.assignedTo].missed++
  })

  // Racha actual = tareas completadas consecutivas más recientes (sin ningún fallo después)
  members.forEach(m => {
    const mine = sorted.filter(t => t.assignedTo === m.id).reverse()
    let streak = 0
    for (const t of mine) {
      if (t.status === 'done') streak++
      else break
    }
    stats[m.id].streak = streak
  })

  return stats
}
