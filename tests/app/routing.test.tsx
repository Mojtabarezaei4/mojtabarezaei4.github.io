import { act, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import App, { parseRoute } from '../../src/app/App'
import { emptyPlaybook, encodePlaybook } from '../../src/domain/playbook'

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

test('picker cards follow the order 6-6, 5-1, 6-2, 4-2', () => {
  render(<App />)
  const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href')).filter((h) => h?.startsWith('#/play'))
  expect(hrefs).toEqual(['#/play?system=6-6', '#/play?system=5-1', '#/play?system=6-2', '#/play?system=4-2'])
})

test('coach routes', () => {
  expect(parseRoute('#/coach')).toEqual({ screen: 'coach', playbook: null })
  const code = encodePlaybook({ ...emptyPlaybook('6-2'), team: 'X' })
  expect(parseRoute(`#/coach?pb=${code}`)).toMatchObject({ screen: 'coach', playbook: { system: '6-2', team: 'X' } })
  expect(parseRoute(`#/play?pb=${code}`)).toMatchObject({ screen: 'play', system: '6-2', playbook: { team: 'X' } })
})
test('the picker links to the coach view', () => {
  render(<App />)
  expect(screen.getByRole('link', { name: /Coach view/ })).toHaveAttribute('href', '#/coach')
})
