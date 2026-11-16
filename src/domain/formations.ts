import { setsThisRally } from "./roles"
import type { Attack, Phase, Player, Slot, Spot, SystemKey, Tag, Zone } from "./types"

/** Official zone spots used for Lineup. */
export const BASE: Record<Zone, Spot> = {
  4: { x: 1.5, d: 2.0 }, 3: { x: 4.5, d: 2.0 }, 2: { x: 7.5, d: 2.0 },
  5: { x: 1.5, d: 6.4 }, 6: { x: 4.5, d: 6.4 }, 1: { x: 7.5, d: 6.4 },
}

export const SERVE_SPOT: Spot = { x: 7.6, d: 10.5 }

/** Specialist spots after the switch. SET = setting target near the net, right of centre. */
export const SWITCH_SPOT: Record<Slot | 'SET', Spot> = {
  FL: { x: 1.1, d: 1.5 }, FM: { x: 4.5, d: 1.1 }, FR: { x: 7.9, d: 1.5 }, SET: { x: 6.1, d: 0.9 },
  BL: { x: 1.8, d: 6.9 }, BM: { x: 4.5, d: 7.7 }, BR: { x: 7.2, d: 6.9 },
}

/** Perimeter defense; attack side as seen on screen. */
export const DEFENSE: Record<Attack, Record<Slot, { spot: Spot; job: Tag }>> = {
  right: {
    FR: { spot: { x: 7.5, d: 0.4 }, job: 'BLOCK' }, FM: { spot: { x: 6.5, d: 0.4 }, job: 'BLOCK' }, FL: { spot: { x: 1.4, d: 3.4 }, job: 'TIP' },
    BL: { spot: { x: 1.1, d: 6.6 }, job: 'CROSS' }, BM: { spot: { x: 4.5, d: 8.4 }, job: 'DEEP' }, BR: { spot: { x: 8.3, d: 6.2 }, job: 'LINE' },
  },
  middle: {
    FM: { spot: { x: 4.5, d: 0.4 }, job: 'BLOCK' }, FL: { spot: { x: 1.4, d: 3.2 }, job: 'TIP' }, FR: { spot: { x: 7.6, d: 3.2 }, job: 'TIP' },
    BL: { spot: { x: 1.2, d: 6.8 }, job: 'DIG' }, BM: { spot: { x: 4.5, d: 8.4 }, job: 'DEEP' }, BR: { spot: { x: 7.8, d: 6.8 }, job: 'DIG' },
  },
  left: {
    FL: { spot: { x: 1.5, d: 0.4 }, job: 'BLOCK' }, FM: { spot: { x: 2.5, d: 0.4 }, job: 'BLOCK' }, FR: { spot: { x: 7.6, d: 3.4 }, job: 'TIP' },
    BR: { spot: { x: 7.9, d: 6.6 }, job: 'CROSS' }, BM: { spot: { x: 4.5, d: 8.4 }, job: 'DEEP' }, BL: { spot: { x: 0.7, d: 6.2 }, job: 'LINE' },
  },
}

const ZONE_SLOT: Record<Zone, Slot> = { 4: 'FL', 3: 'FM', 2: 'FR', 5: 'BL', 6: 'BM', 1: 'BR' }

/** Specialist slot: hitters to their side, middles to the middle, setters/opposites right. 6-6 keeps its zone. */
export function slotOf(p: Player, system: SystemKey): Slot {
  if (system === '6-6') return ZONE_SLOT[p.zone]
  if (p.role === 'OH') return p.front ? 'FL' : 'BL'
  if (p.role === 'MB') return p.front ? 'FM' : 'BM'
  return p.front ? 'FR' : 'BR'
}

export interface FormationCtx {
  system: SystemKey
  phase: Exclude<Phase, 'receive'>
  attack: Attack
}

export function spotFor(p: Player, ctx: FormationCtx): { spot: Spot; tag?: Tag } {
  const { system, phase } = ctx
  if (phase === 'defense') {
    const d = DEFENSE[ctx.attack][slotOf(p, system)]
    return { spot: d.spot, tag: d.job }
  }
  if (phase === 'switch') {
    const sets = setsThisRally(p, system)
    if (system === '6-6') return sets ? { spot: BASE[p.zone], tag: 'SETS' } : { spot: BASE[p.zone] }
    if (sets) return { spot: SWITCH_SPOT.SET, tag: 'SETS' }
    return { spot: SWITCH_SPOT[slotOf(p, system)] }
  }
  if (p.zone === 1) return phase === 'serve' ? { spot: SERVE_SPOT, tag: 'SERVE' } : { spot: BASE[1], tag: 'SERVE' }
  return { spot: BASE[p.zone] }
}
