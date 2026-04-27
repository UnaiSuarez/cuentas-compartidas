import { useEffect, useRef } from 'react'
import { animate } from 'animejs'

/**
 * Animates a number from its previous value to a new one.
 * Returns a ref to attach to a DOM element whose textContent will be updated.
 *
 * @param {number}   value  - Current numeric value
 * @param {Function} format - Optional formatter (e.g. formatCurrency)
 * @param {number}   duration
 */
export function useAnimatedCounter(value, format, duration = 900) {
  const ref     = useRef(null)
  const prevRef = useRef(null)
  const animRef = useRef(null)

  // Initial render: set text without animation
  useEffect(() => {
    if (ref.current) {
      ref.current.textContent = format ? format(value) : String(Math.round(value ?? 0))
    }
    prevRef.current = value
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Subsequent changes: animate counter
  useEffect(() => {
    if (prevRef.current === null || prevRef.current === value || !ref.current) return

    const from = prevRef.current ?? 0
    prevRef.current = value

    if (animRef.current) animRef.current.cancel()

    const counter = { val: from }
    animRef.current = animate(counter, {
      val:      value,
      duration,
      easing:   'easeOutExpo',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = format
            ? format(counter.val)
            : String(Math.round(counter.val))
        }
      },
    })

    return () => animRef.current?.cancel()
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return ref
}
