/**
 * Notificaciones push, con dos canales independientes que se envían siempre juntos:
 *
 *   1. Expo Push API — para la app móvil companion (token en member.pushToken).
 *      Directo desde el cliente a https://exp.host, sin servidor propio.
 *   2. Web Push — para el propio navegador, aunque esté cerrado
 *      (suscripción en member.webPushSubscription, ver utils/webPush.js).
 *      El único envío firmado con la clave privada VAPID pasa por la función
 *      serverless api/send-push.js — es la única pieza "con servidor" de la app.
 *
 * Flujo: usuario hace acción → esta utilidad construye título/cuerpo →
 *   los reparte a quien tenga token Expo y/o suscripción Web Push.
 */

import { calculateBalances } from './calculateSettlement'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

// Cooldown en memoria para no spamear notificaciones de saldo en la misma sesión
const cooldowns = new Map()
function cooldownOk(key, ms = 6 * 3_600_000) {
  const last = cooldowns.get(key) || 0
  if (Date.now() - last < ms) return false
  cooldowns.set(key, Date.now())
  return true
}

async function postExpo(messages) {
  const valid = messages.filter(m => m.to?.startsWith('ExponentPushToken'))
  if (!valid.length) return
  try {
    await fetch(EXPO_PUSH_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body:    JSON.stringify(valid),
    })
  } catch (e) {
    console.warn('[push:expo]', e.message)
  }
}

async function postWebPush(subscriptions, title, body, data) {
  if (!subscriptions.length) return
  try {
    await fetch('/api/send-push', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ subscriptions, title, body, data }),
    })
  } catch (e) {
    console.warn('[push:web]', e.message)
  }
}

function tokensOf(members, excludeId = null) {
  return members
    .filter(m => m.id !== excludeId)
    .map(m => m.pushToken)
    .filter(t => t?.startsWith('ExponentPushToken'))
}

function subscriptionsOf(members, excludeId = null) {
  return members
    .filter(m => m.id !== excludeId)
    .map(m => m.webPushSubscription)
    .filter(Boolean)
}

/** Envía a todos los miembros (menos excludeId) por los dos canales. */
async function dispatch(members, { title, body, data, excludeId = null }) {
  const tokens = tokensOf(members, excludeId)
  const subs   = subscriptionsOf(members, excludeId)
  await Promise.all([
    tokens.length ? postExpo(tokens.map(to => ({ to, title, body, sound: 'default', data }))) : null,
    postWebPush(subs, title, body, data),
  ])
}

/** Envía a un único miembro por los dos canales. */
async function dispatchTo(member, { title, body, data }) {
  if (!member) return
  await dispatch([member], { title, body, data })
}

// ─── Nuevo mensaje de chat ────────────────────────────────────────────────────
export async function notifyNewMessage(senderName, text, groupMembers, senderId) {
  await dispatch(groupMembers, {
    title: `💬 ${senderName}`,
    body:  text.substring(0, 120),
    data:  { screen: 'chat' },
    excludeId: senderId,
  })
}

// ─── Recordatorio de pago ─────────────────────────────────────────────────────
// fromMember = quien debe, toMember = quien cobra
export async function notifyPaymentReminder(fromMember, toMember, amount) {
  await dispatchTo(fromMember, {
    title: '💸 Recordatorio de pago',
    body:  `${toMember?.name || 'alguien'} te recuerda que le debes ${amount.toFixed(2)}€. ¡No lo dejes para mañana!`,
    data:  { screen: 'liquidacion' },
  })
}

// ─── Nueva transacción ────────────────────────────────────────────────────────
export async function notifyNewTransaction(tx, senderName, groupMembers, senderId) {
  const emoji = tx.type === 'income' ? '💰' : '🧾'
  const verb  = tx.type === 'income' ? 'ingresó' : 'añadió un gasto de'
  const cat   = tx.categoryLabel || tx.category || ''
  await dispatch(groupMembers, {
    title: `${emoji} Nuevo movimiento`,
    body:  `${senderName} ${verb} ${tx.amount}€${cat ? ` — ${cat}` : ''}`,
    data:  { screen: 'transacciones' },
    excludeId: senderId,
  })
}

