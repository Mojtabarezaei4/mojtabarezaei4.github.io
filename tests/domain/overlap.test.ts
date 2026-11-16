import { expect, test } from 'vitest'
import { BASE } from '../../src/domain/formations'
import { overlapViolations } from '../../src/domain/overlap'
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
