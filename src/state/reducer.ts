import type { Attack, Phase, SystemKey } from '../domain/types'

export interface State {
  system: SystemKey
  rotation: number
  phase: Phase
  attack: Attack
  libero: boolean
  playing: boolean
  speed: number
  /** Player id being followed ("Pick your position"), or null for everyone. */
  follow: string | null
}

export type Action =
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'jump'; rotation: number }
  | { type: 'system'; system: SystemKey }
  | { type: 'phase'; phase: Phase }
  | { type: 'attack'; attack: Attack }
  | { type: 'libero'; on: boolean }
  | { type: 'toggle' }
  | { type: 'speed'; speed: number }
  | { type: 'follow'; id: string | null }

export const SPEED_MIN = 0.25
export const SPEED_MAX = 2
export const BASE_MOVE_MS = 950
export const BASE_TICK_MS = 2600

export function initialState(system: SystemKey = '5-1'): State {
  return { system, rotation: 0, phase: 'lineup', attack: 'right', libero: true, playing: true, speed: 1, follow: null }
}

const wrap = (n: number) => ((n % 6) + 6) % 6

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case 'next': return { ...s, rotation: wrap(s.rotation + 1) }
    case 'prev': return { ...s, rotation: wrap(s.rotation - 1) }
    case 'jump': return { ...s, rotation: wrap(a.rotation) }
    case 'system': return { ...s, system: a.system, rotation: 0, follow: null }
    case 'phase': return { ...s, phase: a.phase }
    case 'attack': return { ...s, attack: a.attack }
    case 'libero': return { ...s, libero: a.on }
    case 'toggle': return { ...s, playing: !s.playing }
    case 'follow': return { ...s, follow: a.id }
    case 'speed': return { ...s, speed: Math.min(SPEED_MAX, Math.max(SPEED_MIN, a.speed)) }
  }
}
