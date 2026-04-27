import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { animate, svg }  from 'animejs'

const PAD = 10
const TOOLTIP_W = 310
const TOOLTIP_H = 220

const STEPS = [
  {
    route:    '/',
    selector: null,
    emoji:    '👋',
    title:    '¡Bienvenido/a!',
    desc:     'La app para gestionar gastos con tu piso o grupo sin dramas. Te hacemos un recorrido rápido por las partes principales.',
  },
  {
    route:    '/',
    selector: '[data-tutorial="my-balance"]',
    emoji:    '💰',
    title:    'Tu saldo personal',
    desc:     'Aquí ves tu saldo neto real. El número se actualiza en vivo con el grupo. Si alguien te debe, aparece desglosado en ámbar justo debajo.',
  },
  {
    route:    '/transacciones',
    selector: '[data-tutorial="new-transaction"]',
    emoji:    '📝',
    title:    'Registra un gasto',
    desc:     'Pulsa este botón para añadir un gasto o ingreso. Elige quién pagó, entre quiénes se divide y la categoría. El modo "Gasto Común" es para el bote del piso.',
  },
  {
    route:    '/liquidacion',
    selector: '[data-tutorial="optimal-payments"]',
    emoji:    '⚖️',
    title:    'Saldar deudas',
    desc:     'El algoritmo calcula los pagos mínimos para saldar todas las deudas. Añade el importe como ingreso y el saldo se ajusta automáticamente.',
  },
  {
    route:    '/estadisticas',
    selector: '[data-tutorial="view-toggle"]',
    emoji:    '📊',
    title:    'Mis datos vs Del grupo',
    desc:     'Alterna entre ver tu parte proporcional de los gastos o los datos del grupo completo. Los gráficos y totales se adaptan al instante.',
  },
  {
    route:    '/',
    selector: null,
    emoji:    '🎉',
    title:    '¡Ya lo tienes todo!',
    desc:     'Ahora conoces lo esencial. Empieza añadiendo tu primer gasto desde la pestaña Transacciones.',
  },
]

/** Flecha SVG animada que señala al elemento enfocado */
function TutorialArrow({ visible }) {
  const pathRef = useRef(null)
  const drawn   = useRef(false)

  useEffect(() => {
    if (!visible || !pathRef.current) return
    drawn.current = false
    const drawable = svg.createDrawable(pathRef.current)
    animate(drawable, {
      draw:     ['0 0', '0 1'],
      duration: 500,
      easing:   'easeInOutQuart',
    })
  }, [visible])

  if (!visible) return null
  return (
    <svg
      width="32" height="32" viewBox="0 0 32 32"
      fill="none"
      style={{ position: 'absolute', bottom: -34, left: '50%', transform: 'translateX(-50%)' }}
    >
      <path
        ref={pathRef}
        d="M 16 2 L 16 22 M 8 16 L 16 26 L 24 16"
        stroke="#3b82f6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function TutorialOverlay({ onDone }) {
  const navigate   = useNavigate()
  const [step, setStep]               = useState(0)
  const [targetRect, setTargetRect]   = useState(null)
  const ringRef = useRef(null)

  const current = STEPS[step]
  const isFirst = step === 0
  const isLast  = step === STEPS.length - 1

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

  useEffect(() => {
    setTargetRect(null)
    navigate(current.route)
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Re-mide al scroll/resize
  useEffect(() => {
    window.addEventListener('scroll', measure, true)
    window.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('scroll', measure, true)
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  // Anima el anillo de resaltado con spring cuando aparece o se mueve
  useEffect(() => {
    if (!ringRef.current || !targetRect) return
    animate(ringRef.current, {
      scale:   [0.88, 1],
      opacity: [0, 1],
      duration: 400,
      easing:  'easeOutBack',
    })
  }, [targetRect])

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
      {/* Overlay oscuro con agujero */}
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
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#tut-mask)"/>
      </svg>

      {/* Anillo de resaltado con spring */}
      {targetRect && (
        <div
          ref={ringRef}
          style={{
            position:     'fixed',
            top:          targetRect.top,
            left:         targetRect.left,
            width:        targetRect.width,
            height:       targetRect.height,
            zIndex:       9991,
            borderRadius: 14,
            border:       '2px solid rgba(59,130,246,0.9)',
            pointerEvents:'none',
            boxShadow:    '0 0 0 4px rgba(59,130,246,0.15), 0 0 24px rgba(59,130,246,0.2)',
          }}
        />
      )}

      {/* Tooltip */}
      <div style={{
        position: 'fixed',
        zIndex: 9995,
        ...(targetRect
          ? { top: tooltipPos.top, left: tooltipPos.left }
          : { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }
        ),
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -6 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            style={{ width: TOOLTIP_W, position: 'relative' }}
            className="bg-slate-900 border border-slate-700/70 rounded-2xl p-5 shadow-2xl"
          >
            {/* Flecha indicadora (solo cuando hay elemento enfocado) */}
            {targetRect && (
              <div style={{ position: 'absolute', bottom: -38, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                <TutorialArrow visible={!!targetRect}/>
              </div>
            )}

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
