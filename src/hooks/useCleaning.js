/**
 * Hook para "Limpieza en casa".
 *
 * Tareas en: /groups/{groupId}/cleaningTasks/{date_slotId}
 * Solo existe documento cuando el estado se aparta de "pendiente"
 * (alguien se apunta / el admin asigna / se marca hecho / se detecta un fallo).
 * Ver utils/calculateCleaningRotation.js para la resolución de asignado por defecto.
 */

import { useState, useCallback } from 'react'
import {
  doc, setDoc, updateDoc, deleteField,
  collection, addDoc, serverTimestamp,
  runTransaction, writeBatch,
} from 'firebase/firestore'
import { addDays, getISODay } from 'date-fns'
import { db } from '../config/firebase'
import { useApp } from '../context/AppContext'
import { useChat } from './useChat'
import {
  autoAssignee, buildCalendarDays, taskKeyOf, todayStr, dateStr, slotsForDate,
} from '../utils/calculateCleaningRotation'
import {
  notifyCleaningAssigned, notifyCleaningDueToday,
  notifyCleaningMissed, notifyCleaningUnassigned, notifyCleaningJustification,
} from '../utils/pushNotifications'

const CHECK_WINDOW_PAST = 14 // días hacia atrás a revisar en busca de fallos
const CHECK_WINDOW_NEXT = 1  // días hacia delante a avisar de huecos sin apuntar

