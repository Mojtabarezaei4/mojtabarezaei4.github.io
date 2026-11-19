import { CHART_5_1 } from './chart51'
import { setsThisRally } from './roles'
import { playersAt } from './rotation'
import type { Player, Spot, SystemKey, Zone } from './types'

const COL: Record<Zone, number> = { 4: 0, 5: 0, 3: 1, 6: 1, 2: 2, 1: 2 }
const PASS_X = [1.8, 4.5, 7.2]
const NET_X: Partial<Record<Zone, number>> = { 4: 1.3, 3: 4.5, 2: 7.7 }
const DEEP_X: Partial<Record<Zone, number>> = { 5: 1.4, 6: 4.5, 1: 7.8 }
const PARTNER: Partial<Record<Zone, Zone>> = { 1: 2, 6: 3, 5: 4 }
const W_6_6: Record<Zone, Spot> = {
  3: { x: 4.5, d: 1.0 }, 4: { x: 1.4, d: 4.2 }, 2: { x: 7.6, d: 4.2 },
  6: { x: 4.5, d: 5.8 }, 5: { x: 1.8, d: 7.6 }, 1: { x: 7.2, d: 7.6 },
}

/**
 * Serve-receive spots keyed by Player.id. Rule-based: both outside hitters and the
 * back-row middle (libero) form a 3-person passing line; front non-passers stack at
 * the net; the back setter tucks behind their front partner; a correction pass then
 * enforces the overlap rule. 6-6 uses a 5-person W with zone 3 at the net.
 */
export function receiveSpots(system: SystemKey, rotation: number): { spots: Record<string, Spot>; passers: Set<string> } {
  const players = playersAt(system, rotation)
  const byZone = Object.fromEntries(players.map((p) => [p.zone, p])) as Record<Zone, Player>
  const spots: Record<string, Spot> = {}
  const passers = new Set<string>()

  if (system === '5-1') {
    const chart = CHART_5_1[players.find((p) => p.role === 'S')!.zone].receive
    for (const p of players) {
      spots[p.id] = { ...chart[p.id] }
      if (p.role === 'OH' || (p.role === 'MB' && !p.front)) passers.add(p.id)
    }
    return { spots, passers }
  }

  if (system === '6-6') {
    for (const p of players) {
      spots[p.id] = { ...W_6_6[p.zone] }
      if (p.zone !== 3) passers.add(p.id)
    }
    return { spots, passers }
  }

  const passing = players
    .filter((p) => p.role === 'OH' || (p.role === 'MB' && !p.front))
    .sort((a, b) => COL[a.zone] - COL[b.zone] || Number(a.front) - Number(b.front))
  passing.forEach((p, i) => {
    spots[p.id] = { x: PASS_X[i], d: p.front ? 5.4 : 6.4 }
    passers.add(p.id)
  })
  for (const p of players) if (!spots[p.id] && p.front) spots[p.id] = { x: NET_X[p.zone]!, d: 1.0 }
  for (const p of players) {
    if (spots[p.id]) continue
    if (setsThisRally(p, system)) {
      const partnerD = spots[byZone[PARTNER[p.zone]!].id].d
      spots[p.id] = { x: DEEP_X[p.zone]!, d: Math.min(partnerD + 1.3, 8.2) }
    } else spots[p.id] = { x: DEEP_X[p.zone]!, d: 8.0 }
  }

  // Overlap correction: left/right order within rows, then front ahead of back.
  for (const row of [[4, 3, 2], [5, 6, 1]] as Zone[][])
    for (let i = 1; i < 3; i++) {
      const a = spots[byZone[row[i - 1]].id], b = spots[byZone[row[i]].id]
      if (b.x < a.x + 0.6) b.x = a.x + 0.6
    }
  for (const [f, k] of [[4, 5], [3, 6], [2, 1]] as [Zone, Zone][]) {
    const front = spots[byZone[f].id], back = spots[byZone[k].id]
    if (back.d < front.d + 0.6) back.d = front.d + 0.6
  }
  return { spots, passers }
}
