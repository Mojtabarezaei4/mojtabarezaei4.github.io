import { describe, expect, test } from 'vitest'
import { BASE, SERVE_SPOT, SWITCH_SPOT, slotOf, spotFor } from '../../src/domain/formations'
import { playersAt } from '../../src/domain/rotation'
import type { Attack, SystemKey } from '../../src/domain/types'

const find = (s: SystemKey, r: number, code: string) => playersAt(s, r).find((p) => p.code === code)!
const ctx = (system: SystemKey, phase: 'lineup' | 'serve' | 'switch' | 'defense', attack: Attack = 'right') => ({ system, phase, attack })

describe('serve', () => {
  test('zone-1 player stands behind the end line with SERVE tag', () => {
    expect(spotFor(find('5-1', 0, 'S'), ctx('5-1', 'serve'))).toEqual({ spot: SERVE_SPOT, tag: 'SERVE' })
    expect(SERVE_SPOT).toEqual({ x: 7.6, d: 10.5 })
  })
  test('others hold their zone', () => {
    expect(spotFor(find('5-1', 0, 'OPP'), ctx('5-1', 'serve')).spot).toEqual(BASE[4])
  })
})

describe('switch', () => {
  test('5-1 back-row setter runs to the setting target', () => {
    expect(spotFor(find('5-1', 0, 'S'), ctx('5-1', 'switch'))).toEqual({ spot: SWITCH_SPOT.SET, tag: 'SETS' })
  })
  test('5-1 front-row setter (rotation 4) also goes to the target', () => {
    const s = find('5-1', 3, 'S')
    expect(s.front).toBe(true)
    expect(spotFor(s, ctx('5-1', 'switch')).spot).toEqual(SWITCH_SPOT.SET)
  })
  test('6-2 front-row setter plays right side', () => {
    expect(spotFor(find('6-2', 0, 'S2'), ctx('6-2', 'switch')).spot).toEqual(SWITCH_SPOT.FR)
  })
  test('4-2 back-row setter plays right back', () => {
    expect(spotFor(find('4-2', 0, 'S1'), ctx('4-2', 'switch')).spot).toEqual(SWITCH_SPOT.BR)
  })
  test('hitters go to their side', () => {
    expect(spotFor(find('5-1', 0, 'OH1'), ctx('5-1', 'switch')).spot).toEqual(SWITCH_SPOT.FL)
    expect(spotFor(find('5-1', 0, 'OPP'), ctx('5-1', 'switch')).spot).toEqual(SWITCH_SPOT.FR)
  })
  test('6-6 does not switch', () => {
    for (const p of playersAt('6-6', 1)) expect(spotFor(p, ctx('6-6', 'switch')).spot).toEqual(BASE[p.zone])
  })
})

describe('defense', () => {
  test('attack on the right: OPP and MB2 block, OH1 covers tips, back middle deep', () => {
    const c = ctx('5-1', 'defense', 'right')
    expect(spotFor(find('5-1', 0, 'OPP'), c).tag).toBe('BLOCK')
    expect(spotFor(find('5-1', 0, 'MB2'), c).tag).toBe('BLOCK')
    expect(spotFor(find('5-1', 0, 'OH1'), c).tag).toBe('TIP')
    expect(spotFor(find('5-1', 0, 'MB1'), c).tag).toBe('DEEP')
  })
  test('attack in the middle has exactly one blocker', () => {
    const tags = playersAt('5-1', 0).map((p) => spotFor(p, ctx('5-1', 'defense', 'middle')).tag)
    expect(tags.filter((t) => t === 'BLOCK')).toHaveLength(1)
  })
  test('every system and rotation fills all six defense slots', () => {
    for (const s of ['5-1', '6-2', '4-2', '6-6'] as SystemKey[])
      for (let r = 0; r < 6; r++)
        expect(new Set(playersAt(s, r).map((p) => slotOf(p, s))).size).toBe(6)
  })
})
