import { describe, expect, test } from 'vitest'
import { jobNote, pathFor } from '../../src/domain/jobs'
import { placePlayers, type Scene } from '../../src/domain/place'

const sc = (o: Partial<Scene> = {}): Scene => ({ system: '5-1', rotation: 0, phase: 'lineup', attack: 'right', libero: true, ...o })
const note = (id: string, o: Partial<Scene> = {}) => {
  const s = sc(o)
  return jobNote(placePlayers(s).find((p) => p.id === id)!, s)
}

describe('pathFor', () => {
  test('5-1 setter goes 1 → 6 → 5 → 4 → 3 → 2', () => {
    expect(pathFor('5-1', 'S')).toEqual([1, 6, 5, 4, 3, 2])
  })
  test('OH1 starts in zone 2', () => {
    expect(pathFor('5-1', 'OH1')[0]).toBe(2)
  })
})

describe('jobNote', () => {
  test('lineup names the zone, the row and the overlap neighbours', () => {
    const n = note('OH1') // zone 2, front row
    expect(n.title).toBe('Zone 2 · front row')
    expect(n.text).toMatch(/right of MB1/)
    expect(n.text).toMatch(/in front of S/)
  })
  test('the zone-1 player serves', () => {
    expect(note('S', { phase: 'serve' }).text).toMatch(/You serve/)
  })
  test('passers are told to pass', () => {
    expect(note('OH1', { phase: 'receive' }).text).toMatch(/pass/i)
  })
  test('a middle replaced by the libero is off court', () => {
    const n = note('MB2', { phase: 'receive' }) // back row at start
    expect(n.text).toMatch(/libero/i)
    expect(n.offCourt).toBe(true)
  })
  test('blockers are told to block', () => {
    expect(note('OPP', { phase: 'defense', attack: 'right' }).text).toMatch(/block/i)
  })
  test('the setter in switch runs to the target', () => {
    expect(note('S', { phase: 'switch' }).text).toMatch(/target/)
  })
  test('every player has a note in every phase of every system', () => {
    for (const system of ['6-6', '5-1', '6-2', '4-2'] as const)
      for (const phase of ['lineup', 'serve', 'receive', 'switch', 'defense'] as const)
        for (let rotation = 0; rotation < 6; rotation++) {
          const s = sc({ system, phase, rotation })
          for (const p of placePlayers(s)) expect(jobNote(p, s).text.length).toBeGreaterThan(10)
        }
  })
})
