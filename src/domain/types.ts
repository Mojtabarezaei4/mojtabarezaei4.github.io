export type SystemKey = '5-1' | '6-2' | '4-2' | '6-6'
export type Role = 'S' | 'OH' | 'MB' | 'OPP' | 'L' | 'P'
export type Zone = 1 | 2 | 3 | 4 | 5 | 6
export type Phase = 'lineup' | 'serve' | 'receive' | 'switch' | 'defense'
export type Attack = 'left' | 'middle' | 'right'
export type Slot = 'FL' | 'FM' | 'FR' | 'BL' | 'BM' | 'BR'
export type Tag = 'SERVE' | 'PASS' | 'SETS' | 'BLOCK' | 'TIP' | 'LINE' | 'CROSS' | 'DIG' | 'DEEP'

/** A point on our half: x 0..9 left→right, d = meters from the net (0 = net, 9 = end line). */
export interface Spot {
  x: number
  d: number
}

export interface Player {
  /** Stable identity = the code in the starting lineup. */
  id: string
  code: string
  role: Role
  startZone: Zone
  zone: Zone
  front: boolean
}

export const ZONES: Zone[] = [1, 2, 3, 4, 5, 6]
export const SYSTEM_KEYS: SystemKey[] = ['6-6', '5-1', '6-2', '4-2']
