/**
 * Paso 3 del onboarding: crear un grupo nuevo o unirse a uno existente.
 */

import { useState } from 'react'
import { motion }   from 'framer-motion'
import { Plus, Hash, Users, ChevronRight } from 'lucide-react'
import { useAuth }  from '../../hooks/useAuth'
import { useApp }   from '../../context/AppContext'

export default function GroupSetup() {
  const { firebaseUser } = useApp()
  const { createGroup, joinGroup, loading, error, setError } = useAuth()
  const [tab,       setTab]       = useState('create') // 'create' | 'join'
  const [groupName, setGroupName] = useState('')
  const [code,      setCode]      = useState('')

  async function handleCreate(e) {
    e.preventDefault()
    if (!groupName.trim()) { setError('Escribe un nombre para el grupo.'); return }
    setError(null)
    await createGroup(firebaseUser.uid, groupName.trim())
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (code.trim().length !== 6) { setError('El código tiene exactamente 6 caracteres.'); return }
    setError(null)
    await joinGroup(firebaseUser.uid, code.trim())
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Tu grupo</h2>
      <p className="text-slate-400 text-sm mb-5">Paso 3 de 3 — Crea un grupo o únete a uno</p>

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

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 rounded-xl p-1 mb-5">
        <button
          onClick={() => { setTab('create'); setError(null) }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'create'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Plus className="inline w-3.5 h-3.5 mr-1"/>
          Crear grupo
        </button>
        <button
          onClick={() => { setTab('join'); setError(null) }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'join'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Hash className="inline w-3.5 h-3.5 mr-1"/>
          Unirse
        </button>
      </div>

      {/* Crear grupo */}
      {tab === 'create' && (
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Nombre del grupo</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                required
                maxLength={40}
                placeholder="Ej: Piso de Unai, Familia García..."
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl
                           pl-10 pr-4 py-3 text-white placeholder-slate-500
                           focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30
                           transition-all text-sm"
              />
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-300">
            <p className="font-medium mb-1">📋 Código de invitación</p>
            <p className="text-blue-300/70">
              Al crear el grupo se generará un código de 6 caracteres. Compártelo con tus compañeros
              para que se unan.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !groupName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                       text-white font-semibold rounded-xl py-3 flex items-center justify-center
                       gap-2 transition-all"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <>Crear grupo <ChevronRight className="w-4 h-4"/></>
            }
          </button>
        </form>
      )}

      {/* Unirse a grupo */}
      {tab === 'join' && (
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Código del grupo</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              required
              maxLength={6}
              placeholder="XXXXXX"
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl
                         px-4 py-3 text-white placeholder-slate-500 text-center text-xl
                         tracking-[0.3em] font-mono uppercase
                         focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30
                         transition-all"
            />
          </div>

          <p className="text-sm text-slate-500 text-center">
            Pídele el código a quien creó el grupo
          </p>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50
                       text-white font-semibold rounded-xl py-3 flex items-center justify-center
                       gap-2 transition-all"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <>Unirme al grupo <ChevronRight className="w-4 h-4"/></>
            }
          </button>
        </form>
      )}
    </div>
  )
}
