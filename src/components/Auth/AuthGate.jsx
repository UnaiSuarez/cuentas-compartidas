/**
 * Punto de entrada de autenticación.
 * Orquesta los pasos del onboarding:
 *   1. SignIn/SignUp
 *   2. Completar perfil (nombre + avatar)
 *   3. Crear grupo o unirse a uno con código
 *
 * Si el usuario ya está autenticado y tiene grupo, redirige directamente al dashboard.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import SignIn    from './SignIn'
import SignUp    from './SignUp'
import ProfileSetup from './ProfileSetup'
import GroupSetup   from './GroupSetup'

// Pasos del flujo de onboarding
const STEPS = {
  AUTH:    'auth',    // Login o registro
  PROFILE: 'profile', // Nombre + avatar
  GROUP:   'group',   // Crear o unirse a grupo
}

export default function AuthGate() {
  const { firebaseUser, userProfile } = useApp()
  const [mode, setMode]   = useState('signin') // 'signin' | 'signup'
  const [step, setStep]   = useState(STEPS.AUTH)

  // Decide el paso actual basándose en el estado del usuario
  const currentStep = (() => {
    if (!firebaseUser)                          return STEPS.AUTH
    if (!userProfile?.name)                     return STEPS.PROFILE
    if (!userProfile?.groupId)                  return STEPS.GROUP
    return null // usuario completo → App lo redirigirá al dashboard
  })()

  const slideVariants = {
    enter:  { x: 60, opacity: 0 },
    center: { x: 0,  opacity: 1 },
    exit:   { x: -60, opacity: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950
                    flex items-center justify-center p-4">

      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"/>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"/>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <span className="text-5xl">💰</span>
          <h1 className="text-2xl font-bold text-white mt-3">Cuentas Compartidas</h1>
          <p className="text-slate-400 text-sm mt-1">Gastos sin dramas</p>
        </motion.div>

        {/* Indicador de pasos */}
        {currentStep !== STEPS.AUTH && (
          <div className="flex justify-center gap-2 mb-6">
            {[STEPS.AUTH, STEPS.PROFILE, STEPS.GROUP].map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === 0
                    ? 'w-8 bg-blue-500'
                    : currentStep === STEPS.PROFILE && i === 1
                    ? 'w-8 bg-blue-500'
                    : currentStep === STEPS.GROUP && i <= 2
                    ? 'w-8 bg-blue-500'
                    : 'w-4 bg-slate-700'
                }`}
              />
            ))}
          </div>
        )}

        {/* Panel principal */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep || 'done'}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/60
                       rounded-2xl p-6 shadow-2xl"
          >
            {currentStep === STEPS.AUTH && (
              mode === 'signin'
                ? <SignIn  onSwitch={() => setMode('signup')} />
                : <SignUp  onSwitch={() => setMode('signin')} />
            )}

            {currentStep === STEPS.PROFILE && (
              <ProfileSetup />
            )}

            {currentStep === STEPS.GROUP && (
              <GroupSetup />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
