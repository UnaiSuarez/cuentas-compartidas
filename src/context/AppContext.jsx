/**
 * Contexto global de la aplicación.
 *
 * Responsabilidades:
 * - Escucha el estado de autenticación de Firebase Auth
 * - Carga y mantiene en memoria los datos del grupo (usuarios, transacciones,
 *   mensajes, pagos, ajustes)
 * - Suscribe listeners de Firestore Realtime para sincronización instantánea
 * - Expone funciones de login, logout y preferencias de UI (darkMode)
 *
 * Estructura Firestore esperada:
 *   groups/{groupId}/
 *   groups/{groupId}/transactions/{txId}
 *   groups/{groupId}/messages/{msgId}
 *   groups/{groupId}/payments/{payId}
 *   users/{userId}
 */

import {
  createContext, useContext, useState,
  useEffect, useCallback, useRef,
} from 'react'
import {
  onAuthStateChanged, signOut,
} from 'firebase/auth'
import {
  doc, getDoc, collection,
  onSnapshot, query, orderBy,
  where, updateDoc, serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../config/firebase'

// ─── Contexto ─────────────────────────────────────────────────────────────────
const AppContext = createContext(null)

/**
 * Hook para consumir el contexto desde cualquier componente.
 * Lanza error si se usa fuera del provider.
 */
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {

  // ── Auth Firebase ──────────────────────────────────────────────────────────
  const [firebaseUser, setFirebaseUser]   = useState(undefined) // undefined = cargando
  const [userProfile,  setUserProfile]    = useState(null)      // doc de /users/{uid}
  const [groupId,      setGroupId]        = useState(null)      // id del grupo del usuario

  // ── Datos del grupo ────────────────────────────────────────────────────────
  const [groupMembers, setGroupMembers]   = useState([])
  const [transactions, setTransactions]  = useState([])
  const [messages,     setMessages]      = useState([])
  const [payments,     setPayments]      = useState([])         // pagos pendientes
  const [categories,   setCategories]    = useState(defaultCategories())
  const [groupSettings, setGroupSettings] = useState(null)

  // ── UI ────────────────────────────────────────────────────────────────────
  const [darkMode,  setDarkMode]  = useState(() => localStorage.getItem('theme') !== 'light')
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  // Refs para cancelar listeners de Firestore al hacer logout
  const unsubTxRef      = useRef(null)
  const unsubMsgRef     = useRef(null)
  const unsubPayRef     = useRef(null)
  const unsubGroupRef   = useRef(null)
  const unsubMembersRef = useRef(null)

  // ── Sincronización de darkMode con el DOM ──────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  function toggleDarkMode() {
    setDarkMode(prev => {
      const next = !prev
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  // ── Listener de autenticación Firebase ────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)

      if (!fbUser) {
        // Usuario desautenticado: limpia todo
        cancelListeners()
        resetData()
        setLoading(false)
        return
      }

      // Usuario autenticado: carga su perfil
      try {
        const profileDoc = await getDoc(doc(db, 'users', fbUser.uid))
        if (profileDoc.exists()) {
          const profile = { id: fbUser.uid, ...profileDoc.data() }
          setUserProfile(profile)
          setGroupId(profile.groupId || null)

          if (profile.groupId) {
            subscribeToGroup(profile.groupId)
          }
        } else {
          // Perfil aún no creado (primer registro incompleto)
          setUserProfile(null)
        }
      } catch (e) {
        setError('Error al cargar el perfil: ' + e.message)
      } finally {
        setLoading(false)
      }
    })

    return unsub
  }, [])

  // ── Suscripciones realtime al grupo ───────────────────────────────────────
  /**
   * Cancela todos los listeners activos de Firestore.
   */
  function cancelListeners() {
    unsubTxRef.current?.()
    unsubMsgRef.current?.()
    unsubPayRef.current?.()
    unsubGroupRef.current?.()
    unsubMembersRef.current?.()
  }

  /**
   * Limpia el estado de datos (al hacer logout).
   */
  function resetData() {
    setUserProfile(null)
    setGroupId(null)
    setGroupMembers([])
    setTransactions([])
    setMessages([])
    setPayments([])
    setGroupSettings(null)
  }

  /**
   * Suscribe a todos los listeners realtime del grupo.
   * @param {string} gId - ID del grupo Firestore
   */
  const subscribeToGroup = useCallback((gId) => {
    cancelListeners()

    // ── Datos del grupo + miembros ─────────────────────────────────────────
    unsubGroupRef.current = onSnapshot(doc(db, 'groups', gId), async (snap) => {
      if (!snap.exists()) return
      const groupData = snap.data()
      setGroupSettings(groupData.settings || null)
      if (groupData.categories) setCategories(groupData.categories)

      // Carga los perfiles de todos los miembros
      const memberProfiles = await loadMemberProfiles(groupData.memberIds || [])
      setGroupMembers(memberProfiles)
    })

    // ── Transacciones ──────────────────────────────────────────────────────
    const txRef = query(
      collection(db, 'groups', gId, 'transactions'),
      orderBy('date', 'desc')
    )
    unsubTxRef.current = onSnapshot(txRef, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    // ── Mensajes (historial completo sin límite) ───────────────────────────
    const msgRef = query(
      collection(db, 'groups', gId, 'messages'),
      orderBy('createdAt', 'desc')
    )
    unsubMsgRef.current = onSnapshot(msgRef, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    // ── Pagos pendientes ───────────────────────────────────────────────────
    const payRef = query(
      collection(db, 'groups', gId, 'payments'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    )
    unsubPayRef.current = onSnapshot(payRef, (snap) => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }, [])

  /**
   * Carga los perfiles de usuario dado un array de UIDs.
   * @param {string[]} uids
   * @returns {Promise<Array>}
   */
  async function loadMemberProfiles(uids) {
    if (!uids.length) return []
    const profiles = await Promise.all(
      uids.map(async uid => {
        const snap = await getDoc(doc(db, 'users', uid))
        return snap.exists() ? { id: uid, ...snap.data() } : null
      })
    )
    return profiles.filter(Boolean)
  }

  /**
   * Actualiza el perfil del usuario en Firestore y en el estado local.
   * @param {Object} data - Campos a actualizar (nombre, avatar, etc.)
   */
  async function updateUserProfile(data) {
    if (!firebaseUser) return
    await updateDoc(doc(db, 'users', firebaseUser.uid), {
      ...data,
      updatedAt: serverTimestamp(),
    })
    setUserProfile(prev => ({ ...prev, ...data }))
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  async function logout() {
    cancelListeners()
    resetData()
    await signOut(auth)
  }

  // ── Callback para cuando el perfil se completa tras el registro ───────────
  /**
   * Se llama desde el flujo de registro una vez que el perfil ya existe en Firestore.
   * @param {Object} profile - Perfil del usuario (con groupId incluido)
   */
  async function onProfileCreated(profile) {
    setUserProfile(profile)
    setGroupId(profile.groupId)
    if (profile.groupId) {
      subscribeToGroup(profile.groupId)
    }
  }

  // ── Valor del contexto ────────────────────────────────────────────────────
  const value = {
    // Auth
    firebaseUser,
    userProfile,
    groupId,
    loading,
    error, setError,
    logout,
    updateUserProfile,
    onProfileCreated,

    // Datos
    groupMembers,
    transactions,
    messages,
    payments,
    categories,
    groupSettings,

    // UI
    darkMode, toggleDarkMode,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// ─── Categorías por defecto ───────────────────────────────────────────────────
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
