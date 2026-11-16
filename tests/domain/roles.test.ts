import { describe, expect, test } from 'vitest'
import { displayRole, setsThisRally } from '../../src/domain/roles'
import { playersAt } from '../../src/domain/rotation'

const at = (sys: Parameters<typeof playersAt>[0], r: number, code: string) => playersAt(sys, r).find((p) => p.code === code)!

describe('displayRole', () => {
  test('back-row middle shows as libero when libero is on', () => {
    expect(displayRole(at('5-1', 0, 'MB2'), '5-1', 'lineup', true)).toEqual({ role: 'L', code: 'L' })
  })
  test('libero off keeps the middle', () => {
    expect(displayRole(at('5-1', 0, 'MB2'), '5-1', 'lineup', false)).toEqual({ role: 'MB', code: 'MB2' })
  })
  test('middle in zone 1 serves itself, libero comes in for receive', () => {
    const mb = at('5-1', 2, 'MB1') // MB1 starts in 3 → after 2 steps in zone 1
    expect(mb.zone).toBe(1)
    expect(displayRole(mb, '5-1', 'serve', true).role).toBe('MB')
    expect(displayRole(mb, '5-1', 'receive', true).role).toBe('L')
  })
  test('front-row middle is never replaced', () => {
    expect(displayRole(at('5-1', 0, 'MB1'), '5-1', 'receive', true).role).toBe('MB')
  })
  test('6-6 never shows a libero', () => {
    for (let r = 0; r < 6; r++)
      for (const p of playersAt('6-6', r)) expect(displayRole(p, '6-6', 'receive', true).role).not.toBe('L')
  })
})

describe('setsThisRally', () => {
  test('5-1 setter always sets', () => {
    for (let r = 0; r < 6; r++) expect(setsThisRally(at('5-1', r, 'S'), '5-1')).toBe(true)
  })
  test('6-2 back-row setter sets', () => {
    expect(setsThisRally(at('6-2', 0, 'S1'), '6-2')).toBe(true)
    expect(setsThisRally(at('6-2', 0, 'S2'), '6-2')).toBe(false)
  })
  test('4-2 front-row setter sets', () => {
    expect(setsThisRally(at('4-2', 0, 'S2'), '4-2')).toBe(true)
    expect(setsThisRally(at('4-2', 0, 'S1'), '4-2')).toBe(false)
  })
  test('6-6 only the zone-3 player sets', () => {
    const setters = playersAt('6-6', 2).filter((p) => setsThisRally(p, '6-6'))
    expect(setters.map((p) => p.zone)).toEqual([3])
  })
})
