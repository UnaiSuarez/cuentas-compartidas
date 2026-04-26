import { useState }      from 'react'
import { motion }        from 'framer-motion'
import {
  Copy, Check, Moon, Sun, Users, Tag, User,
  Crown, LogOut, Trash2, Plus, X, Save, ChevronRight,
} from 'lucide-react'
import { useApp }        from '../../context/AppContext'
import { useAuth }       from '../../hooks/useAuth'
import { getAvatarByKey, AVATARS, AVATAR_COLORS } from '../../assets/avatars'

export default function SettingsPage() {
  const {
    userProfile, groupMembers, groupId, groupInfo,
    darkMode, toggleDarkMode, updateUserProfile,
    updateGroupCategories, updateGroupName,
    isAdmin, clearActiveGroup, categories,
  } = useApp()
  const { leaveGroup, removeMember, loading: authLoading } = useAuth()

  const [copied,         setCopied]         = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editName,       setEditName]       = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [selectedColor,  setSelectedColor]  = useState(0)
  const [saving,         setSaving]         = useState(false)

  const [editingGroupName, setEditingGroupName] = useState(false)
  const [newGroupName,     setNewGroupName]     = useState('')

  const [editingCats, setEditingCats] = useState(false)
  const [catList,     setCatList]     = useState([])
  const [savingCats,  setSavingCats]  = useState(false)

  const [confirmLeave,  setConfirmLeave]  = useState(false)
  const [removingId,    setRemovingId]    = useState(null)

  const uid = userProfile?.id

  async function copyCode() {
    if (!groupInfo?.code) return
    await navigator.clipboard.writeText(groupInfo.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function openEditProfile() {
    const idx      = parseInt(userProfile?.avatar?.replace('avatar', '') || '0', 10)
    const colorIdx = AVATAR_COLORS.indexOf(userProfile?.color || '#2563eb')
    setEditName(userProfile?.name || '')
    setSelectedAvatar(isNaN(idx) ? 0 : idx)
    setSelectedColor(colorIdx >= 0 ? colorIdx : 0)
    setEditingProfile(true)
  }

  async function saveProfile() {
    if (!editName.trim()) return
    setSaving(true)
    try {
      await updateUserProfile({
        name:   editName.trim(),
        avatar: `avatar${selectedAvatar}`,
        color:  AVATAR_COLORS[selectedColor],
      })
      setEditingProfile(false)
    } finally {
      setSaving(false)
    }
  }

  function openEditCats() {
    setCatList(categories.map(c => ({ ...c })))
    setEditingCats(true)
  }

  function updateCat(i, field, value) {
    setCatList(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
  }

  function addCat() {
    setCatList(prev => [...prev, {
      id:              `cat_${Date.now()}`,
      label:           'Nueva',
      icon:            '📦',
      suggestedAmount: 0,
    }])
  }

  function removeCat(i) {
    if (catList.length <= 1) return
    setCatList(prev => prev.filter((_, idx) => idx !== i))
  }

  async function saveCats() {
    setSavingCats(true)
    try {
      await updateGroupCategories(catList)
      setEditingCats(false)
    } finally {
      setSavingCats(false)
    }
  }

  async function handleLeave() {
    try {
      await leaveGroup(uid, groupId)
      clearActiveGroup()
    } catch (_) {}
    setConfirmLeave(false)
  }

  async function handleRemove(targetId) {
    setRemovingId(targetId)
    try {
      await removeMember(uid, targetId, groupId)
    } catch (_) {}
    setRemovingId(null)
  }

  async function saveGroupName() {
    if (!newGroupName.trim()) return
    await updateGroupName(newGroupName.trim())
    setEditingGroupName(false)
  }

  const MyAvatar = getAvatarByKey(userProfile?.avatar)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Ajustes</h2>

      {/* ── Mi perfil ─────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Mi perfil</p>
        {!editingProfile ? (
          <div className="flex items-center gap-4">
            {MyAvatar && <MyAvatar state="happy" color={userProfile?.color || '#2563eb'} size={64}/>}
            <div className="flex-1">
              <p className="text-white font-semibold">{userProfile?.name}</p>
              <p className="text-slate-400 text-sm">{userProfile?.email}</p>
            </div>
            <button
              onClick={openEditProfile}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-all"
            >
              Editar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text" value={editName} onChange={e => setEditName(e.target.value)}
              placeholder="Tu nombre" maxLength={30}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5
                         text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            <div className="flex justify-center">
              {(() => { const Av = AVATARS[selectedAvatar]; return <Av state="happy" color={AVATAR_COLORS[selectedColor]} size={72}/> })()}
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {AVATARS.map((Av, i) => (
                <button key={i} type="button" onClick={() => setSelectedAvatar(i)}
                  className={`p-1 rounded-xl transition-all ${selectedAvatar === i ? 'ring-2 ring-blue-500 bg-blue-500/10' : 'hover:bg-slate-700'}`}>
                  <Av state="normal" color={AVATAR_COLORS[selectedColor]} size={36}/>
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((c, i) => (
                <button key={c} onClick={() => setSelectedColor(i)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor === i ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}/>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={saveProfile} disabled={saving || !editName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-all">
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
              <button onClick={() => setEditingProfile(false)}
                className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 py-2.5 rounded-xl text-sm transition-all">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Sala activa ───────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-slate-400"/>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Sala</p>
          </div>
          {isAdmin && (
            <span className="flex items-center gap-1 text-amber-400 text-xs">
              <Crown size={12}/> Admin
            </span>
          )}
        </div>

        {/* Nombre del grupo */}
        <div className="mb-4">
          {!editingGroupName ? (
            <div className="flex items-center gap-3">
              <p className="text-white font-semibold text-lg flex-1">{groupInfo?.name}</p>
              {isAdmin && (
                <button onClick={() => { setNewGroupName(groupInfo?.name || ''); setEditingGroupName(true) }}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 bg-slate-700 rounded-lg transition-all">
                  Renombrar
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} maxLength={40}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <button onClick={saveGroupName} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm transition-all">
                <Save size={14}/>
              </button>
              <button onClick={() => setEditingGroupName(false)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl text-sm transition-all">
                <X size={14}/>
              </button>
            </div>
          )}
        </div>

        {/* Código de invitación */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 bg-slate-800 rounded-xl px-4 py-2.5 text-center">
            <p className="text-xl font-mono font-bold text-white tracking-[0.3em]">{groupInfo?.code || '…'}</p>
          </div>
          <button
            onClick={copyCode}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                       ${copied ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
          >
            {copied ? <><Check size={14}/> Copiado</> : <><Copy size={14}/> Copiar</>}
          </button>
        </div>
        <p className="text-xs text-slate-600">Comparte este código para invitar a otros miembros.</p>
      </div>

      {/* ── Miembros ──────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">
          Miembros ({groupMembers.length})
        </p>
        <div className="space-y-2">
          {groupMembers.map(m => {
            const Av    = getAvatarByKey(m.avatar)
            const isMe  = m.id === uid
            const mIsAdmin = m.id === groupInfo?.createdBy
            return (
              <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40">
                <Av state="normal" color={m.color || '#2563eb'} size={36}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-white text-sm font-medium truncate">{m.name}</p>
                    {isMe   && <span className="text-blue-400 text-xs shrink-0">(tú)</span>}
                    {mIsAdmin && <Crown size={11} className="text-amber-400 shrink-0"/>}
                  </div>
                  <p className="text-slate-500 text-xs truncate">{m.email}</p>
                </div>
                {isAdmin && !isMe && (
                  <button
                    onClick={() => handleRemove(m.id)}
                    disabled={removingId === m.id || authLoading}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10
                               transition-all disabled:opacity-40"
                    title="Expulsar miembro"
                  >
                    {removingId === m.id
                      ? <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"/>
                      : <Trash2 size={14}/>
                    }
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Categorías ────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag size={15} className="text-slate-400"/>
            <p className="text-slate-400 text-xs uppercase tracking-wider">Categorías</p>
          </div>
          {!editingCats && (
            <button onClick={openEditCats}
              className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-all">
              Editar
            </button>
          )}
        </div>

        {!editingCats ? (
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <span key={c.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 rounded-lg text-sm text-slate-300">
                <span>{c.icon}</span>
                <span>{c.label}</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {catList.map((c, i) => (
              <div key={c.id} className="flex items-center gap-2">
                <input
                  type="text" value={c.icon} onChange={e => updateCat(i, 'icon', e.target.value)}
                  maxLength={4} placeholder="🏠"
                  className="w-12 bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-center text-sm text-white
                             focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                />
                <input
                  type="text" value={c.label} onChange={e => updateCat(i, 'label', e.target.value)}
                  maxLength={20} placeholder="Nombre"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white
                             focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                />
                <input
                  type="number" value={c.suggestedAmount} onChange={e => updateCat(i, 'suggestedAmount', parseFloat(e.target.value) || 0)}
                  min="0" placeholder="€"
                  className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm text-white text-center
                             focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                />
                <button onClick={() => removeCat(i)} disabled={catList.length <= 1}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-30">
                  <X size={14}/>
                </button>
              </div>
            ))}
            <button onClick={addCat}
              className="w-full py-2 rounded-lg border border-dashed border-slate-600 text-slate-400
                         hover:border-blue-500/40 hover:text-blue-400 text-sm flex items-center justify-center gap-1.5 transition-all">
              <Plus size={14}/> Añadir categoría
            </button>
            <div className="flex gap-2 mt-3">
              <button onClick={saveCats} disabled={savingCats}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2">
                {savingCats ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Save size={14}/> Guardar</>}
              </button>
              <button onClick={() => setEditingCats(false)}
                className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 py-2.5 rounded-xl text-sm transition-all">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Apariencia ────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Apariencia</p>
        <button onClick={toggleDarkMode}
          className="flex items-center gap-3 w-full px-4 py-3 bg-slate-800/60 rounded-xl
                     text-slate-300 hover:text-white hover:bg-slate-700 transition-all">
          {darkMode ? <Moon size={18}/> : <Sun size={18}/>}
          <span className="text-sm">{darkMode ? 'Modo Oscuro (activo)' : 'Modo Claro (activo)'}</span>
        </button>
      </div>

      {/* ── Cambiar de sala ───────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Sala activa</p>
        <div className="space-y-2">
          <button
            onClick={clearActiveGroup}
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/60 rounded-xl
                       text-slate-300 hover:text-white hover:bg-slate-700 transition-all text-sm"
          >
            <ChevronRight size={16}/> Cambiar de sala
          </button>
          {!confirmLeave ? (
            <button
              onClick={() => setConfirmLeave(true)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 rounded-xl
                         text-red-400 hover:bg-red-500/20 transition-all text-sm"
            >
              <LogOut size={16}/> Abandonar esta sala
            </button>
          ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-300 text-sm mb-3">
                ¿Seguro que quieres abandonar «{groupInfo?.name}»?
                {isAdmin && groupMembers.length > 1 && (
                  <span className="block text-red-400/70 text-xs mt-1">
                    Eres el admin. El rol pasará al siguiente miembro.
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleLeave}
                  disabled={authLoading}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-all"
                >
                  {authLoading ? 'Saliendo…' : 'Sí, abandonar'}
                </button>
                <button onClick={() => setConfirmLeave(false)}
                  className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 py-2 rounded-lg text-sm transition-all">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center py-4">
        <p className="text-slate-600 text-xs">Cuentas Compartidas v2.0</p>
        <p className="text-slate-700 text-xs mt-0.5">Hecho con 💙 · Firebase + React + Vercel</p>
      </div>
    </div>
  )
}
