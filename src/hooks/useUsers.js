import { useState } from 'react'
import { supabase } from '../utils/supabase'
import { useApp } from '../context/AppContext'

/**
 * Hook para CRUD de usuarios del grupo.
 */
export function useUsers() {
  const { loadUsers } = useApp()
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)

  async function createUser(data) {
    setSubmitting(true)
    setError(null)
    try {
      const { error } = await supabase.from('users').insert(data)
      if (error) throw error
      await loadUsers()
    } catch (e) {
      setError(e.message); throw e
    } finally {
      setSubmitting(false)
    }
  }

  async function updateUser(id, data) {
    setSubmitting(true)
    setError(null)
    try {
      const { error } = await supabase.from('users').update(data).eq('id', id)
      if (error) throw error
      await loadUsers()
    } catch (e) {
      setError(e.message); throw e
    } finally {
      setSubmitting(false)
    }
  }

  /**
   * No borra físicamente: marca como inactivo para preservar historial.
   */
  async function deleteUser(id) {
    setSubmitting(true)
    setError(null)
    try {
      const { error } = await supabase.from('users').update({ activo: false }).eq('id', id)
      if (error) throw error
      await loadUsers()
    } catch (e) {
      setError(e.message); throw e
    } finally {
      setSubmitting(false)
    }
  }

  return { createUser, updateUser, deleteUser, submitting, error }
}
