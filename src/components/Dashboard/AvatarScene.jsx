/**
 * Escena de avatares con anime.js:
 * - happy: movimiento errático energético (X+Y)
 * - dead:  casi inmóvil, micro-temblor
 * - normal: flotación suave en 2D
 *
 * Monedas € flotantes cuya cantidad es proporcional al saldo del usuario activo.
 * Cada moneda tiene trayectoria completamente aleatoria.
 */

import { useRef, useEffect, useMemo } from 'react'
import { animate, stagger, splitText, engine } from 'animejs'
import { getAvatarByKey } from '../../assets/avatars'

export default function AvatarScene({ users, balances, activeUser }) {
  const headingRef    = useRef(null)
  const avatarRefsMap = useRef(new Map())
  const loopAnims     = useRef([])
  const coinRefs      = useRef([])
  const coinAnimRefs  = useRef([])

  function getAvatarState(userId) {
    const bal = balances[userId] ?? 0
    if (bal > 0.01)  return 'happy'
    if (bal < -0.01) return 'dead'
    return 'normal'
  }

  // Clave compacta que solo cambia cuando un avatar CAMBIA DE ESTADO
  const stateKey = users.map(u => getAvatarState(u.id)[0]).join('')

  // Número de monedas proporcional al saldo positivo del usuario activo
  const activeBalance = activeUser ? (balances[activeUser.id] ?? 0) : 0
  const coinCount = Math.max(1, Math.min(8, activeBalance > 0 ? Math.ceil(activeBalance / 10) : 1))

  // Posiciones y tamaños iniciales estables para hasta 8 monedas
  const coinData = useMemo(() =>
    Array.from({ length: 8 }, () => ({
      left: 8  + Math.random() * 84,   // 8–92% del ancho
      top:  10 + Math.random() * 72,   // 10–82% del alto
      size: 13 + Math.floor(Math.random() * 12),  // 13–25px
    }))
  , []) // eslint-disable-line

  // ── Entrada: pop-in escalonado + splitText en el heading
  useEffect(() => {
    if (!users.length) return

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

  // ── Monedas con movimiento totalmente aleatorio, cantidad según saldo
  useEffect(() => {
    engine.speed = 1.05

    coinAnimRefs.current.forEach(a => { try { a?.cancel() } catch (_) {} })
    coinAnimRefs.current = []

    coinRefs.current.slice(0, coinCount).forEach((el, idx) => {
      if (!el) return
      const r  = () => (Math.random() - 0.5) * 200  // ±100px
      const ry = () => (Math.random() - 0.5) * 90   // ±45px
      const anim = animate(el, {
        translateX: [0, r(), r(), r(), r(), r(), 0],
        translateY: [0, ry(), ry(), ry(), ry(), ry(), 0],
        opacity:    [0.1, 0.4, 0.15, 0.35, 0.2, 0.3, 0.1],
        duration:   7000 + Math.random() * 9000,
        delay:      idx * 380,
        loop:       true,
        easing:     'easeInOutSine',
      })
      coinAnimRefs.current.push(anim)
    })

    return () => {
      engine.speed = 1
      coinAnimRefs.current.forEach(a => { try { a?.cancel() } catch (_) {} })
    }
  }, [coinCount]) // eslint-disable-line

  // ── Animaciones de movimiento libre según estado
  useEffect(() => {
    loopAnims.current.forEach(a => { try { a?.cancel() } catch (_) {} })
    loopAnims.current = []

    users.forEach((user, i) => {
      const el = avatarRefsMap.current.get(user.id)
      if (!el) return
      const state = getAvatarState(user.id)

      const anim = state === 'happy'
        // Movimiento energético y errático en 2D
        ? animate(el, {
            translateX: [0, 22 + i * 6, -16, 28, -12, 18, 0],
            translateY: [0, -22, -6, -19, -4, -15, 0],
            duration:   820 + i * 90,
            delay:      i * 160,
            loop:       true,
            easing:     'easeInOutSine',
          })
        : state === 'dead'
        // Casi inmóvil — micro-temblor muy leve
        ? animate(el, {
            translateX: [0, -2, 2, -1, 1, 0],
            translateY: [0, 1, 2, 1, 0],
            duration:   3200,
            loop:       true,
            loopDelay:  1800,
            easing:     'easeInOutSine',
          })
        // Flotación suave con deriva horizontal
        : animate(el, {
            translateX: [0, 11 + i * 3, -7, 14, -5, 0],
            translateY: [0, -(5 + i * 1.5), -1, -(8 + i), -2, 0],
            duration:   2700 + i * 310,
            delay:      i * 420,
            loop:       true,
            easing:     'easeInOutSine',
          })

      loopAnims.current.push(anim)
    })

    return () => { loopAnims.current.forEach(a => { try { a?.cancel() } catch (_) {} }) }
  }, [stateKey]) // eslint-disable-line

  if (!users.length) return null

  return (
    <div className="glass rounded-2xl p-6 overflow-hidden relative">
      {/* Monedas flotantes — una por cada ~10€ de saldo positivo */}
      {Array.from({ length: coinCount }, (_, i) => {
        const d = coinData[i]
        return (
          <div
            key={i}
            ref={el => { coinRefs.current[i] = el }}
            aria-hidden="true"
            className="absolute pointer-events-none select-none font-bold text-slate-400/25"
            style={{ left: `${d.left}%`, top: `${d.top}%`, fontSize: `${d.size}px` }}
          >
            €
          </div>
        )
      })}

      <p ref={headingRef} className="text-slate-400 text-xs uppercase tracking-wider mb-4 text-center relative z-10">
        Estado del grupo
      </p>

      <div className="flex justify-center items-end gap-6 flex-wrap relative z-10">
        {users.map((user) => {
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
