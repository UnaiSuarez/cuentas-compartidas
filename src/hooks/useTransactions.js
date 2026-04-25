/**
 * Hook para todas las operaciones CRUD de transacciones.
 *
 * Las transacciones se guardan en:
 *   /groups/{groupId}/transactions/{txId}
 *
 * Cada transacción tiene:
 *   type:         'expense' | 'income'
 *   amount:       number (EUR)
 *   category:     string (id de categoría)
 *   categoryLabel:string (nombre de categoría — snapshot para el historial)
 *   description:  string
 *   paidBy:       userId (quién pagó / aportó)
 *   splitAmong:   userId[] (entre quiénes se divide)
 *   date:         Timestamp (fecha de la transacción)
 *   createdAt:    Timestamp
 *   updatedAt:    Timestamp
 *   createdBy:    userId
 */

import { useState } from 'react'
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, Timestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { useApp } from '../context/AppContext'

export function useTransactions() {
  const { groupId, userProfile, categories } = useApp()
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)

  /**
   * Crea una nueva transacción en el grupo.
   * @param {Object} data
   *   - type:        'expense' | 'income'
   *   - amount:      number
   *   - category:    string (id de categoría)
   *   - description: string
   *   - paidBy:      userId
   *   - splitAmong:  userId[]
   *   - date:        Date | string ISO
   */
  async function createTransaction(data) {
    if (!groupId) { setError('Sin grupo activo'); return }
    setSubmitting(true)
    setError(null)
    try {
      // Snapshot del label de categoría para no perderlo si se renombra
      const categoryLabel = categories.find(c => c.id === data.category)?.label || data.category

      const dateObj = data.date instanceof Date ? data.date : new Date(data.date)

      await addDoc(collection(db, 'groups', groupId, 'transactions'), {
        type:          data.type,
        amount:        Number(data.amount),
        category:      data.category || 'other',
        categoryLabel,
        description:   data.description || '',
        paidBy:        data.paidBy,
        splitAmong:    data.splitAmong || [],
        date:          Timestamp.fromDate(dateObj),
        createdAt:     serverTimestamp(),
        updatedAt:     serverTimestamp(),
        createdBy:     userProfile?.id || '',
      })
    } catch (e) {
      setError('Error al guardar la transacción: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Actualiza una transacción existente.
   * @param {string} txId   — ID del documento en Firestore
   * @param {Object} data   — Campos a actualizar
   */
  async function updateTransaction(txId, data) {
    if (!groupId) return
    setSubmitting(true)
    setError(null)
    try {
      const categoryLabel = data.category
        ? (categories.find(c => c.id === data.category)?.label || data.category)
        : undefined

      const dateObj = data.date
        ? (data.date instanceof Date ? data.date : new Date(data.date))
        : undefined

      await updateDoc(doc(db, 'groups', groupId, 'transactions', txId), {
        ...data,
        ...(categoryLabel !== undefined && { categoryLabel }),
        ...(dateObj       !== undefined && { date: Timestamp.fromDate(dateObj) }),
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      setError('Error al actualizar: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * Elimina permanentemente una transacción.
   * @param {string} txId
   */
  async function deleteTransaction(txId) {
    if (!groupId) return
    setSubmitting(true)
    setError(null)
    try {
      await deleteDoc(doc(db, 'groups', groupId, 'transactions', txId))
    } catch (e) {
      setError('Error al eliminar: ' + e.message)
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  return { createTransaction, updateTransaction, deleteTransaction, submitting, error, setError }
}
