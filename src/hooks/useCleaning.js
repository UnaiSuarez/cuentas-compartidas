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
  runTransaction,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useApp } from '../context/AppContext'
import { useChat } from './useChat'
import {
  autoAssignee, buildCalendarDays, taskKeyOf, todayStr,
} from '../utils/calculateCleaningRotation'
import {
  notifyCleaningAssigned, notifyCleaningDueToday,
  notifyCleaningMissed, notifyCleaningUnassigned,
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

  /** Marca un slot como limpiado. */
  async function markDone(slot) {
    if (!groupId || !userProfile) return
    setSubmitting(true)
    setError(null)
    try {
      const existing = tasksByKey[slot.taskKey]
      await setDoc(taskRef(slot.taskKey), {
        date: slot.date, slotId: slot.slotId, zoneId: slot.zoneId, zoneLabel: slot.zoneLabel,
        assignedTo: slot.assignedTo,
        status: 'done',
        doneBy: userProfile.id,
        doneAt: serverTimestamp(),
        source: existing?.source || 'auto',
        ...(existing ? {} : { createdAt: serverTimestamp() }),
      }, { merge: true })
    } catch (e) {
      setError('Error al marcar como hecho: ' + e.message)
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
        createdAt: serverTimestamp(),
      }, { merge: true })
    } catch (e) {
      setError('Error al apuntarte: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  /** El admin asigna un slot a un miembro concreto (modo manual). */
  async function assignSlot(slot, targetUid) {
    if (!groupId) return
    setSubmitting(true)
    setError(null)
    try {
      await setDoc(taskRef(slot.taskKey), {
        date: slot.date, slotId: slot.slotId, zoneId: slot.zoneId, zoneLabel: slot.zoneLabel,
        assignedTo: targetUid,
        status: 'pending',
        source: 'admin',
        createdAt: serverTimestamp(),
      }, { merge: true })
      const target = groupMembers.find(m => m.id === targetUid)
      if (target) await notifyCleaningAssigned(target, slot.zoneLabel, slot.date)
    } catch (e) {
      setError('Error al asignar: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  /** Quita la asignación de un slot pendiente (cancelar apunte / admin desasigna). */
  async function unassignSlot(slot) {
    if (!groupId || !slot.task) return
    setSubmitting(true)
    setError(null)
    try {
      await updateDoc(taskRef(slot.taskKey), {
        assignedTo: deleteField(),
        source: deleteField(),
      })
    } catch (e) {
      setError('Error al desasignar: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMissed(slot) {
    const assignedUid = await runTransaction(db, async (tx) => {
      const ref  = taskRef(slot.taskKey)
      const snap = await tx.get(ref)
      const current = snap.exists() ? snap.data() : null
      if (current?.status === 'done' || current?.status === 'missed') return null

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

    const missedMember = groupMembers.find(m => m.id === assignedUid)
    const label = `${slot.zoneLabel} (${slot.date})`

    if (cleaningSettings.penalty?.fine) {
      // Fondo de multas: ledger totalmente aparte del saldo colectivo/transacciones.
      // Ese dinero no es de nadie — solo se resta de quien falla, nunca se reparte
      // ni se suma al saldo de nadie más.
      const fineRef = await addDoc(collection(db, 'groups', groupId, 'fines'), {
        memberId: assignedUid, memberName: missedMember?.name || 'Alguien',
        amount: Number(cleaningSettings.penalty.fineAmount) || 0,
        zoneLabel: slot.zoneLabel, date: slot.date, taskKey: slot.taskKey,
        status: 'active',
        createdAt: serverTimestamp(),
      })
      await updateDoc(taskRef(slot.taskKey), { fineId: fineRef.id })
    }

    if (cleaningSettings.penalty?.enabled) {
      await sendSystemMessage(`🧹 ${missedMember?.name || 'Alguien'} no marcó "${label}" como hecha.${cleaningSettings.penalty.fine ? ' Se aportó una multa al fondo común.' : ''}`)
      await notifyCleaningMissed(missedMember, label, groupMembers)
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
    markDone, claimSlot, assignSlot, unassignSlot, undoMissed,
    runChecks,
    updateCleaningSettings,
    submitting, error, setError,
  }
}
