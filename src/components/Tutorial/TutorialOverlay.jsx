import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const PAD = 10         // px de holgura alrededor del elemento
const TOOLTIP_W = 310  // ancho del tooltip (px)
const TOOLTIP_H = 210  // alto aprox. del tooltip (px)

const STEPS = [
  {
    route: '/',
    selector: null,
    emoji: '👋',
    title: '¡Bienvenido/a!',
    desc: 'La app para gestionar gastos con tu piso o grupo sin dramas. Te hacemos un recorrido rápido por las partes principales.',
  },
  {
    route: '/',
    selector: '[data-tutorial="my-balance"]',
    emoji: '💰',
    title: 'Tu saldo personal',
    desc: 'Aquí ves tu saldo neto real: el dinero "limpio" que ya está confirmado. Si alguien te debe, aparece desglosado en ámbar justo debajo.',
  },
  {
    route: '/transacciones',
    selector: '[data-tutorial="new-transaction"]',
    emoji: '📝',
    title: 'Registra un gasto',
    desc: 'Pulsa este botón para añadir un gasto o ingreso. Elige quién pagó, entre quiénes se divide y la categoría. El modo "Gasto Común" es para el bote del piso.',
  },
  {
    route: '/liquidacion',
    selector: '[data-tutorial="optimal-payments"]',
    emoji: '⚖️',
    title: 'Saldar deudas',
    desc: 'El algoritmo calcula los pagos mínimos para saldar todas las deudas. Pulsa "He pagado" para notificar al acreedor — él confirmará y la deuda desaparecerá.',
  },
  {
    route: '/estadisticas',
    selector: '[data-tutorial="view-toggle"]',
    emoji: '📊',
    title: 'Mis datos vs Del grupo',
    desc: 'Alterna entre ver tu parte proporcional de los gastos o los datos del grupo completo. Los gráficos y totales se adaptan al instante.',
  },
  {
    route: '/',
    selector: null,
    emoji: '🎉',
    title: '¡Ya lo tienes todo!',
    desc: 'Ahora conoces lo esencial. Empieza añadiendo tu primer gasto desde la pestaña Transacciones.',
  },
]

export default function TutorialOverlay({ onDone }) {
  const navigate    = useNavigate()
  const [step, setStep]           = useState(0)
  const [targetRect, setTargetRect] = useState(null)

  const current = STEPS[step]
  const isFirst = step === 0
  const isLast  = step === STEPS.length - 1

  // Mide el elemento objetivo y actualiza targetRect
  const measure = useCallback(() => {
    if (!current.selector) { setTargetRect(null); return }
    const el = document.querySelector(current.selector)
    if (!el) return
    const r = el.getBoundingClientRect()
    setTargetRect({
      top:    r.top    - PAD,
      left:   r.left   - PAD,
      width:  r.width  + PAD * 2,
      height: r.height + PAD * 2,
    })
  }, [current.selector])

  // Al cambiar de paso: navega y programa la medición
  useEffect(() => {
    setTargetRect(null)
    navigate(current.route)
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  // Busca el elemento después de que la ruta/render se asiente
  useEffect(() => {
    if (!current.selector) return
    const t = setTimeout(() => {
      const el = document.querySelector(current.selector)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(measure, 350)
      }
    }, 420)
    return () => clearTimeout(t)
  }, [step, current.selector, measure])

  // Re-mide al hacer scroll o resize
  useEffect(() => {
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  // Calcula posición del tooltip
  const tooltipPos = (() => {
    if (!targetRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }
    }
    const GAP    = 14
    const winW   = window.innerWidth
    const winH   = window.innerHeight
    const centerX = targetRect.left + targetRect.width / 2
    const left   = Math.max(10, Math.min(centerX - TOOLTIP_W / 2, winW - TOOLTIP_W - 10))
    const below  = winH - targetRect.top - targetRect.height
    const above  = targetRect.top

    if (below >= TOOLTIP_H + GAP || below >= above) {
      return { top: targetRect.top + targetRect.height + GAP, left }
    }
    return { top: Math.max(8, targetRect.top - TOOLTIP_H - GAP), left }
  })()

  const next = () => isLast ? onDone() : setStep(s => s + 1)
  const prev = () => setStep(s => s - 1)

  return (
    <>
      {/* Overlay oscuro: SVG con agujero recortado en el elemento */}
      <svg
        style={{ position: 'fixed', inset: 0, zIndex: 9990, pointerEvents: 'all', width: '100%', height: '100%' }}
        aria-hidden="true"
      >
        <defs>
          <mask id="tut-mask">
            <rect width="100%" height="100%" fill="white"/>
            {targetRect && (
              <rect
                x={targetRect.left}  y={targetRect.top}
                width={targetRect.width} height={targetRect.height}
                rx={12} ry={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.7)" mask="url(#tut-mask)"/>
      </svg>

      {/* Anillo de resaltado alrededor del elemento */}
      {targetRect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'fixed',
            top:    targetRect.top,
            left:   targetRect.left,
            width:  targetRect.width,
            height: targetRect.height,
            zIndex: 9991,
            borderRadius: 14,
            border: '2px solid rgba(59,130,246,0.9)',
            pointerEvents: 'none',
            boxShadow: '0 0 0 4px rgba(59,130,246,0.15)',
          }}
        />
      )}

      {/* Tooltip */}
      <div style={{ position: 'fixed', zIndex: 9995, ...( targetRect ? { top: tooltipPos.top, left: tooltipPos.left } : { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }) }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            style={{ width: TOOLTIP_W }}
            className="bg-slate-900 border border-slate-700/70 rounded-2xl p-5 shadow-2xl"
          >
            {/* Saltar */}
            <button
              onClick={onDone}
              className="absolute top-3.5 right-3.5 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label="Saltar tutorial"
            >
              <X size={15}/>
            </button>

            <div className="flex items-start gap-3 pr-5">
              <span className="text-3xl leading-none mt-0.5 shrink-0">{current.emoji}</span>
              <div>
                <p className="text-white font-bold text-sm leading-snug mb-1.5">{current.title}</p>
                <p className="text-slate-300 text-xs leading-relaxed">{current.desc}</p>
              </div>
            </div>

            {/* Progreso + navegación */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-1 items-center">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={`rounded-full transition-all ${
                      i === step ? 'w-4 h-1.5 bg-blue-500' : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                {!isFirst && (
                  <button
                    onClick={prev}
                    className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
                  >
                    <ChevronLeft size={16}/>
                  </button>
                )}
                <button
                  onClick={next}
                  className="flex items-center gap-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500
                             text-white px-3.5 py-1.5 rounded-xl transition-colors"
                >
                  {isLast ? '¡Empezar!' : 'Siguiente'}
                  {!isLast && <ChevronRight size={14}/>}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