export function useCleaning() {
  const {
    groupId, userProfile, groupMembers,
    cleaningTasks, cleaningSettings, updateCleaningSettings,
  } = useApp()
  const { sendSystemMessage } = useChat()
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)

  const tasksByKey = {}
  cleaningTasks.forEach(t => { tasksByKey[taskKeyOf(t.date, t.slotId)] = t })

  function taskRef(taskKey) {
    return doc(db, 'groups', groupId, 'cleaningTasks', taskKey)
  }

  async function recordActivity(event) {
    await addDoc(collection(db, 'groups', groupId, 'cleaningActivity'), {
      ...event,
      createdAt: serverTimestamp(),
    })
  }

  function activityBase(slot) {
    return {
      taskKey: slot.taskKey,
      date: slot.date,
      zoneLabel: slot.zoneLabel,
      zoneId: slot.zoneId,
    }
  }

  /** Marca un slot como limpiado. */
  async function markDone(slot) {
    if (!groupId || !userProfile || !slot.assignedTo) return
    setSubmitting(true)
    setError(null)
    try {
      const storedTask = tasksByKey[slot.taskKey]
      const existing = storedTask || slot.task
      await setDoc(taskRef(slot.taskKey), {
        date: slot.date, slotId: slot.slotId, zoneId: slot.zoneId, zoneLabel: slot.zoneLabel,
        assignedTo: slot.assignedTo,
        status: 'done',
        doneBy: userProfile.id,
        doneAt: serverTimestamp(),
        source: existing?.source || 'auto',
        ...(storedTask ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true })
      await recordActivity({
        ...activityBase(slot), type: 'done', actorId: userProfile.id,
        actorName: userProfile.name, assignedTo: slot.assignedTo,
      })
    } catch (e) {
      setError('Error al marcar como hecho: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  /** Registra una limpieza pasada aunque ese día no estuviese en el calendario configurado. */
  async function addHistoricalCleaning(date, slotId, assignedTo, status) {
    if (!groupId || !userProfile || !assignedTo || !['done', 'missed'].includes(status)) return
    const configuredZone = cleaningSettings.zones?.find(zone => zone.id === slotId)
    const slot = slotsForDate(date, { ...cleaningSettings, startDate: cleaningSettings.startDate || date })
      .find(candidate => candidate.slotId === slotId)
      || (slotId === 'day'
        ? { slotId: 'day', zoneId: null, zoneLabel: 'Limpieza general', zoneIcon: '🧹' }
        : configuredZone && { slotId: configuredZone.id, zoneId: configuredZone.id, zoneLabel: configuredZone.label, zoneIcon: configuredZone.icon })
    if (!slot) throw new Error('No se ha encontrado esa tarea de limpieza.')

    const taskKey = taskKeyOf(date, slot.slotId)
    setSubmitting(true)
    setError(null)
    try {
      await setDoc(taskRef(taskKey), {
        date, slotId: slot.slotId, zoneId: slot.zoneId, zoneLabel: slot.zoneLabel,
        assignedTo, status, source: 'historical', createdAt: serverTimestamp(),
        ...(status === 'done' ? { doneBy: userProfile.id, doneAt: serverTimestamp() } : { missedAt: serverTimestamp() }),
      }, { merge: true })
      if (status === 'missed') {
        await applyMissedPenalty({ ...slot, taskKey, date, assignedTo }, assignedTo, 'historical_missed')
      } else {
        await recordActivity({
          taskKey, date, zoneId: slot.zoneId, zoneLabel: slot.zoneLabel,
          type: 'historical_done', assignedTo,
          actorId: userProfile.id, actorName: userProfile.name,
        })
      }
    } catch (e) {
      setError('Error al añadir la limpieza pasada: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  /** Un miembro se apunta a un slot libre (modo manual). */
  async function claimSlot(slot) {
    if (!groupId || !userProfile) return
    setSubmitting(true)
    setError(null)
    try {
      await setDoc(taskRef(slot.taskKey), {
        date: slot.date, slotId: slot.slotId, zoneId: slot.zoneId, zoneLabel: slot.zoneLabel,
        assignedTo: userProfile.id,
        status: 'pending',
        source: 'signup',
        assignmentCleared: deleteField(),
        createdAt: serverTimestamp(),
      }, { merge: true })
      await recordActivity({
        ...activityBase(slot), type: 'claimed', actorId: userProfile.id,
        actorName: userProfile.name, assignedTo: userProfile.id,
      })
    } catch (e) {
      setError('Error al apuntarte: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  /** Se apunta a la misma tarea cada semana dentro de un intervalo. */
  async function claimRecurring(slot, startDate, endDate) {
    if (!groupId || !userProfile || !startDate || !endDate || startDate > endDate) return
    const days = []
    const selectedWeekday = getISODay(new Date(`${slot.date}T00:00:00`))
    for (let date = new Date(`${startDate}T00:00:00`); date <= new Date(`${endDate}T00:00:00`); date = addDays(date, 1)) {
      const dateKey = dateStr(date)
      if (getISODay(date) === selectedWeekday && slotsForDate(dateKey, cleaningSettings).some(candidate => candidate.slotId === slot.slotId)) days.push(dateKey)
    }
    if (!days.length) throw new Error('No hay días de limpieza configurados en ese intervalo para esta tarea.')
    if (days.length > 180) throw new Error('El intervalo es demasiado largo. Elige un máximo de 180 días de limpieza.')
    const availableDays = days.filter(date => {
      const existing = tasksByKey[taskKeyOf(date, slot.slotId)]
      return !existing || (existing.status === 'pending' && (!existing.assignedTo || existing.assignedTo === userProfile.id))
    })
    if (!availableDays.length) throw new Error('Todas esas tareas ya están asignadas o cerradas.')

    setSubmitting(true)
    setError(null)
    try {
      const batch = writeBatch(db)
      availableDays.forEach(date => {
        const taskKey = taskKeyOf(date, slot.slotId)
        batch.set(taskRef(taskKey), {
          date, slotId: slot.slotId, zoneId: slot.zoneId, zoneLabel: slot.zoneLabel,
          assignedTo: userProfile.id, status: 'pending', source: 'recurring', assignmentCleared: deleteField(), createdAt: serverTimestamp(),
        }, { merge: true })
        batch.set(doc(collection(db, 'groups', groupId, 'cleaningActivity')), {
          taskKey, date, zoneLabel: slot.zoneLabel, zoneId: slot.zoneId,
          type: 'recurring_claimed', actorId: userProfile.id, actorName: userProfile.name,
          assignedTo: userProfile.id, createdAt: serverTimestamp(),
        })
      })
      await batch.commit()
    } catch (e) {
      setError('Error al crear las asignaciones repetidas: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * El admin asigna (o reasigna) un slot a un miembro concreto — cualquier
   * modo, cualquier estado y cualquier fecha (pasada o futura), para poder
   * corregir días antiguos. Si el slot ya tenía un estado resuelto
   * (done/missed), lo conserva — solo corrige quién queda como responsable,
   * no borra el historial de si se hizo o no.
   */
  async function assignSlot(slot, targetUid) {
    if (!groupId) return
    setSubmitting(true)
    setError(null)
    try {
      const storedTask = tasksByKey[slot.taskKey]
      const existing = storedTask || slot.task
      const previousUid = existing?.assignedTo || slot.assignedTo
      await setDoc(taskRef(slot.taskKey), {
        date: slot.date, slotId: slot.slotId, zoneId: slot.zoneId, zoneLabel: slot.zoneLabel,
        assignedTo: targetUid,
        status: existing?.status || 'pending',
        source: existing?.source || 'admin',
        assignmentCleared: deleteField(),
        ...(storedTask ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true })
      if (existing?.status === 'missed' && existing.fineId) {
        const target = groupMembers.find(m => m.id === targetUid)
        await updateDoc(doc(db, 'groups', groupId, 'fines', existing.fineId), {
          memberId: targetUid,
          memberName: target?.name || 'Alguien',
          reassignedAt: serverTimestamp(),
          reassignedBy: userProfile?.id || null,
        })
      }
      await recordActivity({
        ...activityBase(slot), type: previousUid === targetUid ? 'assigned' : 'reassigned',
        actorId: userProfile?.id || null, actorName: userProfile?.name || 'Admin',
        assignedTo: targetUid, previousAssignedTo: previousUid || null, status: existing?.status || 'pending',
      })
      const target = groupMembers.find(m => m.id === targetUid)
      if (target && (!existing || existing.status === 'pending')) {
        await notifyCleaningAssigned(target, slot.zoneLabel, slot.date)
      }
    } catch (e) {
      setError('Error al asignar: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  /** Quita una asignación y devuelve la tarea a pendiente, incluso para fechas pasadas. */
  async function unassignSlot(slot) {
    if (!groupId) return
    setSubmitting(true)
    setError(null)
    try {
      const reset = {
        assignedTo: deleteField(), assignmentCleared: true, status: 'pending',
        doneBy: deleteField(), doneAt: deleteField(), missedAt: deleteField(),
      }
      if (tasksByKey[slot.taskKey]) {
        await updateDoc(taskRef(slot.taskKey), reset)
      } else {
        await setDoc(taskRef(slot.taskKey), {
          date: slot.date, slotId: slot.slotId, zoneId: slot.zoneId, zoneLabel: slot.zoneLabel,
          source: 'admin', createdAt: serverTimestamp(), status: 'pending', assignmentCleared: true,
        })
      }
      if (slot.task?.fineId) {
        await updateDoc(doc(db, 'groups', groupId, 'fines', slot.task.fineId), {
          status: 'reversed',
          reversedAt: serverTimestamp(),
          reversedBy: userProfile?.id || null,
          reversedByName: userProfile?.name || 'Alguien',
        })
      }
      await recordActivity({
        ...activityBase(slot), type: 'unassigned', actorId: userProfile?.id || null,
        actorName: userProfile?.name || 'Alguien', previousAssignedTo: slot.assignedTo,
      })
    } catch (e) {
      setError('Error al desasignar: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  async function applyMissedPenalty(slot, assignedUid, reason = 'missed') {
    const missedMember = groupMembers.find(m => m.id === assignedUid)
    const label = `${slot.zoneLabel} (${slot.date})`

    if (cleaningSettings.penalty?.fine) {
      const fineRef = await addDoc(collection(db, 'groups', groupId, 'fines'), {
        memberId: assignedUid, memberName: missedMember?.name || 'Alguien',
        amount: Number(cleaningSettings.penalty.fineAmount) || 0,
        zoneLabel: slot.zoneLabel, date: slot.date, taskKey: slot.taskKey,
        status: 'active', createdAt: serverTimestamp(),
      })
      await updateDoc(taskRef(slot.taskKey), { fineId: fineRef.id })
    }

    await recordActivity({
      ...activityBase(slot), type: reason, assignedTo: assignedUid,
      actorId: userProfile?.id || null, actorName: userProfile?.name || 'Sistema',
    })
    if (cleaningSettings.penalty?.enabled) {
      await sendSystemMessage(`🧹 ${missedMember?.name || 'Alguien'} no marcó "${label}" como hecha.${cleaningSettings.penalty.fine ? ' Se aportó una multa al fondo común.' : ''}`)
      await notifyCleaningMissed(missedMember, label, groupMembers)
    }
  }

  async function handleMissed(slot, reason = 'missed') {
    const assignedUid = await runTransaction(db, async (tx) => {
      const ref  = taskRef(slot.taskKey)
      const snap = await tx.get(ref)
      const current = snap.exists() ? snap.data() : null
      if (current?.status === 'done' || current?.status === 'missed' || current?.status === 'excused') return null

      const resolvedUid = current?.assignedTo
        ?? autoAssignee(slot.date, slot.slotId, groupMembers, cleaningSettings)
      if (!resolvedUid) return null

      tx.set(ref, {
        date: slot.date, slotId: slot.slotId, zoneId: slot.zoneId, zoneLabel: slot.zoneLabel,
        assignedTo: resolvedUid,
        status: 'missed',
        source: current?.source || 'auto',
        missedAt: serverTimestamp(),
        ...(current ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true })

      return resolvedUid
    })

    if (!assignedUid) return

    await applyMissedPenalty(slot, assignedUid, reason)
  }

  /** Presenta un justificante: todos los demás miembros deben validarlo. */
  async function submitJustification(slot, reason) {
    if (!groupId || !userProfile || !slot.assignedTo || !reason.trim()) return
    const requiredVoterIds = groupMembers.filter(member => member.id !== userProfile.id).map(member => member.id)
    setSubmitting(true)
    setError(null)
    try {
      await setDoc(taskRef(slot.taskKey), {
        date: slot.date, slotId: slot.slotId, zoneId: slot.zoneId, zoneLabel: slot.zoneLabel,
        assignedTo: slot.assignedTo, status: 'justification_pending', source: slot.task?.source || 'auto',
        justification: {
          reason: reason.trim(), submittedBy: userProfile.id, submittedByName: userProfile.name,
          requiredVoterIds, approvals: {}, deadline: dateStr(addDays(new Date(`${slot.date}T00:00:00`), 2)),
        },
        ...(slot.task ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true })
      await recordActivity({
        ...activityBase(slot), type: 'justification_submitted', assignedTo: slot.assignedTo,
        actorId: userProfile.id, actorName: userProfile.name, reason: reason.trim(),
      })
      await sendSystemMessage(`🧾 ${userProfile.name} ha presentado un justificante para "${slot.zoneLabel}" del ${slot.date}. El resto del grupo debe validarlo.`)
      await notifyCleaningJustification(
        groupMembers.filter(member => requiredVoterIds.includes(member.id)),
        userProfile.name, slot.zoneLabel, slot.date
      )
    } catch (e) {
      setError('Error al enviar el justificante: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  async function voteJustification(slot, approved) {
    if (!groupId || !userProfile || !slot.task?.justification) return
    setSubmitting(true)
    setError(null)
    try {
      const outcome = await runTransaction(db, async tx => {
        const ref = taskRef(slot.taskKey)
        const snap = await tx.get(ref)
        const current = snap.data()
        const justification = current?.justification
        if (!justification || current.status !== 'justification_pending') throw new Error('El justificante ya no está pendiente.')
        if (justification.submittedBy === userProfile.id) throw new Error('No puedes votar tu propio justificante.')
        if (justification.approvals?.[userProfile.id] || justification.rejections?.[userProfile.id]) throw new Error('Ya has votado este justificante.')

        const voters = justification.requiredVoterIds || groupMembers.filter(m => m.id !== justification.submittedBy).map(m => m.id)
        if (!voters.includes(userProfile.id)) throw new Error('No formas parte de los revisores de este justificante.')
        const approvals = { ...(justification.approvals || {}), ...(approved ? { [userProfile.id]: userProfile.name } : {}) }
        const rejections = { ...(justification.rejections || {}), ...(!approved ? { [userProfile.id]: userProfile.name } : {}) }
        const patch = { 'justification.approvals': approvals, 'justification.rejections': rejections }
        if (!justification.requiredVoterIds) patch['justification.requiredVoterIds'] = voters
        if (!approved) patch.status = 'missed'
        if (approved && voters.every(uid => approvals[uid])) {
          patch.status = 'excused'
          patch.excusedAt = serverTimestamp()
        }
        tx.update(ref, patch)
        return approved && voters.every(uid => approvals[uid]) ? 'excused' : approved ? 'approved' : 'rejected'
      })
      await recordActivity({
        ...activityBase(slot), type: outcome === 'excused' ? 'justification_approved' : outcome === 'rejected' ? 'justification_rejected' : 'justification_vote',
        assignedTo: slot.assignedTo, actorId: userProfile.id, actorName: userProfile.name,
      })
      if (outcome === 'rejected') await applyMissedPenalty(slot, slot.assignedTo, 'justification_rejected')
      if (outcome === 'excused') await sendSystemMessage(`✅ El justificante de ${slot.task.justification.submittedByName} para "${slot.zoneLabel}" ha sido aprobado por todo el grupo.`)
    } catch (e) {
      setError('Error al votar el justificante: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Deshace un fallo marcado por error (ej. sí se limpió pero se olvidó
   * confirmarlo a tiempo): pasa el slot a 'done' y revierte la multa si la hubo.
   * La multa NO se borra — se marca como revertida, para que quede constancia
   * de ambas cosas en el registro y nadie pueda hacer trampas borrando el rastro.
   */
  async function undoMissed(slot) {
    if (!groupId || !userProfile || !slot.task) return
    setSubmitting(true)
    setError(null)
    try {
      await updateDoc(taskRef(slot.taskKey), {
        status: 'done',
        doneBy: userProfile.id,
        doneAt: serverTimestamp(),
        correctedAt: serverTimestamp(),
      })
      await recordActivity({
        ...activityBase(slot), type: 'missed_corrected', assignedTo: slot.assignedTo,
        actorId: userProfile.id, actorName: userProfile.name,
      })

      if (slot.task.fineId) {
        await updateDoc(doc(db, 'groups', groupId, 'fines', slot.task.fineId), {
          status: 'reversed',
          reversedAt: serverTimestamp(),
          reversedBy: userProfile.id,
          reversedByName: userProfile.name,
        })
      }

      const member = groupMembers.find(m => m.id === slot.assignedTo)
      await sendSystemMessage(
        `🙏 ${userProfile.name} corrigió "${slot.zoneLabel}" del ${slot.date}: ${member?.name || 'la persona asignada'} sí había limpiado.` +
        (slot.task.fineId ? ' Se revirtió la multa del fondo de multas.' : '')
      )
    } catch (e) {
      setError('Error al deshacer el fallo: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Pone en duda una tarea marcada como hecha (ej. alguien sospecha que
   * mintió). Solo el admin puede hacerlo. Vuelve a 'pending' — si el día ya
   * pasó, el siguiente runChecks() la marcará 'missed' con su penalización
   * normal. Deja rastro (disputedBy/disputedAt) y aviso en el chat.
   */
  async function disputeMark(slot) {
    if (!groupId || !userProfile || !slot.task) return
    setSubmitting(true)
    setError(null)
    try {
      await updateDoc(taskRef(slot.taskKey), {
        status: 'pending',
        doneBy: deleteField(),
        doneAt: deleteField(),
        disputedBy: userProfile.id,
        disputedByName: userProfile.name,
        disputedAt: serverTimestamp(),
      })
      await recordActivity({
        ...activityBase(slot), type: 'disputed', assignedTo: slot.assignedTo,
        actorId: userProfile.id, actorName: userProfile.name,
      })

      const member = groupMembers.find(m => m.id === slot.assignedTo)
      await sendSystemMessage(
        `🚩 ${userProfile.name} ha puesto en duda que ${member?.name || 'alguien'} limpiara "${slot.zoneLabel}" del ${slot.date}. Vuelve a quedar pendiente.`
      )
    } catch (e) {
      setError('Error al poner en duda: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Revisa el calendario reciente y:
   *  - marca como falladas las tareas pasadas que quedaron pendientes y aplica penalización
   *  - recuerda al usuario si hoy le toca algo
   *  - avisa al grupo si un hueco próximo (modo manual) sigue sin nadie apuntado
   * Pensado para ejecutarse una vez por sesión al cargar la app (sin cron server-side).
   */
  const runChecks = useCallback(async () => {
    if (!groupId || !groupMembers.length || !userProfile) return

    const today = todayStr()
    const days = buildCalendarDays(
      cleaningSettings, groupMembers, tasksByKey,
      new Date(), CHECK_WINDOW_PAST, CHECK_WINDOW_NEXT
    )

    for (const day of days) {
      for (const slot of day.slots) {
        if (day.date < today && slot.status === 'pending' && slot.assignedTo) {
          await handleMissed(slot)
        } else if (
          slot.status === 'justification_pending' && slot.task?.justification?.deadline &&
          slot.task.justification.deadline < today
        ) {
          await handleMissed(slot, 'justification_expired')
        } else if (day.date === today && slot.status === 'pending' && slot.assignedTo === userProfile.id) {
          await notifyCleaningDueToday(userProfile, slot.zoneLabel)
        } else if (
          cleaningSettings.mode === 'manual' && day.date >= today &&
          slot.status === 'pending' && !slot.assignedTo
        ) {
          await notifyCleaningUnassigned(slot.zoneLabel, day.date, groupMembers)
        }
      }
    }
  }, [groupId, groupMembers, userProfile, cleaningSettings, cleaningTasks]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    tasksByKey,
    markDone, claimSlot, claimRecurring, addHistoricalCleaning, assignSlot, unassignSlot, undoMissed, disputeMark,
    submitJustification, voteJustification,
    runChecks,
    updateCleaningSettings,
    submitting, error, setError,
  }
}
