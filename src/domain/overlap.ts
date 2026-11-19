import type { Spot, Zone } from './types'

const ROWS: [Zone, Zone][] = [[4, 3], [3, 2], [5, 6], [6, 1]]
const PAIRS: [Zone, Zone][] = [[4, 5], [3, 6], [2, 1]]

export interface OverlapPair {
  a: Zone
  b: Zone
  /** left: zone a must be left of zone b · front: zone a must be in front of zone b */
  kind: 'left' | 'front'
}

/** Overlap rule at the moment of serve. `exempt` skips one zone (the server, who may stand anywhere behind the end line). */
export function overlapPairs(spots: Record<Zone, Spot>, exempt?: Zone): OverlapPair[] {
  const out: OverlapPair[] = []
  for (const [a, b] of ROWS) if (a !== exempt && b !== exempt && !(spots[a].x < spots[b].x)) out.push({ a, b, kind: 'left' })
  for (const [a, b] of PAIRS) if (a !== exempt && b !== exempt && !(spots[a].d < spots[b].d)) out.push({ a, b, kind: 'front' })
  return out
}

/** Empty array = legal. */
export function overlapViolations(spots: Record<Zone, Spot>, exempt?: Zone): string[] {
  return overlapPairs(spots, exempt).map(({ a, b, kind }) => (kind === 'left' ? `zone ${a} must be left of zone ${b}` : `zone ${a} must be in front of zone ${b}`))
}
