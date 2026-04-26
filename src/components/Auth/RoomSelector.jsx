import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Hash, LogIn, Users, Crown, ChevronRight, ArrowLeft } from 'lucide-react'
import { useApp }  from '../../context/AppContext'
import { useAuth } from '../../hooks/useAuth'

export default function RoomSelector() {
  const { userProfile, userRooms, switchActiveGroup } = useApp()
  const { createGroup, joinGroup, loading, error, setError } = useAuth()

  const [panel,     setPanel]     = useState('list')   // 'list' | 'create' | 'join'
  const [groupName, setGroupName] = useState('')
  const [code,      setCode]      = useState('')

  function openPanel(p) { setPanel(p); setError(null); setGroupName(''); setCode('') }

  async function handleCreate(e) {
    e.preventDefault()
    if (!groupName.trim()) { setError('Escribe un nombre para la sala.'); return }
    await createGroup(userProfile.uid || userProfile.id, groupName.trim())
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (code.length !== 6) { setError('El código tiene exactamente 6 caracteres.'); return }
    await joinGroup(userProfile.uid || userProfile.id, code.trim())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950
                    flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"/>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"/>
      </div>

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <span className="text-4xl">🏠</span>
          <h1 className="text-xl font-bold text-white mt-2">Mis Salas</h1>
          <p className="text-slate-400 text-sm">Hola, {userProfile?.name} · Elige una sala</p>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* Lista de salas */}
          {panel === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {userRooms.length === 0 && (
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/60
                                rounded-2xl p-8 text-center">
                  <p className="text-slate-400 text-sm mb-1">Todavía no perteneces a ninguna sala.</p>
                  <p className="text-slate-500 text-xs">Crea una nueva o únete con un código.</p>
                </div>
              )}

              {userRooms.map((room, i) => (
                <motion.button
                  key={room.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => switchActiveGroup(room.id)}
                  className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/60
                             rounded-2xl p-4 flex items-center gap-4 hover:border-blue-500/40
                             hover:bg-slate-800/60 transition-all group text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center
                                  group-hover:bg-blue-600/30 transition-all">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold truncate">{room.name}</p>
                      {room.createdBy === (userProfile?.id || userProfile?.uid) && (
                        <Crown size={12} className="text-amber-400 shrink-0"/>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <Users size={10}/> {room.memberCount} miembro{room.memberCount !== 1 ? 's' : ''}
                      </span>
                      <span className="text-slate-600 text-xs font-mono">{room.code}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-600 group-hover:text-blue-400 transition-colors shrink-0"/>
                </motion.button>
              ))}

              {/* Botones de acción */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => openPanel('create')}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                             bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all"
                >
                  <Plus size={16}/> Crear sala
                </button>
                <button
                  onClick={() => openPanel('join')}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                             bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium transition-all"
                >
                  <Hash size={16}/> Unirse
                </button>
              </div>
            </motion.div>
          )}

          {/* Crear sala */}
          {panel === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6"
            >
              <button
                onClick={() => openPanel('list')}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-5 transition-colors"
              >
                <ArrowLeft size={14}/> Volver
              </button>
              <h2 className="text-white font-bold text-lg mb-4">Crear nueva sala</h2>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm
                                rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Nombre de la sala</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    required
                    maxLength={40}
                    placeholder="Ej: Piso de Unai, Familia…"
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl
                               px-4 py-3 text-white placeholder-slate-500 text-sm
                               focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  />
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-300">
                  Se generará un código de 6 caracteres para invitar a tus compañeros.
                </div>
                <button
                  type="submit"
                  disabled={loading || !groupName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                             text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all"
                >
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    : <><Plus size={16}/> Crear sala</>
                  }
                </button>
              </form>
            </motion.div>
          )}

          {/* Unirse */}
          {panel === 'join' && (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6"
            >
              <button
                onClick={() => openPanel('list')}
                className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm mb-5 transition-colors"
              >
                <ArrowLeft size={14}/> Volver
              </button>
              <h2 className="text-white font-bold text-lg mb-4">Unirse a una sala</h2>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm
                                rounded-lg px-4 py-3 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Código de la sala</label>
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
                               focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50
                             text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-all"
                >
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    : <><LogIn size={16}/> Unirme</>
                  }
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
