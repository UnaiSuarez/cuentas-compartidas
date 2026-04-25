/**
 * Página de ajustes del grupo.
 *
 * Permite:
 * - Ver el código de invitación del grupo (para compartirlo)
 * - Editar el nombre y avatar del usuario actual
 * - Ver y editar categorías
 * - Ver la lista de miembros
 * - Toggle dark/light mode
 */

import { useState }      from 'react'
import { motion }        from 'framer-motion'
import {
  Copy, Check, Moon, Sun, Users, Tag, User,
} from 'lucide-react'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db }            from '../../config/firebase'
import { useApp }        from '../../context/AppContext'
import { getAvatarByKey, AVATARS, AVATAR_COLORS } from '../../assets/avatars'

export default function SettingsPage() {
  const {
    userProfile, groupMembers, groupId,
    darkMode, toggleDarkMode, updateUserProfile,
  } = useApp()
  const [code,      setCode]      = useState(null)
  const [copied,    setCopied]    = useState(false)
  const [editName,  setEditName]  = useState('')
  const [editingProfile, setEditingProfile] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [selectedColor,  setSelectedColor]  = useState(0)
  const [saving,    setSaving]    = useState(false)

  async function loadCode() {
    if (code || !groupId) return
    const snap = await getDoc(doc(db, 'groups', groupId))
    if (snap.exists()) setCode(snap.data().code)
  }

  async function copyCode() {
    if (!code) return
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function openEditProfile() {
    const idx = parseInt(userProfile?.avatar?.replace('avatar', '') || '0', 10)
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
      const newData = {
        name:   editName.trim(),
        avatar: `avatar${selectedAvatar}`,
        color:  AVATAR_COLORS[selectedColor],
      }
      await updateUserProfile(newData)
      setEditingProfile(false)
    } finally {
      setSaving(false)
    }
  }

  const MyAvatar = getAvatarByKey(userProfile?.avatar)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Ajustes</h2>

      {/* ── Mi perfil ────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Mi perfil</p>
        {!editingProfile ? (
          <div className="flex items-center gap-4">
            {MyAvatar && (
              <MyAvatar state="happy" color={userProfile?.color || '#2563eb'} size={64}/>
            )}
            <div className="flex-1">
              <p className="text-white font-semibold">{userProfile?.name}</p>
              <p className="text-slate-400 text-sm">{userProfile?.email}</p>
            </div>
            <button
              onClick={openEditProfile}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300
                         rounded-lg text-sm transition-all"
            >
              Editar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="Tu nombre"
              maxLength={30}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl
                         px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
            {/* Preview */}
            <div className="flex justify-center">
              {(() => {
                const Av = AVATARS[selectedAvatar]
                return <Av state="happy" color={AVATAR_COLORS[selectedColor]} size={72}/>
              })()}
            </div>
            {/* Grid de avatares */}
            <div className="grid grid-cols-6 gap-1.5">
              {AVATARS.map((Av, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedAvatar(i)}
                  className={`p-1 rounded-xl transition-all ${
                    selectedAvatar === i
                      ? 'ring-2 ring-blue-500 bg-blue-500/10'
                      : 'hover:bg-slate-700'
                  }`}
                >
                  <Av state="normal" color={AVATAR_COLORS[selectedColor]} size={36}/>
                </button>
              ))}
            </div>
            {/* Colores */}
            <div className="flex gap-2 flex-wrap">
              {AVATAR_COLORS.map((c, i) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(i)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    selectedColor === i ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveProfile}
                disabled={saving || !editName.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                           text-white py-2.5 rounded-xl text-sm font-medium transition-all"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
              <button
                onClick={() => setEditingProfile(false)}
                className="px-4 bg-slate-700 hover:bg-slate-600 text-slate-300
                           py-2.5 rounded-xl text-sm transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Código del grupo ─────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={15} className="text-slate-400"/>
          <p className="text-slate-400 text-xs uppercase tracking-wider">Código del grupo</p>
        </div>
        {code ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-mono font-bold text-white tracking-[0.3em]">{code}</p>
            </div>
            <button
              onClick={copyCode}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                         ${copied
                           ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                           : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                         }`}
            >
              {copied ? <><Check size={14}/> ¡Copiado!</> : <><Copy size={14}/> Copiar</>}
            </button>
          </div>
        ) : (
          <button
            onClick={loadCode}
            className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300
                       rounded-xl text-sm transition-all"
          >
            Ver código de invitación
          </button>
        )}
        <p className="text-xs text-slate-600 mt-2">
          Comparte este código para que otros se unan al grupo.
        </p>
      </div>

      {/* ── Miembros ─────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={15} className="text-slate-400"/>
          <p className="text-slate-400 text-xs uppercase tracking-wider">
            Miembros ({groupMembers.length})
          </p>
        </div>
        <div className="space-y-2">
          {groupMembers.map(m => {
            const Av   = getAvatarByKey(m.avatar)
            const isMe = m.id === userProfile?.id
            return (
              <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/40">
                <Av state="normal" color={m.color || '#2563eb'} size={36}/>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">
                    {m.name} {isMe && <span className="text-blue-400 text-xs">(tú)</span>}
                  </p>
                  <p className="text-slate-500 text-xs">{m.email}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Tema ─────────────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl p-5">
        <p className="text-slate-400 text-xs uppercase tracking-wider mb-4">Apariencia</p>
        <button
          onClick={toggleDarkMode}
          className="flex items-center gap-3 w-full px-4 py-3 bg-slate-800/60 rounded-xl
                     text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
        >
          {darkMode ? <Moon size={18}/> : <Sun size={18}/>}
          <span className="text-sm">{darkMode ? 'Modo Oscuro (activo)' : 'Modo Claro (activo)'}</span>
        </button>
      </div>

      {/* ── Info de la app ────────────────────────────────────────────────── */}
      <div className="text-center py-4">
        <p className="text-slate-600 text-xs">Cuentas Compartidas v1.0</p>
        <p className="text-slate-700 text-xs mt-0.5">Hecho con 💙 · Firebase + React + Vercel</p>
      </div>
    </div>
  )
}
