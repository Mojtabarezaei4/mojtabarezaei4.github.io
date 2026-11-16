import { act, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import App, { parseRoute } from '../../src/app/App'

afterEach(() => { window.location.hash = '' })

test('parseRoute', () => {
  expect(parseRoute('')).toEqual({ screen: 'picker' })
  expect(parseRoute('#/')).toEqual({ screen: 'picker' })
  expect(parseRoute('#/play?system=6-2')).toEqual({ screen: 'play', system: '6-2' })
  expect(parseRoute('#/play?system=9-9')).toEqual({ screen: 'play', system: '5-1' })
  expect(parseRoute('#/play')).toEqual({ screen: 'play', system: '5-1' })
})
test('opening a play link starts with that system', () => {
  window.location.hash = '#/play?system=4-2'
  render(<App />)
  expect(screen.getByRole('button', { name: '4-2' })).toHaveAttribute('aria-pressed', 'true')
})
test('picker cards link to their system', () => {
  render(<App />)
  expect(screen.getByRole('link', { name: /6-6/ })).toHaveAttribute('href', '#/play?system=6-6')
  expect(screen.getByRole('link', { name: /5-1/ })).toHaveAttribute('href', '#/play?system=5-1')
})
test('hash change switches screens', () => {
  render(<App />)
  act(() => {
    window.location.hash = '#/play?system=6-2'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  })
  expect(screen.getByLabelText('Current rotation')).toBeInTheDocument()
})
