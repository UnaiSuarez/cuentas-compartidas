/**
 * Hook de liquidaciones y pagos óptimos.
 *
 * Pagos en: /groups/{groupId}/payments/{payId}
 *
 * Flujo:
 * 1. Se calculan los pagos óptimos en memoria (algoritmo greedy)
 * 2. El deudor pulsa "He pagado" → crea un pago con status:'pending'
 * 3. El acreedor pulsa "Confirmar" → cambia status a 'confirmed' + crea
 *    una transacción de liquidación en el historial
 *
 * Si hay dinero en la cuenta conjunta, el algoritmo lo tiene en cuenta
 * automáticamente vía las transacciones de tipo 'income' ya existentes.
 */

import { useMemo, useState } from 'react'
import {
  collection, addDoc, updateDoc, doc,
  serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useApp } from '../context/AppContext'
import { useChat } from './useChat'
import { calculateGroupSummary } from '../utils/calculateSettlement'

export function useSettlement() {
  const { groupId, userProfile, transactions, groupMembers, payments } = useApp()
  const { sendPaymentReminder, sendSystemMessage } = useChat()
  const [confirming, setConfirming] = useState(false)

  /**
   * Resumen financiero recalculado cuando cambian transacciones o miembros.
   * Memo para evitar recálculos en cada render.
   */
  const summary = useMemo(() => {
    if (!transactions.length && !groupMembers.length) return {
      totalIngresos:  0,
      totalGastos:    0,
      saldoColectivo: 0,
      balances:       {},
      pagosOptimos:   [],
    }

    // Adapta los datos de Firestore al formato esperado por calculateSettlement
    const normalizedTx = transactions.map(tx => ({
      id:              tx.id,
      tipo:            tx.type,        // 'expense' → 'expense' / 'income' → 'income'
      monto:           tx.amount,
      pagado_por:      tx.paidBy,
      dividido_entre:  tx.splitAmong,
    }))

    const normalizedUsers = groupMembers.map(m => ({ id: m.id }))

    return calculateGroupSummary(normalizedTx, normalizedUsers)
  }, [transactions, groupMembers])

  /**
   * El deudor declara que ha realizado el pago.
   * Crea un documento en /payments con status:'pending' y envía recordatorio al chat.
   *
   * @param {string} toUserId — acreedor
   * @param {number} amount
   */
  async function requestPayment(toUserId, amount) {
    if (!groupId || !userProfile) return

    // Evitar duplicados: si ya existe un pending de mí a esa persona por ese importe, no crear otro
    const alreadyDeclared = payments.some(
      p => p.from === userProfile.id && p.to === toUserId && Math.abs(p.amount - amount) < 0.01
    )
    if (alreadyDeclared) return

    setConfirming(true)
    try {
      await addDoc(collection(db, 'groups', groupId, 'payments'), {
        from:      userProfile.id,
        to:        toUserId,
        amount,
        status:    'pending',
        createdAt: serverTimestamp(),
      })

      await sendPaymentReminder(userProfile.id, toUserId, amount, groupMembers)
    } finally {
      setConfirming(false)
    }
  }

  /**
   * El acreedor confirma que recibió el pago.
   * Cambia el status a 'confirmed' y crea una transacción de liquidación.
   *
   * @param {string} paymentId     — ID del pago en /payments
   * @param {Object} paymentData   — { from, to, amount }
   */
  async function confirmPayment(paymentId, paymentData) {
    if (!groupId) return
    setConfirming(true)
    try {
      // 1. Marcar pago como confirmado
      await updateDoc(doc(db, 'groups', groupId, 'payments', paymentId), {
        status:      'confirmed',
        confirmedAt: serverTimestamp(),
        confirmedBy: userProfile?.id,
      })

      // 2. Registrar en el historial como transacción de tipo 'settlement'
      await addDoc(collection(db, 'groups', groupId, 'transactions'), {
        type:          'income',
        amount:        paymentData.amount,
        category:      'settlement',
        categoryLabel: '💸 Liquidación',
        description:   '💸 Liquidación de deuda',
        paidBy:        paymentData.from,
        splitAmong:    [paymentData.to],
        date:          Timestamp.fromDate(new Date()),
        createdAt:     serverTimestamp(),
        updatedAt:     serverTimestamp(),
        createdBy:     userProfile?.id || '',
        isSettlement:  true,
      })

      // 3. Notificar en el chat
      const fromName = groupMembers.find(m => m.id === paymentData.from)?.name || 'Alguien'
      const toName   = groupMembers.find(m => m.id === paymentData.to)?.name   || 'alguien'
      await sendSystemMessage(`✅ ${fromName} ha liquidado ${paymentData.amount.toFixed(2)}€ con ${toName}`)
    } finally {
      setConfirming(false)
    }
  }

  return { summary, payments, requestPayment, confirmPayment, confirming }
}
