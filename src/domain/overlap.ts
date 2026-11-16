import type { Spot, Zone } from './types'

const ROWS: [Zone, Zone][] = [[4, 3], [3, 2], [5, 6], [6, 1]]
const PAIRS: [Zone, Zone][] = [[4, 5], [3, 6], [2, 1]]

/** Overlap rule at the moment of serve. Empty array = legal. */
export function overlapViolations(spots: Record<Zone, Spot>): string[] {
  const out: string[] = []
  for (const [l, r] of ROWS) if (!(spots[l].x < spots[r].x)) out.push(`zone ${l} must be left of zone ${r}`)
  for (const [f, b] of PAIRS) if (!(spots[f].d < spots[b].d)) out.push(`zone ${f} must be in front of zone ${b}`)
  return out
}
