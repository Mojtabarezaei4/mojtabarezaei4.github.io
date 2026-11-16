import { describe, expect, test } from 'vitest'
import { playersAt, rotZone } from '../../src/domain/rotation'
import type { SystemKey } from '../../src/domain/types'

const SYSTEMS: SystemKey[] = ['5-1', '6-2', '4-2', '6-6']

describe('rotZone', () => {
  test('moves clockwise one step: 2→1 and 1→6', () => {
    expect(rotZone(2, 1)).toBe(1)
    expect(rotZone(1, 1)).toBe(6)
  })
  test('six steps is a full turn', () => {
    expect(rotZone(3, 6)).toBe(3)
  })
})

describe('playersAt', () => {
  const setterZone = (r: number) => playersAt('5-1', r).find((p) => p.code === 'S')!.zone
  test('5-1 setter goes 1 → 6 → … → 2', () => {
    expect(setterZone(0)).toBe(1)
    expect(setterZone(1)).toBe(6)
    expect(setterZone(5)).toBe(2)
  })
  test('every rotation of every system fills zones 1..6 exactly once', () => {
    for (const s of SYSTEMS)
      for (let r = 0; r < 6; r++)
        expect(playersAt(s, r).map((p) => p.zone).sort()).toEqual([1, 2, 3, 4, 5, 6])
  })
  test('player order is stable across rotations', () => {
    expect(playersAt('5-1', 3).map((p) => p.id)).toEqual(playersAt('5-1', 0).map((p) => p.id))
  })
  test('front flag is true only in zones 2-4', () => {
    for (const p of playersAt('6-2', 2)) expect(p.front).toBe(p.zone >= 2 && p.zone <= 4)
  })
})
