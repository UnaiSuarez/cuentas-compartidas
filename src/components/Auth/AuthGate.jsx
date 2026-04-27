import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence }     from 'framer-motion'
import { animate, stagger }            from 'animejs'
import { useApp }                      from '../../context/AppContext'
import AppLogo                         from '../../assets/AppLogo'
import SignIn                          from './SignIn'
import SignUp                          from './SignUp'
import ProfileSetup                    from './ProfileSetup'

const slideVariants = {
  enter:  { x: 60, opacity: 0 },
  center: { x: 0,  opacity: 1 },
  exit:   { x: -60, opacity: 0 },
}

/** Monedas flotantes de fondo */
function FloatingCoins() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const symbols  = ['€', '€', '$', '£', '€']
    const coins = Array.from({ length: 18 }, (_, i) => {
      const el   = document.createElement('div')
      const size = 14 + Math.random() * 14
      el.textContent = symbols[Math.floor(Math.random() * symbols.length)]
      Object.assign(el.style, {
        position:    'absolute',
        fontSize:    `${size}px`,
        fontWeight:  'bold',
        color:       i % 3 === 0 ? 'rgba(37,99,235,0.25)' : i % 3 === 1 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
        left:        `${Math.random() * 100}%`,
        top:         `${60 + Math.random() * 60}%`,
        userSelect:  'none',
        pointerEvents: 'none',
      })
      container.appendChild(el)
      return el
    })

    coins.forEach((coin, i) => {
      const startTop = 60 + Math.random() * 60
      animate(coin, {
        translateY: [0, -(window.innerHeight * 0.9)],
        opacity:    [0.6, 0],
        duration:   3500 + Math.random() * 3000,
        delay:      i * 280,
        easing:     'linear',
        loop:       true,
      })
    })

    return () => coins.forEach(c => { try { c.remove() } catch (_) {} })
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    />
  )
}

export default function AuthGate() {
  const { firebaseUser, userProfile } = useApp()
  const [mode, setMode] = useState('signin')

  const step = !firebaseUser ? 'auth' : !userProfile?.name ? 'profile' : null

  // Animación del logo al montar (solo escala — framer-motion maneja el fade del contenedor)
  const logoRef = useRef(null)
  useEffect(() => {
    if (!logoRef.current) return
    animate(logoRef.current, {
      scale:    [0.6, 1],
      duration: 700,
      easing:   'easeOutExpo',
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950
                    flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo: halos de luz */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"/>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"/>
      </div>

      {/* Monedas flotantes */}
      <FloatingCoins/>

      <div className="relative w-full max-w-md z-10">
        {/* Logo animado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div ref={logoRef} className="inline-block">
            <AppLogo size={64}/>
          </div>
          <h1 className="text-2xl font-bold text-white mt-3 tracking-tight">Cuentas Compartidas</h1>
          <p className="text-slate-400 text-sm mt-1">Gastos sin dramas</p>
        </motion.div>

        {step === 'profile' && (
          <div className="flex justify-center gap-2 mb-6">
            {['auth', 'profile'].map((s, i) => (
              <div
                key={s}
                className="h-1.5 w-8 rounded-full bg-blue-500"
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
