/**
 * Hook que encapsula toda la lógica de autenticación y gestión de grupos.
 *
 * Flujo de onboarding:
 * 1. El usuario se registra con email + contraseña (Firebase Auth)
 * 2. Elige un nombre y un avatar
 * 3. Crea un grupo nuevo (genera código alfanumérico de 6 chars) o se une
 *    a uno existente con el código que le dieron
 * 4. Queda dentro del grupo con su perfil listo
 *
 * Colecciones de Firestore que modifica:
 *   /users/{uid}          — perfil del usuario
 *   /groups/{groupId}     — info del grupo + lista de memberIds
 */

import { useState } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth'
import {
  doc, setDoc, getDoc, addDoc, updateDoc,
  collection, query, where, getDocs,
  serverTimestamp, arrayUnion,
} from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { useApp } from '../context/AppContext'

export function useAuth() {
  const { onProfileCreated } = useApp()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // ── Registro ───────────────────────────────────────────────────────────────
  /**
   * Crea una cuenta Firebase Auth y guarda el perfil mínimo en Firestore.
   * El usuario queda sin grupo hasta que llame a createGroup o joinGroup.
   *
   * @param {string} email
   * @param {string} password
   * @returns {import('firebase/auth').UserCredential}
   */
  async function signUp(email, password) {
    setLoading(true)
    setError(null)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)

      // Perfil inicial — nombre y avatar se completan en el paso siguiente
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        name:      '',
        avatar:    'avatar0',
        groupId:   null,
        color:     randomColor(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      return cred
    } catch (e) {
      setError(translateFirebaseError(e.code))
      throw e
    } finally {
      setLoading(false)
    }
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  /**
   * @param {string} email
   * @param {string} password
   */
  async function login(email, password) {
    setLoading(true)
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e) {
      setError(translateFirebaseError(e.code))
      throw e
    } finally {
      setLoading(false)
    }
  }

  // ── Reset contraseña ───────────────────────────────────────────────────────
  async function resetPassword(email) {
    setLoading(true)
    setError(null)
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (e) {
      setError(translateFirebaseError(e.code))
      throw e
    } finally {
      setLoading(false)
    }
  }

  // ── Completar perfil ───────────────────────────────────────────────────────
  /**
   * Actualiza el nombre y avatar del usuario tras el registro.
   * @param {string} uid
   * @param {string} name
   * @param {string} avatar  — clave del avatar (ej: 'avatar3')
   * @param {string} color   — color hex del usuario
   */
  async function completeProfile(uid, name, avatar, color) {
    await updateDoc(doc(db, 'users', uid), {
      name, avatar, color,
      updatedAt: serverTimestamp(),
    })
  }

  // ── Crear grupo ────────────────────────────────────────────────────────────
  /**
   * Crea un grupo nuevo, genera su código y vincula al usuario creador.
   * @param {string} uid       — uid del usuario creador
   * @param {string} groupName — nombre del grupo (ej: "Piso de Unai")
   * @returns {string}         — groupId del grupo creado
   */
  async function createGroup(uid, groupName) {
    setLoading(true)
    setError(null)
    try {
      const code = generateGroupCode()

      const groupRef = await addDoc(collection(db, 'groups'), {
        name:       groupName,
        code:       code.toUpperCase(),
        memberIds:  [uid],
        createdBy:  uid,
        createdAt:  serverTimestamp(),
        updatedAt:  serverTimestamp(),
        settings: {
          timezone: 'Europe/Madrid',
          currency: 'EUR',
        },
        categories: defaultCategories(),
      })

      // Vincula el usuario al grupo
      await updateDoc(doc(db, 'users', uid), {
        groupId:   groupRef.id,
        updatedAt: serverTimestamp(),
      })

      // Carga perfil actualizado y notifica al contexto
      const profileSnap = await getDoc(doc(db, 'users', uid))
      const profile = { id: uid, ...profileSnap.data() }
      await onProfileCreated(profile)

      return groupRef.id
    } catch (e) {
      setError('Error al crear el grupo: ' + e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  // ── Unirse a un grupo ──────────────────────────────────────────────────────
  /**
   * Busca el grupo por código y añade al usuario si hay hueco (máx. 10 miembros).
   * @param {string} uid  — uid del usuario que se une
   * @param {string} code — código de 6 caracteres del grupo
   * @returns {string}    — groupId del grupo al que se unió
   */
  async function joinGroup(uid, code) {
    setLoading(true)
    setError(null)
    try {
      // Busca el grupo por código (case-insensitive gracias a toUpperCase en la creación)
      const q = query(
        collection(db, 'groups'),
        where('code', '==', code.toUpperCase())
      )
      const snap = await getDocs(q)

      if (snap.empty) {
        setError('Código de grupo no encontrado. Comprueba que sea correcto.')
        throw new Error('Grupo no encontrado')
      }

      const groupDoc  = snap.docs[0]
      const groupData = groupDoc.data()

      // Comprueba que el usuario no esté ya en el grupo
      if (groupData.memberIds.includes(uid)) {
        setError('Ya eres miembro de este grupo.')
        throw new Error('Ya eres miembro')
      }

      if (groupData.memberIds.length >= 10) {
        setError('El grupo está lleno (máximo 10 miembros).')
        throw new Error('Grupo lleno')
      }

      // Añade el uid al array de memberIds
      await updateDoc(groupDoc.ref, {
        memberIds: arrayUnion(uid),
        updatedAt: serverTimestamp(),
      })

      // Vincula el usuario al grupo
      await updateDoc(doc(db, 'users', uid), {
        groupId:   groupDoc.id,
        updatedAt: serverTimestamp(),
      })

      // Carga perfil actualizado y notifica al contexto
      const profileSnap = await getDoc(doc(db, 'users', uid))
      const profile = { id: uid, ...profileSnap.data() }
      await onProfileCreated(profile)

      return groupDoc.id
    } catch (e) {
      if (!error) setError('Error al unirse al grupo: ' + e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }

  return {
    signUp, login, resetPassword,
    completeProfile, createGroup, joinGroup,
    loading, error, setError,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Genera un código alfanumérico de 6 caracteres mayúsculas. */
function generateGroupCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin O,0,1,I para evitar confusión
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/** Colores de acento por usuario (cycling). */
function randomColor() {
  const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']
  return colors[Math.floor(Math.random() * colors.length)]
}

/** Traduce códigos de error de Firebase a mensajes en español. */
function translateFirebaseError(code) {
  const map = {
    'auth/email-already-in-use':    'Ese correo ya tiene una cuenta. Inicia sesión.',
    'auth/invalid-email':           'El correo no tiene un formato válido.',
    'auth/weak-password':           'La contraseña debe tener al menos 6 caracteres.',
    'auth/user-not-found':          'No existe cuenta con ese correo.',
    'auth/wrong-password':          'Contraseña incorrecta.',
    'auth/too-many-requests':       'Demasiados intentos fallidos. Espera unos minutos.',
    'auth/network-request-failed':  'Error de red. Comprueba tu conexión.',
    'auth/invalid-credential':      'Correo o contraseña incorrectos.',
  }
  return map[code] || 'Ha ocurrido un error. Inténtalo de nuevo.'
}

/** Categorías por defecto (idénticas a las del AppContext para consistencia). */
function defaultCategories() {
  return [
    { id: 'food',       label: 'Comida',        icon: '🍔',  suggestedAmount: 50  },
    { id: 'transport',  label: 'Transporte',     icon: '🚗',  suggestedAmount: 30  },
    { id: 'home',       label: 'Casa / Hogar',   icon: '🏠',  suggestedAmount: 200 },
    { id: 'leisure',    label: 'Ocio',           icon: '🎮',  suggestedAmount: 40  },
    { id: 'health',     label: 'Salud',          icon: '💊',  suggestedAmount: 25  },
    { id: 'shopping',   label: 'Compras',        icon: '🛍️', suggestedAmount: 60  },
    { id: 'bills',      label: 'Facturas',       icon: '📄',  suggestedAmount: 80  },
    { id: 'travel',     label: 'Viajes',         icon: '✈️',  suggestedAmount: 150 },
    { id: 'education',  label: 'Educación',      icon: '📚',  suggestedAmount: 50  },
    { id: 'income',     label: 'Ingreso',        icon: '💰',  suggestedAmount: 0   },
    { id: 'other',      label: 'Otros',          icon: '📦',  suggestedAmount: 20  },
  ]
}
