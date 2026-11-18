import { describe, expect, test } from 'vitest'
import { SWITCH_SPOT } from '../../src/domain/formations'
import { placePlayers } from '../../src/domain/place'
import { RALLY_STEPS, rallyStep } from '../../src/domain/rally'
import { setsThisRally } from '../../src/domain/roles'
import { playersAt } from '../../src/domain/rotation'
import type { SystemKey } from '../../src/domain/types'
import { project } from '../../src/view/projection'

const SYSTEMS: SystemKey[] = ['6-6', '5-1', '6-2', '4-2']
const rs = (system: SystemKey, rotation: number, step: number) => rallyStep({ system, rotation, attack: 'right', libero: true }, step)

test('five steps: serve, pass, set, attack, back to base', () => {
  expect(RALLY_STEPS.map((s) => s.label)).toEqual(['Serve', 'Pass', 'Set', 'Attack', 'Base'])
})

describe('5-1 rotation 1', () => {
  test('the serve goes to a passer', () => {
    const s = rs('5-1', 0, 0)
    const passer = s.players.find((p) => p.id === s.passer)!
    expect(passer.tag).toBe('PASS')
    expect(s.ball!.to.x).toBeCloseTo(passer.spot.x)
    expect(s.ball!.from.d).toBeLessThan(-2) // from the other side of the net
  })
  test('on the pass the setter runs to the target', () => {
    const s = rs('5-1', 0, 1)
    expect(s.players.find((p) => p.id === 'S')!.spot).toEqual(SWITCH_SPOT.SET)
    expect(s.ball!.to.x).toBeCloseTo(SWITCH_SPOT.SET.x)
  })
  test('the set goes to the front-row outside hitter', () => {
    const s = rs('5-1', 0, 2)
    expect(s.attacker).toBe('OH1')
    expect(s.ball!.to.x).toBeLessThan(2)
  })
  test('the attack goes over the net and teammates cover', () => {
    const s = rs('5-1', 0, 3)
    expect(s.ball!.to.d).toBeLessThan(0)
    expect(s.players.find((p) => p.id === 'OH1')!.tag).toBe('ATTACK')
    expect(s.players.filter((p) => p.tag === 'COVER')).toHaveLength(2)
  })
  test('back to base has no ball and uses base spots', () => {
    const s = rs('5-1', 0, 4)
    expect(s.ball).toBeNull()
    expect(s.players.find((p) => p.id === 'OPP')!.spot).toEqual(SWITCH_SPOT.FR) // front-row opposite back to right front
  })
  test('captions name the players', () => {
    expect(rs('5-1', 0, 2).caption).toMatch(/S sets .* OH1/)
  })
})

test.each(SYSTEMS.flatMap((s) => [0, 1, 2, 3, 4, 5].map((r) => [s, r] as const)))('%s rotation %i: setter sets, a front-row player attacks', (system, r) => {
  const players = playersAt(system, r)
  const s = rs(system, r, 2)
  expect(s.setter).toBe(players.find((p) => setsThisRally(p, system))!.id)
  const attacker = players.find((p) => p.id === s.attacker)!
  expect(attacker.front).toBe(true)
  expect(attacker.id).not.toBe(s.setter)
  expect(s.passer).not.toBe(s.setter)
})

test('placePlayers delegates the rally phase to the current step', () => {
  const placed = placePlayers({ system: '5-1', rotation: 0, phase: 'rally', attack: 'right', libero: true, rallyStep: 3 })
  expect(placed.find((p) => p.id === 'OH1')!.tag).toBe('ATTACK')
})

test.each(SYSTEMS)('%s: the ball stays inside the picture for the whole flight', (system) => {
  for (let r = 0; r < 6; r++)
    for (let step = 0; step < 4; step++) {
      const { from, to, peak } = rs(system, r, step).ball!
      for (let i = 0; i <= 20; i++) {
        const t = i / 20
        const z = from.z + (to.z - from.z) * t + 4 * (peak - (from.z + to.z) / 2) * t * (1 - t)
        const p = project(from.x + (to.x - from.x) * t, from.d + (to.d - from.d) * t, z)
        expect(p.y, `${system} r${r} step ${step} t=${t}`).toBeGreaterThanOrEqual(8)
        expect(p.y).toBeLessThanOrEqual(852)
      }
    }
})

test.each(SYSTEMS)('%s: no two players stand on top of each other at any rally step (bug: OPP + MB1 in 5-1 rotation 2)', (system) => {
  for (let r = 0; r < 6; r++)
    for (let step = 0; step < 5; step++) {
      const ps = rs(system, r, step).players
      for (let i = 0; i < ps.length; i++)
        for (let j = i + 1; j < ps.length; j++) {
          const d = Math.hypot(ps[i].spot.x - ps[j].spot.x, ps[i].spot.d - ps[j].spot.d)
          expect(d, `${system} r${r} step ${step}: ${ps[i].id} and ${ps[j].id}`).toBeGreaterThanOrEqual(1.0)
        }
    }
})
