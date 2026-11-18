import { act, render } from '@testing-library/react'
import { useReducer } from 'react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { initialState, reducer, type Action, type State } from '../../src/state/reducer'
import { useAutoplay } from '../../src/state/useAutoplay'

let api: { state: State; dispatch: (a: Action) => void }
function Harness() {
  const [state, dispatch] = useReducer(reducer, initialState())
  useAutoplay(state, dispatch)
  api = { state, dispatch }
  return null
}
beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

test('advances one rotation every 2600 ms at 1×', () => {
  render(<Harness />)
  act(() => vi.advanceTimersByTime(2599))
  expect(api.state.rotation).toBe(0)
  act(() => vi.advanceTimersByTime(1))
  expect(api.state.rotation).toBe(1)
})
test('speed change applies to the next tick with a single timer', () => {
  render(<Harness />)
  act(() => api.dispatch({ type: 'speed', speed: 2 }))
  expect(vi.getTimerCount()).toBe(1)
  act(() => vi.advanceTimersByTime(1300))
  expect(api.state.rotation).toBe(1)
})
test('paused does not advance', () => {
  render(<Harness />)
  act(() => api.dispatch({ type: 'toggle' }))
  act(() => vi.advanceTimersByTime(10000))
  expect(api.state.rotation).toBe(0)
})
test('system change while playing keeps one timer', () => {
  render(<Harness />)
  act(() => api.dispatch({ type: 'system', system: '6-6' }))
  expect(vi.getTimerCount()).toBe(1)
})
test('unmount clears the timer', () => {
  const { unmount } = render(<Harness />)
  unmount()
  expect(vi.getTimerCount()).toBe(0)
})

test('in rally mode autoplay walks steps every 1800 ms at 1×, with one timer', () => {
  render(<Harness />)
  act(() => api.dispatch({ type: 'phase', phase: 'rally' }))
  act(() => vi.advanceTimersByTime(1800))
  expect(api.state).toMatchObject({ rallyStep: 1, rotation: 0 })
  expect(vi.getTimerCount()).toBe(1)
})
