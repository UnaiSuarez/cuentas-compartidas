/**
 * Paso 2 del onboarding: el usuario elige su nombre y avatar.
 * Se guarda directamente en Firestore /users/{uid}.
 */

import { useState }           from 'react'
import { motion }             from 'framer-motion'
import { User, ChevronRight } from 'lucide-react'
import { useAuth }            from '../../hooks/useAuth'
import { useApp }             from '../../context/AppContext'
import { AVATARS, AVATAR_COLORS } from '../../assets/avatars'

export default function ProfileSetup() {
  const { firebaseUser, updateUserProfile } = useApp()
  const { completeProfile, loading, error, setError } = useAuth()
  const [name,      setName]      = useState('')
  const [selected,  setSelected]  = useState(0)   // índice del avatar seleccionado
  const [colorIdx,  setColorIdx]  = useState(0)

  const color = AVATAR_COLORS[colorIdx]

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Escribe tu nombre.'); return }
    setError(null)

    const avatarKey = `avatar${selected}`
    await completeProfile(firebaseUser.uid, name.trim(), avatarKey, color)
    // AppContext.updateUserProfile sincroniza el estado
    await updateUserProfile({ name: name.trim(), avatar: avatarKey, color })
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Tu perfil</h2>
      <p className="text-slate-400 text-sm mb-6">Paso 2 de 3 — ¿Cómo te llamas y qué avatar eliges?</p>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 text-red-400
                     text-sm rounded-lg px-4 py-3 mb-4"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Tu nombre</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              maxLength={30}
              placeholder="Ej: Unai, Nelly, Alex..."
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl
                         pl-10 pr-4 py-3 text-white placeholder-slate-500
                         focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30
                         transition-all text-sm"
            />
          </div>
        </div>

        {/* Preview del avatar seleccionado */}
        <div className="flex justify-center">
          <motion.div
            key={`${selected}-${colorIdx}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/40"
          >
            {(() => {
              const Av = AVATARS[selected]
              return <Av state="happy" color={color} size={96} />
            })()}
          </motion.div>
        </div>

        {/* Selector de avatares */}
        <div>
          <p className="text-sm text-slate-400 mb-2">Elige tu avatar</p>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((Av, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                className={`p-1.5 rounded-xl transition-all ${
                  selected === i
                    ? 'bg-blue-600/30 border-2 border-blue-500 scale-105'
                    : 'bg-slate-800/40 border-2 border-transparent hover:border-slate-600'
                }`}
              >
                <Av state={selected === i ? 'happy' : 'normal'} color={color} size={36} />
              </button>
            ))}
          </div>
        </div>

        {/* Selector de color */}
        <div>
          <p className="text-sm text-slate-400 mb-2">Color de acento</p>
          <div className="flex gap-2 flex-wrap">
            {AVATAR_COLORS.map((c, i) => (
              <button
                key={c}
                type="button"
                onClick={() => setColorIdx(i)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  colorIdx === i ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                     text-white font-semibold rounded-xl py-3 flex items-center justify-center
                     gap-2 transition-all"
        >
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            : <>Siguiente <ChevronRight className="w-4 h-4"/></>
          }
        </button>
      </form>
    </div>
  )
}
