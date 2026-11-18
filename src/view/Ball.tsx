import { useEffect, useState } from 'react'
import type { BallFlight } from '../domain/rally'
import { project, VIEW_H, VIEW_W } from './projection'
import { useReducedMotion } from './useReducedMotion'

const pct = (x: number, d: number, z: number) => { const p = project(x, d, z); return { left: (p.x / VIEW_W) * 100, top: (p.y / VIEW_H) * 100, s: p.s } }

/** The ball flying along an arc (straight across, parabola in height), with its shadow on the floor. */
export function Ball({ flight, durationMs }: { flight: BallFlight; durationMs: number }) {
  const reduced = useReducedMotion()
  const [t, setT] = useState(reduced ? 1 : 0)
  useEffect(() => {
    if (reduced || typeof requestAnimationFrame !== 'function') { setT(1); return }
    setT(0)
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / durationMs)
      setT(k)
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [flight, durationMs, reduced])

  const { from, to, peak } = flight
  const x = from.x + (to.x - from.x) * t
  const d = from.d + (to.d - from.d) * t
  const z = from.z + (to.z - from.z) * t + 4 * (peak - (from.z + to.z) / 2) * t * (1 - t)
  const ball = pct(x, d, z)
  const shadow = pct(x, d, 0)
  const size = Math.max(12, (ball.s / 70) * 26)
  return (
    <div className="ball-layer" data-testid="ball" aria-hidden="true">
      <div className="ball-shadow" style={{ left: `${shadow.left}%`, top: `${shadow.top}%`, width: size, height: size * 0.4 }} />
      <div className="ball" style={{ left: `${ball.left}%`, top: `${ball.top}%`, width: size, height: size }} />
    </div>
  )
}
