import type { Attack, Phase } from '../domain/types'
import { courtGeometry, type Seg } from './projection'

const G = courtGeometry()
const L = ({ s, ...rest }: { s: Seg } & React.SVGProps<SVGLineElement>) => <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} {...rest} />

interface Props {
  phase: Phase
  attack: Attack
  showPath: boolean
}

/** Our half of the court seen from behind our end line, net at the top. */
export function Court({ phase, attack, showPath }: Props) {
  const a = G.attacks[attack]
  return (
    <svg className="court-svg" viewBox="0 0 1000 860" role="img" aria-label="Your half of the court seen from behind your end line, net at the top">
      <defs>
        <marker id="arw" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1 L9 5 L1 9 z" fill="#FFB24D" /></marker>
        <marker id="arwR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1 L9 5 L1 9 z" fill="#FF6F59" /></marker>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0B0E12" /><stop offset="1" stopColor="#121821" /></linearGradient>
      </defs>
      <rect width="1000" height="860" fill="url(#fade)" />
      {phase !== 'receive' && phase !== 'defense' && <text x="500" y="36" textAnchor="middle" className="svg-label" fill="#8A949F">OPPONENT SIDE · NOT SHOWN</text>}
      <polygon points={G.free} fill="#1E3A57" />
      <polygon points={G.court} fill="#2E5E8E" />
      <polygon points={G.front} fill="#336898" />
      {G.dividers.map((s, i) => <L key={i} s={s} stroke="rgba(237,232,223,.3)" strokeWidth={2} strokeDasharray="8 8" />)}
      <L s={G.attackLine} stroke="#EDE8DF" strokeWidth={4} />
      {G.attackExt.map((s, i) => <L key={i} s={s} stroke="#EDE8DF" strokeWidth={3} strokeDasharray="10 9" />)}
      <polygon points={G.court} fill="none" stroke="#EDE8DF" strokeWidth={5} strokeLinejoin="round" />
      {G.numerals.map((n) => (
        <text key={n.n} transform={`translate(${n.x} ${n.y}) scale(1 .55)`} className="svg-numeral" style={{ fontSize: n.fs }} fill={n.n === 1 ? 'rgba(255,178,77,.75)' : 'rgba(237,232,223,.42)'}>{n.n}</text>
      ))}
      {phase === 'receive' && (
        <g>
          <polygon points={G.band} fill="rgba(92,225,230,.13)" stroke="#5CE1E6" strokeOpacity={0.6} strokeWidth={2} strokeDasharray="6 8" />
          <text x={G.bandLabel.x} y={G.bandLabel.y} className="svg-label" fill="#5CE1E6">PASSING LINE</text>
          <text x="500" y="36" textAnchor="middle" className="svg-label svg-label--strong" fill="#FFB24D">↓ OPPONENT SERVES ↓</text>
        </g>
      )}
      {phase === 'defense' && (
        <g>
          <L s={a.line} stroke="#FF6F59" strokeWidth={3} strokeDasharray="10 8" markerEnd="url(#arwR)" opacity={0.85} />
          <L s={a.cross} stroke="#FF6F59" strokeWidth={3} strokeDasharray="10 8" markerEnd="url(#arwR)" opacity={0.85} />
          <circle cx={a.ball.x} cy={a.ball.y} r={11} fill="#EDE8DF" stroke="#FF6F59" strokeWidth={3} />
          <text x={a.ball.x + (attack === 'left' ? 20 : -20)} y={a.ball.y + 5} textAnchor={attack === 'left' ? 'start' : 'end'} className="svg-label svg-label--strong" fill="#FF6F59">ATTACK</text>
        </g>
      )}
      {showPath && <path d={G.loop} fill="none" stroke="#FFB24D" strokeOpacity={0.55} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" markerMid="url(#arw)" />}
      <polygon points={G.netShadow} fill="rgba(0,0,0,.28)" />
      {G.posts.map((s, i) => <L key={i} s={s} stroke="#9AA3AE" strokeWidth={7} strokeLinecap="round" />)}
      <polygon points={G.net} fill="rgba(15,19,24,.55)" />
      <path d={G.mesh} stroke="rgba(237,232,223,.28)" strokeWidth={1} />
      <L s={G.tape} stroke="#EDE8DF" strokeWidth={5} />
      <L s={G.bottomTape} stroke="#EDE8DF" strokeWidth={2} />
      {G.antennae.map((s, i) => (
        <g key={i}>
          <L s={s} stroke="#E63946" strokeWidth={4} strokeDasharray="7 7" />
          <L s={s} stroke="#EDE8DF" strokeWidth={4} strokeDasharray="7 7" strokeDashoffset={7} />
        </g>
      ))}
      <text x={G.endLabel.x} y={G.endLabel.y} textAnchor="middle" className="svg-label" fill="#9AA3AE">YOUR END LINE</text>
    </svg>
  )
}
