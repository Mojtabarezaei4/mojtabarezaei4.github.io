import { BASE, SWITCH_SPOT, slotOf } from './formations'
import type { PlacedPlayer } from './place'
import { receiveSpots } from './receive'
import { displayRole, setsThisRally } from './roles'
import { playersAt } from './rotation'
import { ROLE_INFO } from './systems'
import type { Attack, Player, Spot, SystemKey, Tag } from './types'

export interface P3 { x: number; d: number; z: number }
export interface BallFlight { from: P3; to: P3; peak: number }

export const RALLY_STEPS = [
  { key: 'serve', label: 'Serve' },
  { key: 'pass', label: 'Pass' },
  { key: 'set', label: 'Set' },
  { key: 'attack', label: 'Attack' },
  { key: 'base', label: 'Base' },
] as const

export interface RallyFrame {
  players: PlacedPlayer[]
  ball: BallFlight | null
  caption: string
  passer: string
  setter: string
  attacker: string
}

// The camera sees only a little of the other side, so the serve enters from just beyond the net
// and all arcs stay low enough to remain in the picture.
const SERVER: P3 = { x: 4.5, d: -3.8, z: 2.7 }
const APPROACH: Spot = { x: 1.0, d: 3.6 }
const HIT: Spot = { x: 1.3, d: 0.6 }
const LANDING: P3 = { x: 6.5, d: -5.5, z: 0 }

/** One step of a side-out rally (the other team serves, we pass–set–attack, then return to base). */
export function rallyStep(s: { system: SystemKey; rotation: number; attack: Attack; libero: boolean }, step: number): RallyFrame {
  const { system } = s
  const players = playersAt(system, s.rotation)
  const rec = receiveSpots(system, s.rotation)
  const setter = players.find((p) => setsThisRally(p, system))!
  const attacker = system === '6-6' ? players.find((p) => p.zone === 4)! : players.find((p) => p.role === 'OH' && p.front)!
  const passers = players.filter((p) => rec.passers.has(p.id) && p.id !== attacker.id)
    .sort((a, b) => rec.spots[a.id].x - rec.spots[b.id].x)
  const passer = passers[Math.floor(passers.length / 2)]
  const target: Spot = system === '6-6' ? { x: 4.5, d: 0.9 } : SWITCH_SPOT.SET
  const base = (p: Player): Spot => (system === '6-6' ? BASE[p.zone] : p.id === setter.id ? target : SWITCH_SPOT[slotOf(p, system)])

  const spotAt = (p: Player): Spot => {
    if (step === 0) return rec.spots[p.id]
    if (step === 4) return base(p)
    if (p.id === setter.id) return target
    if (p.id === attacker.id) return step === 1 ? APPROACH : HIT
    if (p.front) {
      // other front-row hitters approach too (decoys)
      const mid = p.role === 'MB' || p.zone === 3
      if (mid) return step === 1 ? { x: 4.5, d: 3.0 } : { x: 5.0, d: 0.8 }
      return step === 1 ? { x: 8.0, d: 3.4 } : { x: 7.8, d: 1.2 }
    }
    return base(p)
  }

  const raw = players.map((p) => ({ p, spot: spotAt(p) }))
  const hit = spotAt(attacker)
  const coverers = step === 3
    ? raw.filter(({ p }) => p.id !== attacker.id && p.id !== setter.id)
        .sort((a, b) => dist(a.spot, hit) - dist(b.spot, hit)).slice(0, 2).map(({ p }) => p.id)
    : []

  const tagFor = (p: Player): Tag | undefined => {
    if (step === 0) return p.id === passer.id ? 'PASS' : rec.passers.has(p.id) ? 'PASS' : undefined
    if (step === 1) return p.id === passer.id ? 'PASS' : p.id === setter.id ? 'SETS' : undefined
    if (step === 2) return p.id === setter.id ? 'SETS' : undefined
    if (step === 3) return p.id === attacker.id ? 'ATTACK' : coverers.includes(p.id) ? 'COVER' : undefined
    return undefined
  }

  const placed: PlacedPlayer[] = raw.map(({ p, spot }) => {
    const d = displayRole(p, system, 'rally', s.libero)
    const color = ROLE_INFO[system === '6-6' && p.zone === 3 ? 'S' : d.role].color
    return { ...p, show: { ...d, color }, spot, home: BASE[p.zone], tag: tagFor(p) }
  })
  const code = (id: string) => placed.find((p) => p.id === id)!.show.code
  const ps = rec.spots[passer.id]
  const flights: (BallFlight | null)[] = [
    { from: SERVER, to: { x: ps.x, d: ps.d, z: 0.9 }, peak: 3.1 },
    { from: { x: ps.x, d: ps.d, z: 0.9 }, to: { x: target.x, d: target.d, z: 2.6 }, peak: 3.9 },
    { from: { x: target.x, d: target.d, z: 2.6 }, to: { x: HIT.x, d: HIT.d, z: 3.0 }, peak: 4.1 },
    { from: { x: HIT.x, d: HIT.d, z: 3.0 }, to: LANDING, peak: 3.05 },
    null,
  ]
  const P = code(passer.id), S = code(setter.id), A = code(attacker.id)
  const captions = [
    `The other team serves. ${P} gets ready to pass.`,
    `${P} passes the ball to the target near the net. ${S} gets there to set.`,
    `${S} sets the ball high to ${A} on the left. The other front-row hitters approach too, so the blockers can't guess.`,
    `${A} attacks over the net. ${coverers.map(code).join(' and ')} cover in case the ball is blocked back.`,
    'The ball is over. Everyone goes back to their base spots, ready to defend.',
  ]
  return { players: placed, ball: flights[step] ?? null, caption: captions[step], passer: passer.id, setter: setter.id, attacker: attacker.id }
}

const dist = (a: Spot, b: Spot) => Math.hypot(a.x - b.x, a.d - b.d)
