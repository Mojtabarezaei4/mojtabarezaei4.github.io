import { expect, test } from 'vitest'
import { BASE } from '../../src/domain/formations'
import { overlapPairs, overlapViolations } from '../../src/domain/overlap'
import type { Spot, Zone } from '../../src/domain/types'

const base = (): Record<Zone, Spot> => structuredClone(BASE)

test('base lineup is legal', () => {
  expect(overlapViolations(base())).toEqual([])
})
test('zone 4 right of zone 3 is an overlap', () => {
  const s = base()
  ;[s[4].x, s[3].x] = [s[3].x, s[4].x]
  expect(overlapViolations(s)).toContain('zone 4 must be left of zone 3')
})
test('front player behind their back-row partner is an overlap', () => {
  const s = base()
  s[2] = { x: 7.5, d: 7 }
  s[1] = { x: 7.5, d: 6.4 }
  expect(overlapViolations(s)).toContain('zone 2 must be in front of zone 1')
})
test('back row order 5 < 6 < 1 is checked', () => {
  const s = base()
  s[6] = { x: 8.5, d: 6.4 }
  expect(overlapViolations(s)).toContain('zone 6 must be left of zone 1')
})

test('an exempt zone (the server) is skipped', () => {
  const s = base()
  s[1] = { x: 4.5, d: 10.5 } // server behind the end line, left of zone 6
  expect(overlapViolations(s)).toContain('zone 6 must be left of zone 1')
  expect(overlapViolations(s, 1)).toEqual([])
})
test('overlapPairs gives the zones involved', () => {
  const s = base()
  ;[s[4].x, s[3].x] = [s[3].x, s[4].x]
  expect(overlapPairs(s)).toEqual([{ a: 4, b: 3, kind: 'left' }])
})
