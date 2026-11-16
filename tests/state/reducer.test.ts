import { expect, test } from 'vitest'
import { initialState, reducer } from '../../src/state/reducer'

test('defaults', () => {
  expect(initialState()).toEqual({ system: '5-1', rotation: 0, phase: 'lineup', attack: 'right', libero: true, playing: true, speed: 1 })
  expect(initialState('6-2').system).toBe('6-2')
})
test('next wraps 5 → 0 and prev wraps 0 → 5', () => {
  expect(reducer({ ...initialState(), rotation: 5 }, { type: 'next' }).rotation).toBe(0)
  expect(reducer(initialState(), { type: 'prev' }).rotation).toBe(5)
})
test('changing system resets rotation and keeps phase', () => {
  const s = reducer({ ...initialState(), rotation: 3, phase: 'receive' }, { type: 'system', system: '4-2' })
  expect(s).toMatchObject({ system: '4-2', rotation: 0, phase: 'receive' })
})
test('speed is clamped to 0.25..2', () => {
  expect(reducer(initialState(), { type: 'speed', speed: 5 }).speed).toBe(2)
  expect(reducer(initialState(), { type: 'speed', speed: 0 }).speed).toBe(0.25)
})
test('jump, phase, attack, libero, toggle', () => {
  let s = reducer(initialState(), { type: 'jump', rotation: 4 })
  s = reducer(s, { type: 'phase', phase: 'defense' })
  s = reducer(s, { type: 'attack', attack: 'left' })
  s = reducer(s, { type: 'libero', on: false })
  s = reducer(s, { type: 'toggle' })
  expect(s).toMatchObject({ rotation: 4, phase: 'defense', attack: 'left', libero: false, playing: false })
})
