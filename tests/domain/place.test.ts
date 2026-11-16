import { expect, test } from 'vitest'
import { BASE } from '../../src/domain/formations'
import { placePlayers } from '../../src/domain/place'

const s = { system: '5-1' as const, rotation: 0, phase: 'receive' as const, attack: 'right' as const, libero: true }

test('receive 5-1 rotation 1 has three passers and one setter', () => {
  const tags = placePlayers(s).map((p) => p.tag)
  expect(tags.filter((t) => t === 'PASS')).toHaveLength(3)
  expect(tags.filter((t) => t === 'SETS')).toHaveLength(1)
})
test('home is always the official zone spot', () => {
  for (const p of placePlayers({ ...s, phase: 'defense' })) expect(p.home).toEqual(BASE[p.zone])
})
test('libero is shown with libero color', () => {
  const l = placePlayers(s).find((p) => p.show.code === 'L')!
  expect(l.show.color).toBe('#C4A1FF')
})
test('6-6 zone-3 player is painted as setter', () => {
  const p = placePlayers({ ...s, system: '6-6', phase: 'lineup' }).find((x) => x.zone === 3)!
  expect(p.show.color).toBe('#FFD84D')
})
