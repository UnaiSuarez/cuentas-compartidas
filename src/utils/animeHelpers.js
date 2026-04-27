import { animate, stagger } from 'animejs'

/** Ripple de click en un botón */
export function addRipple(e, element) {
  const rect = element.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  const ripple = document.createElement('span')
  Object.assign(ripple.style, {
    position:     'absolute',
    left:         `${x}px`,
    top:          `${y}px`,
    width:        '4px',
    height:       '4px',
    borderRadius: '50%',
    background:   'rgba(255,255,255,0.35)',
    transform:    'translate(-50%,-50%)',
    pointerEvents:'none',
    zIndex:       '10',
  })

  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative'
  }
  element.style.overflow = 'hidden'
  element.appendChild(ripple)

  animate(ripple, {
    width:    ['4px', '400px'],
    height:   ['4px', '400px'],
    opacity:  [0.4, 0],
    duration: 700,
    easing:   'easeOutExpo',
    onComplete: () => ripple.remove(),
  })
}

/** Partículas que salen al hacer hover en un botón */
export function addHoverParticles(element, color = '#3b82f6') {
  const count = 8
  const rect  = element.getBoundingClientRect()
  const cx    = rect.left + rect.width  / 2
  const cy    = rect.top  + rect.height / 2

  const particles = Array.from({ length: count }, (_, i) => {
    const el    = document.createElement('div')
    const size  = 4 + Math.random() * 4
    const angle = (i / count) * Math.PI * 2
    const dist  = 25 + Math.random() * 35

    Object.assign(el.style, {
      position:     'fixed',
      width:        `${size}px`,
      height:       `${size}px`,
      borderRadius: '50%',
      background:   color,
      left:         `${cx}px`,
      top:          `${cy}px`,
      transform:    'translate(-50%,-50%)',
      opacity:      '0.9',
      pointerEvents:'none',
      zIndex:       '9998',
    })
    document.body.appendChild(el)

    animate(el, {
      translateX: Math.cos(angle) * dist,
      translateY: Math.sin(angle) * dist - 12,
      scale:      [1, 0.1],
      opacity:    [0.9, 0],
      duration:   600,
      easing:     'easeOutExpo',
      onComplete: () => el.remove(),
    })

    return el
  })

  return () => particles.forEach(p => p.remove())
}

/** Tilt 3D al pasar el cursor por una tarjeta */
export function setupTilt(element, maxDeg = 5) {
  let currentAnim = null

  function onMove(e) {
    const rect = element.getBoundingClientRect()
    const dx   = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)
    const dy   = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)

    currentAnim?.cancel()
    currentAnim = animate(element, {
      rotateX:  -dy * maxDeg,
      rotateY:   dx * maxDeg,
      duration: 120,
      easing:   'easeOutSine',
    })
  }

  function onLeave() {
    currentAnim?.cancel()
    currentAnim = animate(element, {
      rotateX: 0,
      rotateY: 0,
      duration: 600,
      easing:  'easeOutElastic',
    })
  }

  element.style.transformStyle = 'preserve-3d'
  element.style.willChange     = 'transform'
  element.addEventListener('mousemove',  onMove)
  element.addEventListener('mouseleave', onLeave)

  return () => {
    element.removeEventListener('mousemove',  onMove)
    element.removeEventListener('mouseleave', onLeave)
    element.style.transformStyle = ''
    element.style.willChange     = ''
  }
}

/** Revela un elemento al entrar en el viewport */
export function revealOnScroll(element, opts = {}) {
  if (!element) return () => {}

  const { delay = 0, translateY = 28, duration = 700 } = opts

  element.style.opacity   = '0'
  element.style.transform = `translateY(${translateY}px)`

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    animate(element, {
      opacity:    [0, 1],
      translateY: [translateY, 0],
      duration,
      delay,
      easing:     'easeOutExpo',
    })
    observer.unobserve(element)
  }, { threshold: 0.12 })

  observer.observe(element)
  return () => observer.disconnect()
}

/** Stagger de entrada para una lista de elementos */
export function staggerReveal(elements, opts = {}) {
  const { duration = 500, staggerMs = 40, translateY = 16 } = opts
  const els = Array.from(elements)
  if (!els.length) return

  animate(els, {
    opacity:    [0, 1],
    translateY: [translateY, 0],
    duration,
    delay:      stagger(staggerMs),
    easing:     'easeOutExpo',
  })
}
