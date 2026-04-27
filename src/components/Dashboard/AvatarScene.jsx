/**
 * Escena de avatares con anime.js: bounce (happy), shake (dead), float (normal).
 * Usa createMotionPath para una moneda orbital y splitText en el encabezado.
 */

import { useRef, useEffect } from 'react'
import { animate, stagger, svg, splitText, engine } from 'animejs'
import { getAvatarByKey } from '../../assets/avatars'

export default function AvatarScene({ users, balances, activeUser }) {
  const headingRef    = useRef(null)
  const coinRef       = useRef(null)
  const pathRef       = useRef(null)
  const avatarRefsMap = useRef(new Map())   // uid → wrapper DOM el
  const loopAnims     = useRef([])

  function getAvatarState(userId) {
    const bal = balances[userId] ?? 0
    if (bal > 0.01)  return 'happy'
    if (bal < -0.01) return 'dead'
    return 'normal'
  }

  // Clave compacta que solo cambia cuando un avatar CAMBIA DE ESTADO
  const stateKey = users.map(u => getAvatarState(u.id)[0]).join('')

  // ── Entrada: pop-in escalonado + splitText en el heading
  useEffect(() => {
    if (!users.length) return

    // splitText accesible en el encabezado
    if (headingRef.current) {
      try {
        const { chars } = splitText(headingRef.current, { chars: { accessible: true } })
        if (chars?.length) {
          chars.forEach(c => { c.style.opacity = '0' })
          animate(chars, {
            opacity: [0, 1], translateY: [6, 0],
            duration: 280, delay: stagger(35),
            easing: 'easeOutExpo',
          })
        }
      } catch (_) {}
    }

    // Pop-in escalonado de los wrappers de avatar
    const els = users.map(u => avatarRefsMap.current.get(u.id)).filter(Boolean)
    if (els.length) {
      els.forEach(el => { el.style.opacity = '0'; el.style.transform = 'scale(0.35)' })
      animate(els, {
        opacity: [0, 1], scale: [0.35, 1],
        duration: 520, delay: stagger(95),
        easing: 'easeOutBack',
      })
    }
  }, [users.length]) // eslint-disable-line

  // ── Moneda orbital siguiendo un createMotionPath
  useEffect(() => {
    if (!coinRef.current || !pathRef.current) return

    // engine.speed: velocidad global mientras la escena está activa (ligeramente realzada)
    engine.speed = 1.05
    const anim = animate(coinRef.current, {
      ...svg.createMotionPath(pathRef.current),
      duration: 11000,
      loop:     true,
      easing:   'linear',
    })
    return () => {
      engine.speed = 1
      anim.cancel()
    }
  }, []) // eslint-disable-line

  // ── Animaciones en bucle por estado (se reinician solo al cambiar de estado)
  useEffect(() => {
    loopAnims.current.forEach(a => { try { a?.cancel() } catch (_) {} })
    loopAnims.current = []

    users.forEach((user, i) => {
      const el = avatarRefsMap.current.get(user.id)
      if (!el) return
      const state = getAvatarState(user.id)

      const anim = state === 'happy'
        ? animate(el, {
            translateY: [0, -16, -5, -13, 0],
            duration:   900,  delay: i * 160,
            loop: true, easing: 'easeInOutSine',
          })
        : state === 'dead'
        ? animate(el, {
            translateX: [0, -7, 7, -4, 4, -2, 2, 0],
            duration:   1400, delay: i * 260,
            loop: true, loopDelay: 1100, easing: 'easeInOutSine',
          })
        : animate(el, {
            translateY: [0, -(5 + i * 1.5), 0],
            duration:   2600 + i * 280, delay: i * 420,
            loop: true, easing: 'easeInOutSine',
          })

      loopAnims.current.push(anim)
    })

    return () => { loopAnims.current.forEach(a => { try { a?.cancel() } catch (_) {} }) }
  }, [stateKey]) // eslint-disable-line

  if (!users.length) return null

  return (
    <div className="glass rounded-2xl p-6 overflow-hidden relative">
      {/* Path SVG para createMotionPath — invisible pero con geometría real */}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
      >
        <path
          ref={pathRef}
          d="M 60 25 C 140 0 260 0 310 25 S 370 65 310 85 C 240 108 120 108 60 85 S -10 50 60 25"
          fill="none" stroke="none"
        />
      </svg>

      {/* Moneda que sigue el path */}
      <div
        ref={coinRef}
        aria-hidden="true"
        className="absolute pointer-events-none select-none text-slate-400/25 font-bold"
        style={{ top: '-8px', left: '-8px', fontSize: '18px' }}
      >
        €
      </div>

      <p ref={headingRef} className="text-slate-400 text-xs uppercase tracking-wider mb-4 text-center">
        Estado del grupo
      </p>

      <div className="flex justify-center items-end gap-6 flex-wrap">
        {users.map((user, i) => {
          const AvatarComp = getAvatarByKey(user.avatar)
          const state      = getAvatarState(user.id)
          const isActive   = activeUser?.id === user.id
          const color      = user.color || '#2563eb'

          return (
            <div
              key={user.id}
              ref={el => {
                if (el) avatarRefsMap.current.set(user.id, el)
                else    avatarRefsMap.current.delete(user.id)
              }}
              className="flex flex-col items-center gap-2 cursor-default"
            >
              <div className={`relative rounded-full p-1 transition-all
                              ${isActive ? 'ring-2 ring-blue-400/60 ring-offset-2 ring-offset-slate-900' : ''}`}>
                <div className={`absolute inset-0 rounded-full blur-lg opacity-30
                                ${state === 'happy' ? 'bg-emerald-400' : state === 'dead' ? 'bg-red-400' : 'bg-blue-400'}`}/>
                <AvatarComp
                  key={state}
                  state={state}
                  color={color}
                  size={state === 'dead' ? 70 : 80}
                />
                <span className="absolute -top-1 -right-1 text-sm">
                  {state === 'happy' ? '😄' : state === 'dead' ? '😵' : '😐'}
                </span>
              </div>
              <p className="text-sm font-medium text-white">{user.name}</p>
              {isActive && <span className="text-xs text-blue-400 font-medium">Tú</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
