import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

/**
 * Lanza confeti al recibir trigger=true.
 * colors: array de colores hex (opcional, por defecto paleta propia)
 * count:  número de partículas
 */
export default function Confetti({ trigger, colors = COLORS, count = 55 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!trigger || !containerRef.current) return

    const container = containerRef.current
    const particles = Array.from({ length: count }, () => {
      const el       = document.createElement('div')
      const size     = 5 + Math.random() * 7
      const isRect   = Math.random() > 0.5
      const color    = colors[Math.floor(Math.random() * colors.length)]

      Object.assign(el.style, {
        position:     'absolute',
        width:        `${size}px`,
        height:       isRect ? `${size * 0.5}px` : `${size}px`,
        borderRadius: isRect ? '2px' : '50%',
        background:   color,
        left:         '50%',
        top:          '40%',
        transform:    'translate(-50%,-50%)',
        pointerEvents:'none',
        opacity:      '1',
      })
      container.appendChild(el)
      return el
    })

    animate(particles, {
      translateX: () => (Math.random() - 0.5) * 500,
      translateY: () => -80 - Math.random() * 350,
      rotate:     () => Math.random() * 720 - 360,
      scale:      [1, 0],
      opacity:    [1, 0],
      duration:   2000,
      delay:      stagger(18, { from: 'random' }),
      easing:     'easeOutExpo',
      onComplete: () => particles.forEach(p => p.remove()),
    })

    return () => particles.forEach(p => { try { p.remove() } catch (_) {} })
  }, [trigger]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      style={{
        position:      'fixed',
        inset:         0,
        pointerEvents: 'none',
        overflow:      'hidden',
        zIndex:        9999,
      }}
    />
  )
}
