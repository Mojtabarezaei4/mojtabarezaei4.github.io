import { BASE, spotFor } from './formations'
import { receiveSpots } from './receive'
import { displayRole, setsThisRally } from './roles'
import { playersAt } from './rotation'
import { ROLE_INFO } from './systems'
import type { Attack, Phase, Player, Role, Spot, SystemKey, Tag } from './types'

export interface PlacedPlayer extends Player {
  show: { role: Role; code: string; color: string }
  spot: Spot
  home: Spot
  tag?: Tag
}

export interface Scene {
  system: SystemKey
  rotation: number
  phase: Phase
  attack: Attack
  libero: boolean
}

/** Single entry point for the view: every player with look, spot and tag. */
export function placePlayers(s: Scene): PlacedPlayer[] {
  const rec = s.phase === 'receive' ? receiveSpots(s.system, s.rotation) : null
  return playersAt(s.system, s.rotation).map((p) => {
    const d = displayRole(p, s.system, s.phase, s.libero)
    const setter = s.system === '6-6' && p.zone === 3
    const color = ROLE_INFO[setter ? 'S' : d.role].color
    let spot: Spot
    let tag: Tag | undefined
    if (rec) {
      spot = rec.spots[p.id]
      tag = rec.passers.has(p.id) ? 'PASS' : setsThisRally(p, s.system) ? 'SETS' : undefined
    } else {
      const f = spotFor(p, { system: s.system, phase: s.phase as Exclude<Phase, 'receive'>, attack: s.attack })
      spot = f.spot
      tag = f.tag
    }
    return { ...p, show: { ...d, color }, spot, home: BASE[p.zone], tag }
  })
}
