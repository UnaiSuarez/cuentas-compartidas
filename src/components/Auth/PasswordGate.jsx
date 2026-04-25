import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, LogIn } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { AVATARS } from '../../assets/avatars'

/**
 * Pantalla de acceso con contraseña compartida.
 * Muestra los avatares animados flotando en el fondo.
 */
export default function PasswordGate() {
  const { login } = useApp()
  const [password, setPassword]     = useState('')
  const [showPass,  setShowPass]    = useState(false)
  const [error,     setError]       = useState(false)
  const [shaking,   setShaking]     = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const ok = login(password)
    if (!ok) {
      setError(true)
      setShaking(true)
      setTimeout(() => setShaking(false), 600)
      setTimeout(() => setError(false), 3000)
    }
  }

  // Posiciones fijas de los avatares decorativos
  const decorativeAvatars = [
    { index: 0, x: '8%',  y: '15%', delay: 0,   scale: 0.9 },
    { index: 2, x: '80%', y: '10%', delay: 0.5, scale: 1.1 },
    { index: 7, x: '15%', y: '70%', delay: 1,   scale: 0.8 },
    { index: 11,x: '75%', y: '65%', delay: 1.5, scale: 1.0 },
    { index: 5, x: '50%', y: '80%', delay: 0.8, scale: 0.7 },
    { index: 3, x: '88%', y: '40%', delay: 0.3, scale: 0.85},
  ]

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Gradiente de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-slate-950 to-emerald-950/30"/>

      {/* Avatares decorativos flotando */}
      {decorativeAvatars.map((av, i) => {
        const AvatarComp = AVATARS[av.index]
        return (
          <motion.div
            key={i}
            className="absolute opacity-20 pointer-events-none"
            style={{ left: av.x, top: av.y }}
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 3 + i * 0.4, delay: av.delay, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div style={{ transform: `scale(${av.scale})` }}>
              <AvatarComp state="normal" color="#2563eb" size={80}/>
            </div>
          </motion.div>
        )
      })}

      {/* Card de login */}
      <motion.div
        className="relative z-10 w-full max-w-sm mx-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.form
          onSubmit={handleSubmit}
          animate={shaking ? { x: [-10, 10, -10, 10, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-2xl p-8 shadow-2xl shadow-black/50"
        >
          {/* Logo / Título */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="text-blue-400" size={28}/>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Cuentas Compartidas</h1>
            <p className="text-slate-400 text-sm">Introduce la contraseña para acceder</p>
          </div>

          {/* Campo contraseña */}
          <div className="relative mb-4">
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña de acceso"
              autoFocus
              className={`w-full bg-slate-800/60 border rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500
                         focus:outline-none focus:ring-2 transition-all
                         ${error
                           ? 'border-red-500/60 focus:ring-red-500/30'
                           : 'border-slate-700/60 focus:ring-blue-500/40 focus:border-blue-500/60'
                         }`}
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-sm text-center mb-4"
              >
                Contraseña incorrecta. Inténtalo de nuevo.
              </motion.p>
            )}
          </AnimatePresence>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl
                       flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <LogIn size={18}/>
            Entrar
          </button>
        </motion.form>
      </motion.div>
    </div>
  )
}
