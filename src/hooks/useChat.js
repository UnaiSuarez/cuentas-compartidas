/**
 * Hook para el chat interno del grupo.
 *
 * Mensajes en: /groups/{groupId}/messages/{msgId}
 *
 * Tipos de mensaje:
 *   'message'         — mensaje de texto normal
 *   'system'          — notificación del sistema (gasto añadido, etc.)
 *   'payment_reminder'— recordatorio de pago entre usuarios
 *
 * El historial es sin límite. Todos los mensajes se guardan para siempre.
 */

import { useState } from 'react'
import {
  collection, addDoc, updateDoc, doc,
  serverTimestamp, arrayUnion,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useApp } from '../context/AppContext'
import { notifyNewMessage, notifyPaymentReminder } from '../utils/pushNotifications'

export function useChat() {
  const { groupId, userProfile, messages, groupMembers } = useApp()
  const [sending, setSending] = useState(false)

  /**
   * Envía un mensaje de texto normal.
   * @param {string} text — contenido del mensaje
   */
  async function sendMessage(text) {
    if (!text.trim() || !userProfile || !groupId) return
    setSending(true)
    try {
      await addDoc(collection(db, 'groups', groupId, 'messages'), {
        type:         'message',
        text:         text.trim(),
        sender:       userProfile.id,
        senderName:   userProfile.name,
        senderAvatar: userProfile.avatar,
        readBy:       [userProfile.id],
        createdAt:    serverTimestamp(),
      })
      await notifyNewMessage(userProfile.name, text.trim(), groupMembers, userProfile.id)
    } finally {
      setSending(false)
    }
  }

  /**
   * Envía un recordatorio de pago automático al chat.
   * @param {string} fromUserId — el deudor
   * @param {string} toUserId   — el acreedor
   * @param {number} amount     — importe en EUR
   * @param {Array}  members    — lista de miembros del grupo para obtener nombres
   */
  async function sendPaymentReminder(fromUserId, toUserId, amount, members) {
    if (!groupId) return
    const allMembers = members?.length ? members : groupMembers
    const fromName   = allMembers.find(m => m.id === fromUserId)?.name || 'Alguien'
    const toName     = allMembers.find(m => m.id === toUserId)?.name   || 'alguien'

    await addDoc(collection(db, 'groups', groupId, 'messages'), {
      type:       'payment_reminder',
      text:       `💸 Recordatorio: ${fromName} debe ${amount.toFixed(2)}€ a ${toName}`,
      sender:     userProfile?.id || fromUserId,
      senderName: 'Sistema',
      readBy:     [],
      fromUserId,
      toUserId,
      amount,
      createdAt:  serverTimestamp(),
    })

    const fromMember = allMembers.find(m => m.id === fromUserId)
    const toMember   = allMembers.find(m => m.id === toUserId)
    await notifyPaymentReminder(fromMember, toMember, amount)
  }

  /**
   * Envía un mensaje de sistema (ej: "Unai añadió un gasto de 45€ en Comida").
   * @param {string} text
   */
  async function sendSystemMessage(text) {
    if (!groupId) return
    await addDoc(collection(db, 'groups', groupId, 'messages'), {
      type:       'system',
      text,
      sender:     userProfile?.id || 'system',
      senderName: 'Sistema',
      readBy:     [],
      createdAt:  serverTimestamp(),
    })
  }

  /**
   * Marca un mensaje como leído por el usuario activo.
   * @param {string} messageId
   */
  async function markAsRead(messageId) {
    if (!userProfile || !groupId) return
    const msg = messages.find(m => m.id === messageId)
    if (!msg || msg.readBy?.includes(userProfile.id)) return

    await updateDoc(doc(db, 'groups', groupId, 'messages', messageId), {
      readBy: arrayUnion(userProfile.id),
    })
  }

  /**
   * Cuenta los mensajes no leídos por el usuario activo.
   * Excluye los mensajes de sistema y los propios del usuario.
   */
  const unreadCount = userProfile
    ? messages.filter(m =>
        m.type !== 'system' &&
        m.sender !== userProfile.id &&
        !m.readBy?.includes(userProfile.id)
      ).length
    : 0

  return { sendMessage, sendPaymentReminder, sendSystemMessage, markAsRead, sending, unreadCount }
}
