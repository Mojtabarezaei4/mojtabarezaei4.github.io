import type { PlacedPlayer } from '../domain/place'
import { ROLE_INFO, SYSTEMS } from '../domain/systems'
import type { Phase, SystemKey, Zone } from '../domain/types'
import { PHASE_TEXT, RECEIVE_6_6, SWITCH_6_6 } from './copy'

export function PhaseCard({ phase, system, summary }: { phase: Phase; system: SystemKey; summary: string }) {
  const t = PHASE_TEXT[phase]
  const text = system === '6-6' && phase === 'switch' ? SWITCH_6_6 : system === '6-6' && phase === 'receive' ? RECEIVE_6_6 : t.text
  return (
    <section className="card phase-card" aria-label="What is happening">
      <h2>{t.title}</h2>
      <p>{text}</p>
      <p className="summary">{summary}</p>
    </section>
  )
}

export function legendFor(system: SystemKey, libero: boolean) {
  return SYSTEMS[system].legend
    .filter((r) => r !== 'L' || libero)
    .map((r) => system === '6-6' && r === 'S'
      ? { code: 'P3', color: ROLE_INFO.S.color, name: 'Setter this rally', job: 'Whoever stands in zone 3 sets.' }
      : { code: r, ...ROLE_INFO[r] })
}

export function Legend({ system, libero }: { system: SystemKey; libero: boolean }) {
  return (
    <section className="card legend" aria-label="Who's who">
      <h2>Who's who</h2>
      <ul>
        {legendFor(system, libero).map((r) => (
          <li key={r.code}>
            <span className="legend-disc" style={{ background: r.color }}>{r.code}</span>
            <div><strong>{r.name}</strong><span className="legend-job">{r.job}</span></div>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function RotationInfo({ players }: { players: PlacedPlayer[] }) {
  const at = (z: Zone) => players.find((p) => p.zone === z)!
  const Row = ({ zones, label }: { zones: Zone[]; label: string }) => (
    <div className="row-info">
      <span className="eyebrow">{label}</span>
      <div>{zones.map((z) => <span key={z} style={{ background: at(z).show.color }}>{at(z).show.code}</span>)}</div>
    </div>
  )
  return (
    <section className="card rot-info" aria-label="In this rotation">
      <h2>In this rotation</h2>
      <Row zones={[4, 3, 2]} label="FRONT ROW · 4 3 2" />
      <Row zones={[5, 6, 1]} label="BACK ROW · 5 6 1" />
    </section>
  )
}
