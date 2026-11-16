import type { Phase, Player, Role, SystemKey } from './types'

/**
 * What the player looks like on court. The libero (not in 6-6) replaces the back-row
 * middle; in zone 1 the middle stays on to serve during Lineup and Serve.
 */
export function displayRole(p: Player, system: SystemKey, phase: Phase, libero: boolean): { role: Role; code: string } {
  const servingMiddle = p.zone === 1 && (phase === 'lineup' || phase === 'serve')
  if (system !== '6-6' && libero && p.role === 'MB' && !p.front && !servingMiddle) return { role: 'L', code: 'L' }
  return { role: p.role, code: p.code }
}

/** Who takes the second touch this rally. */
export function setsThisRally(p: Player, system: SystemKey): boolean {
  if (system === '6-6') return p.zone === 3
  if (p.role !== 'S') return false
  if (system === '5-1') return true
  if (system === '6-2') return !p.front
  return p.front // 4-2
}
