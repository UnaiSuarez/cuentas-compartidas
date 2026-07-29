import {
  createContext, useContext, useState,
  useEffect, useCallback, useRef,
} from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  doc, getDoc, collection,
  onSnapshot, query, orderBy,
  updateDoc, serverTimestamp, writeBatch,
} from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { defaultCleaningSettings, isActiveDay, todayStr } from '../utils/calculateCleaningRotation'

const AppContext = createContext(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}

export function AppProvider({ children }) {
  const [firebaseUser,  setFirebaseUser]  = useState(undefined)
  const [userProfile,   setUserProfile]   = useState(null)
  const [groupId,       setGroupId]       = useState(null)     // sala activa
  const [userGroupIds,  setUserGroupIds]  = useState([])       // todas las salas del usuario
  const [userRooms,     setUserRooms]     = useState([])       // info básica de cada sala

  const [groupInfo,     setGroupInfo]     = useState(null)     // { name, code, createdBy, memberIds }
  const [groupMembers,  setGroupMembers]  = useState([])
  const [transactions,  setTransactions]  = useState([])
  const [messages,      setMessages]      = useState([])
  // payments eliminado: ya no se necesita flujo de confirmación manual
  const [categories,    setCategories]    = useState(defaultCategories())
  const [groupSettings, setGroupSettings] = useState(null)
  const [cleaningTasks,    setCleaningTasks]    = useState([])
  const [cleaningActivity, setCleaningActivity] = useState([])
  const [cleaningSettings, setCleaningSettings] = useState(defaultCleaningSettings())
  const [fines,            setFines]            = useState([])

  const [darkMode,  setDarkMode]  = useState(() => localStorage.getItem('theme') !== 'light')
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const unsubTxRef       = useRef(null)
  const unsubMsgRef      = useRef(null)
  const unsubGroupRef    = useRef(null)
  const unsubCleaningRef = useRef(null)
  const unsubActivityRef = useRef(null)
  const unsubFinesRef    = useRef(null)

  const isAdmin = userProfile?.id != null && groupInfo?.createdBy === userProfile.id

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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)

      if (!fbUser) {
        cancelListeners()
        resetData()
        setLoading(false)
        return
      }

      try {
        const profileDoc = await getDoc(doc(db, 'users', fbUser.uid))
        if (profileDoc.exists()) {
          const profile = { id: fbUser.uid, ...profileDoc.data() }
          setUserProfile(profile)

          // Normaliza groupIds (backward compat con campo groupId legacy)
          const gIds = profile.groupIds?.length
            ? profile.groupIds
            : profile.groupId ? [profile.groupId] : []
          setUserGroupIds(gIds)

          // Carga info básica de cada sala
          const rooms = await loadUserRooms(gIds)
          setUserRooms(rooms)

          // Restaura la sala activa desde localStorage
          const storedId = localStorage.getItem(`activeGroup_${fbUser.uid}`)
          if (storedId && gIds.includes(storedId)) {
            setGroupId(storedId)
            subscribeToGroup(storedId)
          }
        } else {
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

  function cancelListeners() {
    unsubTxRef.current?.()
    unsubMsgRef.current?.()
    unsubGroupRef.current?.()
    unsubCleaningRef.current?.()
    unsubActivityRef.current?.()
    unsubFinesRef.current?.()
  }

  function resetData() {
    setUserProfile(null)
    setGroupId(null)
    setUserGroupIds([])
    setUserRooms([])
    setGroupInfo(null)
    setGroupMembers([])
    setTransactions([])
    setMessages([])
    setGroupSettings(null)
    setCleaningTasks([])
    setCleaningActivity([])
    setCleaningSettings(defaultCleaningSettings())
    setFines([])
  }

  function resetGroupData() {
    setGroupInfo(null)
    setGroupMembers([])
    setTransactions([])
    setMessages([])
    setGroupSettings(null)
    setCategories(defaultCategories())
    setCleaningTasks([])
    setCleaningActivity([])
    setCleaningSettings(defaultCleaningSettings())
    setFines([])
  }

  const subscribeToGroup = useCallback((gId) => {
    cancelListeners()

    unsubGroupRef.current = onSnapshot(doc(db, 'groups', gId), async (snap) => {
      if (!snap.exists()) return
      const data = snap.data()
      setGroupSettings(data.settings || null)
      if (data.categories) setCategories(data.categories)
      setCleaningSettings({ ...defaultCleaningSettings(), ...(data.cleaningSettings || {}) })
      setGroupInfo({
        name:      data.name,
        code:      data.code,
        createdBy: data.createdBy,
        memberIds: data.memberIds,
      })
      const memberProfiles = await loadMemberProfiles(data.memberIds || [])
      setGroupMembers(memberProfiles)
    })

    // Todas las transacciones, sin límite: los cálculos de saldo (Dashboard,
    // Liquidación, Estadísticas) necesitan el historial completo para ser
    // correctos. La paginación de la lista en TransactionList es solo visual
    // (recorta lo que se pinta, no lo que se carga ni lo que se calcula).
    unsubTxRef.current = onSnapshot(
      query(collection(db, 'groups', gId, 'transactions'), orderBy('date', 'desc')),
      (snap) => setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )

    unsubMsgRef.current = onSnapshot(
      query(collection(db, 'groups', gId, 'messages'), orderBy('createdAt', 'desc')),
      (snap) => setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )

    unsubCleaningRef.current = onSnapshot(
      query(collection(db, 'groups', gId, 'cleaningTasks'), orderBy('date', 'desc')),
      (snap) => setCleaningTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )

    unsubActivityRef.current = onSnapshot(
      query(collection(db, 'groups', gId, 'cleaningActivity'), orderBy('createdAt', 'desc')),
      (snap) => setCleaningActivity(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )

    unsubFinesRef.current = onSnapshot(
      query(collection(db, 'groups', gId, 'fines'), orderBy('createdAt', 'desc')),
      (snap) => setFines(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )

  }, [])

  /** Cambia la sala activa */
  function switchActiveGroup(newGroupId) {
    cancelListeners()
    resetGroupData()
    setGroupId(newGroupId)
    if (firebaseUser) {
      localStorage.setItem(`activeGroup_${firebaseUser.uid}`, newGroupId)
    }
    subscribeToGroup(newGroupId)
  }

  /** Llimpia la sala activa (vuelve al selector) */
  function clearActiveGroup() {
    cancelListeners()
    resetGroupData()
    setGroupId(null)
    if (firebaseUser) {
      localStorage.removeItem(`activeGroup_${firebaseUser.uid}`)
    }
  }

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

  async function loadUserRooms(groupIds) {
    if (!groupIds.length) return []
    const snaps = await Promise.all(groupIds.map(id => getDoc(doc(db, 'groups', id))))
    return snaps
      .filter(s => s.exists())
      .map(s => ({
        id:          s.id,
        name:        s.data().name,
        code:        s.data().code,
        memberCount: s.data().memberIds?.length || 0,
        createdBy:   s.data().createdBy,
      }))
  }

  async function updateUserProfile(data) {
    if (!firebaseUser) return
    await updateDoc(doc(db, 'users', firebaseUser.uid), {
      ...data,
      updatedAt: serverTimestamp(),
    })
    setUserProfile(prev => ({ ...prev, ...data }))
  }

  /** Actualiza las categorías del grupo activo */
  async function updateGroupCategories(newCategories) {
    if (!groupId) return
    await updateDoc(doc(db, 'groups', groupId), {
      categories: newCategories,
      updatedAt:  serverTimestamp(),
    })
  }

  /** Actualiza la configuración de limpieza del grupo (modo, granularidad, zonas, rotación, penalización) */
  async function updateCleaningSettings(newSettings) {
    if (!groupId) return
    const merged = { ...cleaningSettings, ...newSettings }
    const today = todayStr()
    const obsoleteTasks = cleaningTasks.filter(task =>
      task.source !== 'historical' && task.date >= today &&
      !isActiveDay(new Date(`${task.date}T00:00:00`), merged.activeDays)
    )
    const obsoleteTaskKeys = new Set(obsoleteTasks.map(task => `${task.date}_${task.slotId}`))
    const obsoleteFines = fines.filter(fine =>
      fine.status !== 'reversed' && (
        obsoleteTaskKeys.has(fine.taskKey) ||
        (fine.date >= today && !isActiveDay(new Date(`${fine.date}T00:00:00`), merged.activeDays))
      )
    )
    const batch = writeBatch(db)
    obsoleteTasks.forEach(task => batch.delete(doc(db, 'groups', groupId, 'cleaningTasks', task.id)))
    obsoleteFines.forEach(fine => batch.update(doc(db, 'groups', groupId, 'fines', fine.id), {
      status: 'reversed',
      reversedAt: serverTimestamp(),
      reversedBy: userProfile?.id || null,
      reversedByName: userProfile?.name || 'Alguien',
    }))
    batch.update(doc(db, 'groups', groupId), {
      cleaningSettings: merged,
      updatedAt: serverTimestamp(),
    })
    await batch.commit()
  }

  /** Actualiza el nombre del grupo (solo admin) */
  async function updateGroupName(newName) {
    if (!groupId || !isAdmin) return
    await updateDoc(doc(db, 'groups', groupId), {
      name:      newName,
      updatedAt: serverTimestamp(),
    })
    setGroupInfo(prev => ({ ...prev, name: newName }))
  }

  async function logout() {
    cancelListeners()
    resetData()
    await signOut(auth)
  }

  /**
   * Llamado desde useAuth tras crear/unirse a una sala.
   * Acepta el groupId recién creado/unido como sala activa.
   */
  async function onProfileCreated(profile, newGroupId) {
    setUserProfile(profile)
    const gIds = profile.groupIds?.length
      ? profile.groupIds
      : profile.groupId ? [profile.groupId] : []
    setUserGroupIds(gIds)

    const rooms = await loadUserRooms(gIds)
    setUserRooms(rooms)

    if (newGroupId) {
      setGroupId(newGroupId)
      if (profile.id) {
        localStorage.setItem(`activeGroup_${profile.id}`, newGroupId)
      }
      subscribeToGroup(newGroupId)
    }
  }

  const value = {
    firebaseUser, userProfile, groupId,
    userGroupIds, userRooms,
    groupInfo, groupMembers,
    transactions,
    messages,
    categories, groupSettings,
    cleaningTasks, cleaningActivity, cleaningSettings, fines,
    isAdmin,
    loading, error, setError,
    logout, updateUserProfile,
    updateGroupCategories, updateGroupName, updateCleaningSettings,
    switchActiveGroup, clearActiveGroup,
    onProfileCreated,
    darkMode, toggleDarkMode,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

function defaultCategories() {
  return [
    { id: 'food',      label: 'Comida',      icon: '🍔', suggestedAmount: 50  },
    { id: 'transport', label: 'Transporte',   icon: '🚗', suggestedAmount: 30  },
    { id: 'home',      label: 'Casa / Hogar', icon: '🏠', suggestedAmount: 200 },
    { id: 'leisure',   label: 'Ocio',         icon: '🎮', suggestedAmount: 40  },
    { id: 'health',    label: 'Salud',        icon: '💊', suggestedAmount: 25  },
    { id: 'shopping',  label: 'Compras',      icon: '🛍️',suggestedAmount: 60  },
    { id: 'bills',     label: 'Facturas',     icon: '📄', suggestedAmount: 80  },
    { id: 'travel',    label: 'Viajes',       icon: '✈️', suggestedAmount: 150 },
    { id: 'education', label: 'Educación',    icon: '📚', suggestedAmount: 50  },
    { id: 'income',    label: 'Ingreso',      icon: '💰', suggestedAmount: 0   },
    { id: 'other',     label: 'Otros',        icon: '📦', suggestedAmount: 20  },
  ]
}
