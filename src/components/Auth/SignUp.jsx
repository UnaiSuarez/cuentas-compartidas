/**
 * Formulario de registro. Solo crea la cuenta Firebase Auth.
 * El perfil (nombre, avatar) y el grupo se configuran en los pasos siguientes.
 */

import { useState } from 'react'
import { motion }   from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react'
import { useAuth }  from '../../hooks/useAuth'

export default function SignUp({ onSwitch }) {
  const { signUp, loading, error, setError } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPwd,  setShowPwd]  = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    await signUp(email.trim(), password)
    // AppContext detectará el nuevo usuario vía onAuthStateChanged
    // y mostrará el paso PROFILE automáticamente
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Crear cuenta</h2>
      <p className="text-slate-400 text-sm mb-6">Paso 1 de 3 — Cuenta Firebase</p>

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Correo electrónico</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="tu@correo.com"
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl
                         pl-10 pr-4 py-3 text-white placeholder-slate-500
                         focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30
                         transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl
                         pl-10 pr-10 py-3 text-white placeholder-slate-500
                         focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30
                         transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPwd(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              {showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Confirmar contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type={showPwd ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder="Repite la contraseña"
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl
                         pl-10 pr-4 py-3 text-white placeholder-slate-500
                         focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30
                         transition-all text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                     text-white font-semibold rounded-xl py-3 flex items-center justify-center
                     gap-2 transition-all"
        >
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            : <><UserPlus className="w-4 h-4"/> Crear cuenta</>
          }
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <button
          onClick={onSwitch}
          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          Iniciar sesión
        </button>
      </p>
    </div>
  )
}