// ─── Nuevo miembro en el grupo ────────────────────────────────────────────────
// existingMembers = miembros ANTES de que el nuevo entrara
export async function notifyNewMember(newMemberName, existingMembers, groupName) {
  await dispatch(existingMembers, {
    title: '👋 Nuevo miembro',
    body:  `${newMemberName} se ha unido a ${groupName}. ¡Dale la bienvenida!`,
    data:  { screen: 'ajustes' },
  })
}

// ─── Aviso de saldo extremo ───────────────────────────────────────────────────
// Llama tras cada transacción nueva para avisar si alguien está muy en rojo/verde.
export async function checkBalancesAndNotify(allTransactions, groupMembers) {
  if (!allTransactions.length || !groupMembers.length) return

  const balances = calculateBalances(allTransactions, groupMembers)
  const jobs = []

  for (const member of groupMembers) {
    const bal  = balances[member.id] ?? 0
    const name = member.name || 'Tu avatar'

    if (bal < -50 && cooldownOk(`neg_${member.id}`)) {
      jobs.push(dispatchTo(member, {
        title: '😵 Avatar en coma financiero',
        body:  `${name}, debes ${Math.abs(Math.round(bal))}€ al grupo. ¡Ingresa algo y resucítalo!`,
        data:  { screen: 'liquidacion' },
      }))
    } else if (bal > 100 && cooldownOk(`pos_${member.id}`)) {
      jobs.push(dispatchTo(member, {
        title: '🤑 ¡Estás forrado!',
        body:  `${name}, tienes ${Math.round(bal)}€ a favor. ¡Bien jugado, tacaño!`,
        data:  { screen: 'inicio' },
      }))
    }
  }

  await Promise.all(jobs)
}

// ─── Limpieza: recordatorio del día ──────────────────────────────────────────
export async function notifyCleaningDueToday(member, zoneLabel) {
  if (!cooldownOk(`clean_due_${member?.id}_${new Date().toDateString()}`, 20 * 3_600_000)) return
  await dispatchTo(member, {
    title: '🧹 Hoy te toca limpiar',
    body:  `No olvides: ${zoneLabel}. Márcalo como hecho cuando termines.`,
    data:  { screen: 'limpieza' },
  })
}

// ─── Limpieza: tarea asignada (manual o admin) ───────────────────────────────
export async function notifyCleaningAssigned(member, zoneLabel, dateLabel) {
  await dispatchTo(member, {
    title: '🧹 Nueva tarea de limpieza',
    body:  `Te han asignado "${zoneLabel}" para el ${dateLabel}.`,
    data:  { screen: 'limpieza' },
  })
}

// ─── Limpieza: tarea fallada (avisa a todo el grupo) ─────────────────────────
export async function notifyCleaningMissed(missedMember, zoneLabel, groupMembers) {
  const name = missedMember?.name || 'Alguien'
  await dispatch(groupMembers, {
    title: '😬 Tarea de limpieza sin hacer',
    body:  `${name} no ha marcado "${zoneLabel}" como hecha. Se ha aplicado la penalización del grupo.`,
    data:  { screen: 'limpieza' },
  })
}

// ─── Limpieza: día sin nadie apuntado (modo manual) ──────────────────────────
export async function notifyCleaningUnassigned(zoneLabel, dateLabel, groupMembers) {
  if (!cooldownOk(`clean_unassigned_${zoneLabel}_${dateLabel}`, 20 * 3_600_000)) return
  await dispatch(groupMembers, {
    title: '📅 Falta gente por apuntarse',
    body:  `Nadie se ha apuntado a "${zoneLabel}" del ${dateLabel}. ¡Apúntate antes de que llegue el día!`,
    data:  { screen: 'limpieza' },
  })
}
