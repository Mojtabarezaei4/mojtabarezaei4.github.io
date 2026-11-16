import { describe, expect, test } from 'vitest'
import { overlapViolations } from '../../src/domain/overlap'
import { receiveSpots } from '../../src/domain/receive'
import { playersAt } from '../../src/domain/rotation'
import type { Spot, SystemKey, Zone } from '../../src/domain/types'

const SYSTEMS: SystemKey[] = ['5-1', '6-2', '4-2', '6-6']
const cases = SYSTEMS.flatMap((s) => [0, 1, 2, 3, 4, 5].map((r) => [s, r] as const))

describe.each(cases)('%s rotation %i', (system, r) => {
  const players = playersAt(system, r)
  const { spots, passers } = receiveSpots(system, r)

  test('is legal under the overlap rule', () => {
    const byZone = Object.fromEntries(players.map((p) => [p.zone, spots[p.id]])) as Record<Zone, Spot>
    expect(overlapViolations(byZone)).toEqual([])
  })
  test('has the right passers', () => {
    if (system === '6-6') {
      expect(passers.size).toBe(5)
      expect(players.find((p) => p.zone === 3 && passers.has(p.id))).toBeUndefined()
    } else {
      const expected = players.filter((p) => p.role === 'OH' || (p.role === 'MB' && !p.front)).map((p) => p.id).sort()
      expect([...passers].sort()).toEqual(expected)
    }
  })
  test('everyone stays on our side of the net and inside the free zone', () => {
    for (const p of players) {
      expect(spots[p.id].d).toBeGreaterThan(0)
      expect(spots[p.id].x).toBeGreaterThanOrEqual(-1)
      expect(spots[p.id].x).toBeLessThanOrEqual(10)
    }
  })
})

describe('spacing (review finding: setter hid a teammate)', () => {
  test.each(cases)('%s rotation %i: no two players closer than 1.2 m', (system, r) => {
    const s = Object.values(receiveSpots(system, r).spots)
    for (let i = 0; i < s.length; i++)
      for (let j = i + 1; j < s.length; j++)
        expect(Math.hypot(s[i].x - s[j].x, s[i].d - s[j].d)).toBeGreaterThanOrEqual(1.2)
  })
})
