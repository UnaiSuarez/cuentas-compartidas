/**
 * Motor de rotación y estado de "Limpieza en casa".
 *
 * Modelo:
 *   - En modo 'auto' el asignado de un slot (día+zona) se calcula de forma
 *     determinista a partir de la fecha — NO requiere guardar nada en Firestore
 *     mientras esté pendiente. Cualquier miembro que abra la app ve siempre
 *     el mismo resultado para el mismo día.
 *   - En modo 'manual' el asignado se guarda explícitamente (alguien se apunta
 *     o el admin asigna); sin asignación, el slot queda "sin asignar".
 *   - Solo se crea un documento en /cleaningTasks cuando el estado se aparta
 *     de "pendiente" (se marca hecho, se falla, o en manual cuando hay
 *     asignación), igual que un calendario que solo anota excepciones.
 *
 * Doc de /groups/{groupId}/cleaningTasks/{date_slotId}:
 *   date, slotId, zoneId, zoneLabel, assignedTo, status ('pending'|'done'|'missed'),
 *   source ('auto'|'signup'|'admin'), doneBy?, doneAt?, createdAt
 */

import { addDays, differenceInCalendarDays, format } from 'date-fns'

const EPOCH = new Date(2024, 0, 1) // punto de referencia fijo para la rotación

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
    penalty: {
      enabled:    true,
      fine:       false,
      fineAmount: 2,
    },
  }
}

function daysSinceEpoch(dateKey) {
  return differenceInCalendarDays(new Date(`${dateKey}T00:00:00`), EPOCH)
}

/** Slots de un día según la granularidad configurada. */
export function slotsForSettings(settings) {
  if (settings.granularity === 'task') {
    return (settings.zones || []).map(z => ({ slotId: z.id, zoneId: z.id, zoneLabel: z.label, zoneIcon: z.icon }))
  }
  return [{ slotId: 'day', zoneId: null, zoneLabel: 'Limpieza general', zoneIcon: '🧹' }]
}

/** uid asignado por rotación determinista (modo automático, sin estado guardado). */
export function autoAssignee(dateKey, slotId, members, settings) {
  if (!members.length) return null
  const order = (settings.rotationOrder?.length
    ? settings.rotationOrder.filter(uid => members.some(m => m.id === uid))
    : members.map(m => m.id))
  if (!order.length) return null

  const zoneOffset = settings.granularity === 'task'
    ? Math.max((settings.zones || []).findIndex(z => z.id === slotId), 0)
    : 0

  const raw = (daysSinceEpoch(dateKey) + zoneOffset) % order.length
  const idx = raw < 0 ? raw + order.length : raw
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
    const slots = slotsForSettings(settings).map(slot => {
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
