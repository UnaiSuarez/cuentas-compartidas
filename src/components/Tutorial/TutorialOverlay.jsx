import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const STEPS = [
  {
    emoji: '👋',
    title: '¡Bienvenido/a a Cuentas Compartidas!',
    desc: 'La app para gestionar gastos con tu piso, pareja o amigos sin dramas. En 30 segundos te cuento cómo funciona todo.',
    tip: null,
  },
  {
    emoji: '🏠',
    title: 'Dashboard',
    desc: 'Tu pantalla principal. Muestra tu saldo personal, cuánto tienes disponible de verdad y cuánto está pendiente de que te paguen.',
    tip: 'El número grande es lo que ya está "seguro". Si alguien te debe, verás un desglose justo debajo.',
  },
  {
    emoji: '📝',
    title: 'Transacciones',
    desc: 'Registra gastos e ingresos del grupo. Puedes elegir quién pagó, entre quiénes se divide y la categoría.',
    tip: 'El modo "Gasto Común" es para gastos del bote compartido (cuenta del piso), sin que nadie acumule crédito individual.',
  },
  {
    emoji: '⚖️',
    title: 'Liquidación',
    desc: 'Aquí ves exactamente quién le debe a quién y cuánto. El algoritmo calcula los pagos mínimos para saldar todas las deudas.',
    tip: 'Cuando pagues, pulsa "He pagado" para notificar al otro. Él lo confirmará y la deuda desaparecerá.',
  },
  {
    emoji: '📊',
    title: 'Estadísticas',
    desc: 'Gráficos de gastos por categoría y evolución mensual. Alterna entre "Mis datos" (tu parte proporcional) y "Del grupo" (todos).',
    tip: null,
  },
  {
    emoji: '💬',
    title: 'Chat y Ajustes',
    desc: 'El chat es para hablar con tu grupo en tiempo real. En Ajustes puedes cambiar tu nombre, avatar, editar categorías o cambiar de sala.',
    tip: 'Puedes pertenecer a varias salas a la vez — ideal si tienes piso y también compartes gastos con otra gente.',
  },
]

export default function TutorialOverlay({ onDone }) {
  const [step, setStep] = useState(0)

  const isFirst = step === 0
  const isLast  = step === STEPS.length - 1
  const current = STEPS[step]

  const next = () => isLast ? onDone() : setStep(s => s + 1)
  const prev = () => setStep(s => s - 1)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-3xl p-7 shadow-2xl"
      >
        {/* Saltar */}
        <button
          onClick={onDone}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
          aria-label="Saltar tutorial"
        >
          <X size={18}/>
        </button>

        {/* Contenido del paso */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <p className="text-6xl mb-5">{current.emoji}</p>
            <h2 className="text-white font-bold text-xl mb-3">{current.title}</h2>
            <p className="text-slate-300 text-sm leading-relaxed">{current.desc}</p>
            {current.tip && (
              <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 text-left">
                <p className="text-blue-300 text-xs leading-relaxed">
                  <span className="font-semibold">Consejo: </span>{current.tip}
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Puntos de progreso */}
        <div className="flex justify-center gap-1.5 mt-7">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`rounded-full transition-all ${
                i === step ? 'w-5 h-2 bg-blue-500' : 'w-2 h-2 bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        {/* Navegación */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={prev}
            disabled={isFirst}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-0"
          >
            <ChevronLeft size={16}/>
            Anterior
          </button>
          <button
            onClick={next}
            className="flex items-center gap-1 text-sm font-semibold bg-blue-600 hover:bg-blue-500
                       text-white px-5 py-2 rounded-xl transition-colors"
          >
            {isLast ? '¡Empezar!' : 'Siguiente'}
            {!isLast && <ChevronRight size={16}/>}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
