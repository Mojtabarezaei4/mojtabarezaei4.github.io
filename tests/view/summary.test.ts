import { expect, test } from 'vitest'
import { placePlayers } from '../../src/domain/place'
import { summaryLine } from '../../src/view/PlayerScreen'

const scene = (system: '5-1' | '6-6', rotation: number, phase: 'switch' | 'serve') => placePlayers({ system, rotation, phase, attack: 'right', libero: true })

test('switch never says the libero serves (review finding)', () => {
  for (let r = 0; r < 6; r++) expect(summaryLine(scene('5-1', r, 'switch'), 'switch', 'right')).not.toMatch(/L serves/)
})
test('switch names who sets', () => {
  expect(summaryLine(scene('5-1', 0, 'switch'), 'switch', 'right')).toBe('S runs to the target to set.')
  expect(summaryLine(scene('6-6', 0, 'switch'), 'switch', 'right')).toBe('P3 sets from zone 3.')
})
test('serve still names the server', () => {
  expect(summaryLine(scene('5-1', 0, 'serve'), 'serve', 'right')).toBe('S serves from zone 1.')
})
