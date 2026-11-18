import type { CSSProperties } from 'react'
import type { PlacedPlayer } from '../domain/place'
import type { Tag } from '../domain/types'
import { project, VIEW_H, VIEW_W } from './projection'
import { useReducedMotion } from './useReducedMotion'

const TAG_COLOR: Record<Tag, string> = {
  SERVE: '#FFB24D', PASS: '#5CE1E6', SETS: '#FFD84D', BLOCK: '#FF6F59', TIP: '#EDE8DF',
  LINE: '#5CE1E6', CROSS: '#5CE1E6', DIG: '#5CE1E6', DEEP: '#C4A1FF',
}
const pct = (x: number, d: number) => { const p = project(x, d); return { left: (p.x / VIEW_W) * 100, top: (p.y / VIEW_H) * 100, s: p.s, y: p.y } }

interface Props {
  players: PlacedPlayer[]
  durationMs: number
  showGhosts: boolean
  /** Highlight one player and fade the rest. */
  focusId?: string | null
}

export function Tokens({ players, durationMs, showGhosts, focusId = null }: Props) {
  const reduced = useReducedMotion()
  const ease = 'cubic-bezier(.65,0,.35,1)'
  const transition = reduced ? 'none' : `left ${durationMs}ms ${ease}, top ${durationMs}ms ${ease}`
  const innerTransition = reduced ? 'none' : `transform ${durationMs}ms ${ease}`
  return (
    <div className="tokens" aria-hidden="true">
      {showGhosts && players.map((p) => {
        const h = pct(p.home.x, p.home.d)
        return <div key={`g-${p.id}`} className="ghost" style={{ left: `${h.left}%`, top: `${h.top}%`, borderColor: p.show.color }} />
      })}
      {players.map((p) => {
        const q = pct(p.spot.x, p.spot.d)
        const outer: CSSProperties = { left: `${q.left}%`, top: `${q.top}%`, zIndex: Math.round(q.y), transition }
        const inner: CSSProperties = { transform: `translate(-50%, -100%) scale(${(q.s / 70).toFixed(3)})`, transition: innerTransition }
        return (
          <div key={p.id} data-id={p.id} data-focus={focusId ? String(p.id === focusId) : undefined} className={`token${focusId ? (p.id === focusId ? ' token--focus' : ' token--dim') : ''}`} style={outer}>
            <div className="token-body" style={inner}>
              {p.tag && <span className="token-tag" style={{ color: TAG_COLOR[p.tag], borderColor: TAG_COLOR[p.tag] }}>{p.tag}</span>}
              <div className="token-disc" style={{ background: p.show.color }}>{p.show.code}</div>
              <div className="token-stem" />
              <div className="token-shadow" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
