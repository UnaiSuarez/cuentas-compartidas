import { useEffect, useRef } from 'react'
import { animate, stagger, svg, engine } from 'animejs'
import AppLogo from '../../assets/AppLogo'

export default function SplashScreen() {
  const wrapRef  = useRef(null)
  const textRef  = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    // Ralentización cinématica solo durante el splash
    engine.speed = 0.82

    // Select only stroked path elements (animatable with createDrawable)
    const paths     = Array.from(wrap.querySelectorAll('path'))
    const drawables = paths.map(p => svg.createDrawable(p))

    // 1. Draw the arcs
    animate(drawables, {
      draw:     ['0 0', '0 1'],
      duration: 600,
      delay:    stagger(100),
      easing:   'easeInOutQuart',
    })

    // 2. Fade in center coin + text after arcs finish
    const center = wrap.querySelectorAll('circle, text')
    animate(center, {
      opacity:  [0, 1],
      scale:    [0.4, 1],
      duration: 450,
      delay:    550,
      easing:   'easeOutBack',
    })

    // 3. Fade in subtitle text below logo
    animate(textRef.current, {
      opacity:    [0, 1],
      translateY: [12, 0],
      duration:   500,
      delay:      900,
      easing:     'easeOutExpo',
    })

    return () => { engine.speed = 1 }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-5">
      <div ref={wrapRef}>
        <AppLogo size={88}/>
      </div>
      <div ref={textRef} className="text-center" style={{ opacity: 0 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Cuentas Compartidas</h1>
        <p className="text-slate-400 text-sm mt-1">Gastos sin dramas</p>
      </div>
    </div>
  )
}
