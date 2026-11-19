import { ROLE_INFO } from '../domain/systems'
import type { Role, SystemKey } from '../domain/types'
import { Ball } from './PlayerScreen'

interface Card {
  key: SystemKey
  n: string
  badge: string
  badgeKind: 'go' | 'plain' | 'accent'
  sub: string
  front: [string, Role][]
  back: [string, Role][]
  text: string
}
const P = (c: string, r: Role): [string, Role] => [c, r]
const CARDS: Card[] = [
  { key: '6-6', n: '01', badge: 'START HERE', badgeKind: 'go', sub: 'Everyone does everything', front: [P('P4', 'P'), P('P3', 'S'), P('P2', 'P')], back: [P('P5', 'P'), P('P6', 'P'), P('P1', 'P')], text: 'No fixed roles. Whoever rotates into zone 3 sets that rally. Great for learning the zones themselves.' },
  { key: '5-1', n: '02', badge: 'MOST COMMON', badgeKind: 'accent', sub: '5 hitters · 1 setter', front: [P('OPP', 'OPP'), P('MB2', 'MB'), P('OH1', 'OH')], back: [P('OH2', 'OH'), P('MB1', 'MB'), P('S', 'S')], text: 'One setter sets in all six rotations. The opposite stands across from them. Front row has 2 or 3 attackers.' },
  { key: '6-2', n: '03', badge: 'INTERMEDIATE', badgeKind: 'plain', sub: '6 hitters · 2 setters', front: [P('S2', 'S'), P('MB1', 'MB'), P('OH1', 'OH')], back: [P('OH2', 'OH'), P('MB2', 'MB'), P('S1', 'S')], text: 'Two setters stand opposite each other. The one in the back row sets, so three attackers are always at the net.' },
  { key: '4-2', n: '04', badge: 'RECREATIONAL', badgeKind: 'plain', sub: '4 hitters · 2 setters', front: [P('S2', 'S'), P('MB1', 'MB'), P('OH1', 'OH')], back: [P('OH2', 'OH'), P('MB2', 'MB'), P('S1', 'S')], text: 'Same lineup as a 6-2, flipped: the front-row setter sets, so only two attackers are up front.' },
]
const LEGEND: Role[] = ['S', 'OH', 'MB', 'OPP', 'L']
const Disc = ({ code, role }: { code: string; role: Role }) => <span className="mini-disc" style={{ background: ROLE_INFO[role].color }}>{code}</span>

export function PickerScreen() {
  return (
    <div className="picker">
      <header className="picker-head">
        <span className="brand"><Ball /><span>VOLLEYROT</span></span>
        <a className="coach-link" href="#/coach">Coach view →</a>
      </header>

      <section className="hero">
        <div className="hero-text">
          <span className="eyebrow eyebrow--accent">STEP 1 OF 2 — PICK A SYSTEM</span>
          <h1>Six players.<br />Six spots.<br /><span>One clockwise turn.</span></h1>
          <p>Every time your team wins the serve back, everybody moves one spot clockwise. The <em>system</em> decides who sets and who attacks as the team turns. Pick one and watch it play out.</p>
        </div>
        <div className="card zone-map">
          <span className="eyebrow">ZONE MAP · YOUR HALF</span>
          <div className="zone-grid" aria-label="Zones: front row 4, 3, 2; back row 5, 6, 1" role="img">
            {[4, 3, 2, 5, 6, 1].map((z) => <span key={z} className={z === 1 ? 'z1' : undefined}>{z}</span>)}
          </div>
          <p>Net at the top. Zones 4-3-2 are the front row, 5-6-1 the back row. <strong>Zone 1 serves.</strong> Rotating moves 2→1→6→5→4→3→2.</p>
        </div>
      </section>

      <section className="path">
        <div className="section-head"><h2>Learning path</h2><span>Start with 6-6, then the system most teams run</span></div>
        <div className="cards">
          {CARDS.map((c) => (
            <a key={c.key} className={`sys-card${c.badgeKind === 'accent' ? ' sys-card--accent' : ''}`} href={`#/play?system=${c.key}`}>
              <div className="sys-top"><span className="eyebrow">{c.n}</span><span className={`badge badge--${c.badgeKind}`}>{c.badge}</span></div>
              <div><span className="sys-n">{c.key}</span><span className="sys-sub">{c.sub}</span></div>
              <div className="mini-court" aria-hidden="true">
                <div>{c.front.map(([code, r]) => <Disc key={code} code={code} role={r} />)}</div>
                <div>{c.back.map(([code, r]) => <Disc key={code} code={code} role={r} />)}</div>
              </div>
              <p>{c.text}</p>
              <span className="sys-go">Watch it rotate →</span>
            </a>
          ))}
        </div>
      </section>

      <section className="path" aria-label="Who's who">
        <div className="section-head"><h2>Who's who</h2></div>
        <div className="picker-legend">
          {LEGEND.map((r) => (
            <div key={r}><span className="legend-disc" style={{ background: ROLE_INFO[r].color }}>{r}</span><div><strong>{ROLE_INFO[r].name}</strong><span className="legend-job">{ROLE_INFO[r].job}</span></div></div>
          ))}
        </div>
      </section>
    </div>
  )
}
