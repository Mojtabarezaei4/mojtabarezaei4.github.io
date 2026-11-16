import { SYSTEMS } from './systems'
import { ZONES, type Player, type Role, type SystemKey, type Zone } from './types'

/** Zone after `steps` clockwise rotations: 2→1, 1→6, 6→5, 5→4, 4→3, 3→2. */
export function rotZone(z: Zone, steps: number): Zone {
  const n = ((steps % 6) + 6) % 6
  let out = z
  for (let i = 0; i < n; i++) out = (out === 1 ? 6 : out - 1) as Zone
  return out
}

/** Players for rotation 0–5, always in start-zone order 1..6. */
export function playersAt(system: SystemKey, rotation: number): Player[] {
  const start = SYSTEMS[system].start
  return ZONES.map((startZone) => {
    const code = start[startZone]
    const zone = rotZone(startZone, rotation)
    return { id: code, code, role: code.replace(/\d/g, '') as Role, startZone, zone, front: zone >= 2 && zone <= 4 }
  })
}
