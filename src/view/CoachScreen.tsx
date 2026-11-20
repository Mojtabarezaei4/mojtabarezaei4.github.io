import { useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import {
  encodePlaybook, noteFor, playbookStatus, playbookViolations, playerLabel, resetSpots, setNote, setRoster, setSpot, spotsFor,
  type Playbook, type Situation,
} from '../domain/playbook'
import { playersAt, rotationLabel } from '../domain/rotation'
import { ROLE_INFO } from '../domain/systems'
import { SYSTEM_KEYS, type Spot, type SystemKey, type Zone } from '../domain/types'
import { emptyPlaybook } from '../domain/playbook'
import * as exporter from './exportImage'
import { Ball } from './PlayerScreen'

// Flat top-down edit court: 12 m × 12 m view, net at the top.
const X0 = -1.5, D0 = -0.6, SPAN = 12
const pct = (s: Spot) => ({ left: ((s.x - X0) / SPAN) * 100, top: ((s.d - D0) / SPAN) * 100 })
const snap = (n: number) => Math.round(n * 2) / 2
const clampSpot = (s: Spot, server: boolean): Spot => ({
  x: Math.min(10, Math.max(-1, s.x)),
  d: server ? Math.min(11, Math.max(9.3, s.d)) : Math.min(9, Math.max(0.2, s.d)),
})
const SITUATIONS: { key: Situation; label: string }[] = [{ key: 'serve', label: 'We serve' }, { key: 'receive', label: 'Receive' }]
const ZONE_POS: Record<Zone, Spot> = { 4: { x: 0.3, d: 2.6 }, 3: { x: 3.3, d: 2.6 }, 2: { x: 6.3, d: 2.6 }, 5: { x: 0.3, d: 8.6 }, 6: { x: 3.3, d: 8.6 }, 1: { x: 6.3, d: 8.6 } }

export function shareLink(pb: Playbook): string {
  const base = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : ''
  return `${base}#/play?pb=${encodePlaybook(pb)}`
}

export function CoachScreen({ initial, onChange }: { initial?: Playbook | null; onChange?: (pb: Playbook) => void }) {
  const [pb, setPb] = useState<Playbook>(initial ?? emptyPlaybook('5-1'))
  const [rotation, setRotation] = useState(0)
  const [situation, setSituation] = useState<Situation>('receive')
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const runExport = async (fn: () => Promise<void>) => { setExporting(true); try { await fn() } finally { setExporting(false) } }
  const courtRef = useRef<HTMLDivElement>(null)
  const drag = useRef<string | null>(null)

  const update = (next: Playbook) => { setPb(next); setCopied(false); onChange?.(next) }
  const players = playersAt(pb.system, rotation)
  const spots = spotsFor(pb, rotation, situation)
  const violations = playbookViolations(pb, rotation, situation)
  const link = useMemo(() => shareLink(pb), [pb])
  const isServer = (zone: Zone) => situation === 'serve' && zone === 1

  const move = (id: string, zone: Zone, to: Spot) => {
    const s = clampSpot({ x: snap(to.x), d: snap(to.d) }, isServer(zone))
    const cur = spots[id]
    if (cur && cur.x === s.x && cur.d === s.d) return
    update(setSpot(pb, rotation, situation, id, s))
  }
  const onKey = (id: string, zone: Zone) => (e: KeyboardEvent) => {
    const step: Record<string, [number, number]> = { ArrowLeft: [-0.5, 0], ArrowRight: [0.5, 0], ArrowUp: [0, -0.5], ArrowDown: [0, 0.5] }
    const k = step[e.key]
    if (!k) return
    e.preventDefault()
    const cur = spotsFor(pb, rotation, situation)[id]
    move(id, zone, { x: cur.x + k[0], d: cur.d + k[1] })
  }
  const toSpot = (e: PointerEvent) => {
    const r = courtRef.current!.getBoundingClientRect()
    return { x: X0 + ((e.clientX - r.left) / r.width) * SPAN, d: D0 + ((e.clientY - r.top) / r.height) * SPAN }
  }
  const flagged = new Set(violations.length ? players.filter((p) => violations.some((v) => v.includes(`(zone ${p.zone})`))).map((p) => p.id) : [])
  const n = (r: number) => rotationLabel(pb.system, r)
  const rosterIds = [...players.map((p) => p.id), ...(pb.system === '6-6' ? [] : ['L'])]

  return (
    <div className="coach">
      <header className="coach-head">
        <div className="coach-brand">
          <a className="brand" href="#/" aria-label="Volleyrot – back to start"><Ball /><span>VOLLEYROT</span></a>
          <span className="coach-badge">COACH</span>
          <label className="coach-team"><span className="eyebrow">TEAM</span>
            <input value={pb.team} placeholder="Team name" aria-label="Team name" onChange={(e) => update({ ...pb, team: e.target.value })} />
          </label>
        </div>
        <div className="chips" role="group" aria-label="System">
          {SYSTEM_KEYS.map((s: SystemKey) => (
            <button key={s} type="button" className="chip" aria-pressed={s === pb.system}
              onClick={() => { if (s !== pb.system) update({ ...emptyPlaybook(s), team: pb.team }) }}>{s}</button>
          ))}
        </div>
      </header>

      <div className="coach-bar">
        <div className="pips" role="group" aria-label="Rotation">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" className="pip" aria-label={`Rotation ${n(i)}`} aria-pressed={i === rotation} onClick={() => setRotation(i)}>{n(i)}</button>
          ))}
        </div>
        <div className="phases" role="group" aria-label="Situation">
          {SITUATIONS.map((s) => <button key={s.key} type="button" className="phase" aria-pressed={s.key === situation} onClick={() => setSituation(s.key)}>{s.label}</button>)}
        </div>
        <button type="button" className="ghost-btn" onClick={() => update(resetSpots(pb, rotation, situation))}>Reset to default</button>
      </div>

      <div className="coach-body">
        <aside className="card coach-roster" aria-label="Roster">
          <h2>Roster</h2>
          <p className="hint">Numbers and names show up for your players.</p>
          {rosterIds.map((id) => {
            const r = pb.roster[id] ?? { name: '', num: '' }
            const role = id === 'L' ? 'L' : players.find((p) => p.id === id)!.role
            return (
              <div key={id} className="roster-row">
                <span className="legend-disc" style={{ background: ROLE_INFO[role].color }}>{id}</span>
                <input className="roster-num" inputMode="numeric" maxLength={3} placeholder="#" aria-label={`${id} number`} value={r.num}
                  onChange={(e) => update(setRoster(pb, id, { ...r, num: e.target.value.replace(/\D/g, '') }))} />
                <input className="roster-name" maxLength={24} placeholder="Name" aria-label={`${id} name`} value={r.name}
                  onChange={(e) => update(setRoster(pb, id, { ...r, name: e.target.value }))} />
              </div>
            )
          })}
        </aside>

        <main className="coach-main">
          <section className="card">
            <h2>Rotation {n(rotation)} · {situation === 'serve' ? 'We serve' : 'Receive'}</h2>
            <p className="hint">Drag players, or select one and use the arrow keys (½ m per press). Net at the top.</p>
            <div className="edit-court" ref={courtRef}>
              <div className="ec-net" style={{ top: `${pct({ x: 0, d: 0 }).top}%` }} />
              <div className="ec-court" style={{ left: `${pct({ x: 0, d: 0 }).left}%`, top: `${pct({ x: 0, d: 0 }).top}%`, width: `${(9 / SPAN) * 100}%`, height: `${(9 / SPAN) * 100}%` }}>
                <div className="ec-front" />
              </div>
              {(Object.keys(ZONE_POS) as unknown as Zone[]).map((z) => {
                const p = pct(ZONE_POS[Number(z) as Zone])
                return <span key={z} className="ec-zone" style={{ left: `${p.left}%`, top: `${p.top}%` }}>{z}</span>
              })}
              {players.map((p) => {
                const s = spots[p.id]
                const at = pct(s)
                const role = p.role === 'MB' && !p.front && !isServer(p.zone) ? 'L' : p.role
                const label = playerLabel(pb, p.id)
                const num = pb.roster[p.id]?.num
                return (
                  <button key={p.id} type="button" className={`ec-tok${flagged.has(p.id) ? ' ec-tok--bad' : ''}`}
                    style={{ left: `${at.left}%`, top: `${at.top}%`, background: ROLE_INFO[role].color }}
                    aria-label={`${label}, zone ${p.zone}. Use arrow keys to move.`}
                    onKeyDown={onKey(p.id, p.zone)}
                    onPointerDown={(e) => { drag.current = p.id; (e.target as HTMLElement).setPointerCapture?.(e.pointerId) }}
                    onPointerMove={(e) => { if (drag.current === p.id) move(p.id, p.zone, toSpot(e)) }}
                    onPointerUp={() => { drag.current = null }}>
                    <b>{num || p.id}</b>{num && <i>{p.id}</i>}
                  </button>
                )
              })}
            </div>
            {violations.length > 0 && (
              <div className="overlap-alert" role="alert">
                <strong>Overlap rule</strong>
                <ul>{violations.map((v) => <li key={v}>{v}</li>)}</ul>
                <span>At the moment of the serve this is a fault. Move a player back, or reset this rotation.</span>
              </div>
            )}
          </section>
          <section className="card">
            <label htmlFor="coach-note" className="eyebrow">Note to players · rotation {n(rotation)} · {situation === 'serve' ? 'we serve' : 'receive'}</label>
            <textarea id="coach-note" rows={3} maxLength={400} value={noteFor(pb, rotation, situation)}
              placeholder="e.g. Setter hides behind the right passer and releases on contact."
              onChange={(e) => update(setNote(pb, rotation, situation, e.target.value))} />
          </section>
        </main>

        <aside className="coach-side">
          <section className="card" aria-label="Playbook">
            <h2>Playbook · {situation === 'serve' ? 'We serve' : 'Receive'}</h2>
            <div className="pb-grid">
              {[0, 1, 2, 3, 4, 5].map((r) => {
                const st = playbookStatus(pb, r, situation)
                const sp = spotsFor(pb, r, situation)
                return (
                  <button key={r} type="button" className={`pb-cell${r === rotation ? ' pb-cell--on' : ''}`} onClick={() => setRotation(r)} aria-label={`Rotation ${n(r)}, ${st}`}>
                    <span className="pb-mini">
                      {playersAt(pb.system, r).map((p) => { const a = pct(sp[p.id]); return <i key={p.id} style={{ left: `${a.left}%`, top: `${a.top}%`, background: ROLE_INFO[p.role].color }} /> })}
                    </span>
                    <span className={`pb-status pb-status--${st}`}>R{n(r)} · {st === 'overlap' ? 'OVERLAP' : st === 'custom' ? 'CUSTOM ✓' : 'DEFAULT'}</span>
                  </button>
                )
              })}
            </div>
          </section>
          <section className="card">
            <h2>Share with the team</h2>
            <p className="hint">The whole playbook is inside this link. Send it again after you change something.</p>
            <input className="share-input" readOnly aria-label="Share link" value={link} onFocus={(e) => e.target.select()} />
            <button type="button" className="play-btn" onClick={() => { void navigator.clipboard?.writeText(link); setCopied(true) }}>{copied ? 'Copied ✓' : 'Copy link'}</button>
            <a className="ghost-btn" href={link}>Open player view</a>
            <button type="button" className="ghost-btn" disabled={exporting} onClick={() => runExport(() => exporter.downloadPlaybookImage(pb))}>Download image</button>
            <p className="hint">One landscape PNG of the whole playbook: every rotation with Lineup, Serve and Receive, placed like the zones on the court.</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
