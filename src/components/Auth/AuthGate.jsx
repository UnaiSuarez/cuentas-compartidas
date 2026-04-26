import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp }       from '../../context/AppContext'
import SignIn           from './SignIn'
import SignUp           from './SignUp'
import ProfileSetup     from './ProfileSetup'

const slideVariants = {
  enter:  { x: 60, opacity: 0 },
  center: { x: 0,  opacity: 1 },
  exit:   { x: -60, opacity: 0 },
}

export default function AuthGate() {
  const { firebaseUser, userProfile } = useApp()
  const [mode, setMode] = useState('signin')

  const step = !firebaseUser ? 'auth' : !userProfile?.name ? 'profile' : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950
                    flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"/>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"/>
      </div>

      <div className="relative w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <span className="text-5xl">💰</span>
          <h1 className="text-2xl font-bold text-white mt-3">Cuentas Compartidas</h1>
          <p className="text-slate-400 text-sm mt-1">Gastos sin dramas</p>
        </motion.div>

        {step === 'profile' && (
          <div className="flex justify-center gap-2 mb-6">
            {['auth', 'profile'].map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === 0 ? 'w-8 bg-blue-500' : 'w-8 bg-blue-500'
                }`}
              />
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/60
                       rounded-2xl p-6 shadow-2xl"
          >
            {step === 'auth' && (
              mode === 'signin'
                ? <SignIn  onSwitch={() => setMode('signup')} />
                : <SignUp  onSwitch={() => setMode('signin')} />
            )}
            {step === 'profile' && <ProfileSetup />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
