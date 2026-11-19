import { describe, expect, test } from 'vitest'
import { emptyPlaybook, playbookViolations, spotsFor } from '../../src/domain/playbook'
import { CHART_5_1 } from '../../src/domain/chart51'
import { placePlayers } from '../../src/domain/place'
import { playersAt } from '../../src/domain/rotation'
import { rotationLabel, rotationOrder } from '../../src/domain/rotation'

const scene = (rotation: number, phase: 'serve' | 'receive') => placePlayers({ system: '5-1', rotation, phase, attack: 'right', libero: false })
const spot = (rotation: number, phase: 'serve' | 'receive', id: string) => scene(rotation, phase).find((p) => p.id === id)!.spot


describe('5-1 follows the chart', () => {
  test('starting lineup (setter in zone 1): O, M2, H1 front; H2, M1, S back', () => {
    const z = Object.fromEntries(playersAt('5-1', 0).map((p) => [p.zone, p.id]))
    expect(z).toEqual({ 4: 'OPP', 3: 'MB2', 2: 'OH1', 5: 'OH2', 6: 'MB1', 1: 'S' })
  })
  test('rotations are numbered by the setter zone: 1, 6, 5, 4, 3, 2', () => {
    expect([0, 1, 2, 3, 4, 5].map((r) => rotationLabel('5-1', r))).toEqual([1, 6, 5, 4, 3, 2])
    expect(rotationOrder('5-1')).toEqual([1, 6, 5, 4, 3, 2])
  })
  test('other systems keep 1..6', () => {
    expect([0, 1, 2, 3, 4, 5].map((r) => rotationLabel('6-2', r))).toEqual([1, 2, 3, 4, 5, 6])
  })
  test('serve in rotation 4 uses the chart spots', () => {
    expect(spot(3, 'serve', 'S')).toEqual(CHART_5_1[4].serve.S)
    expect(spot(3, 'serve', 'MB1')).toEqual({ x: 4.5, d: 0.6 })
  })
  test('the server stands behind the end line', () => {
    for (let r = 0; r < 6; r++) {
      const server = scene(r, 'serve').find((p) => p.zone === 1)!
      expect(server.spot.d).toBeGreaterThan(9.5)
      expect(server.tag).toBe('SERVE')
    }
  })
  test('serve receive in rotation 1 uses the chart spots', () => {
    expect(spot(0, 'receive', 'S')).toEqual({ x: 8.2, d: 6.1 })
    expect(spot(0, 'receive', 'OPP')).toEqual({ x: 0.7, d: 2.7 })
  })
  test('chart has every player in every rotation', () => {
    for (const z of [1, 2, 3, 4, 5, 6] as const)
      for (const ph of ['serve', 'receive'] as const)
        expect(Object.keys(CHART_5_1[z][ph]).sort()).toEqual(['MB1', 'MB2', 'OH1', 'OH2', 'OPP', 'S'])
  })
})

test('no default formation of any system counts as illegal in the coach playbook', () => {
  for (const system of ['6-6', '5-1', '6-2', '4-2'] as const)
    for (let r = 0; r < 6; r++)
      for (const sit of ['serve', 'receive'] as const)
        expect(playbookViolations(emptyPlaybook(system), r, sit), `${system} r${r} ${sit}`).toEqual([])
})
test('the coach playbook starts from the chart', () => {
  expect(spotsFor(emptyPlaybook('5-1'), 0, 'receive').S).toEqual({ x: 8.2, d: 6.1 })
})
