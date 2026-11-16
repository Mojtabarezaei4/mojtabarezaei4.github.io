import { render } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { placePlayers } from '../../src/domain/place'
import { Tokens } from '../../src/view/Tokens'

const st = { system: '5-1' as const, rotation: 0, phase: 'lineup' as const, attack: 'right' as const, libero: true }
afterEach(() => vi.unstubAllGlobals())

test('renders six tokens with stable ids across rotations', () => {
  const { container, rerender } = render(<Tokens players={placePlayers(st)} durationMs={950} showGhosts={false} />)
  const ids = () => [...container.querySelectorAll('[data-id]')].map((n) => n.getAttribute('data-id'))
  const before = ids()
  expect(before).toHaveLength(6)
  rerender(<Tokens players={placePlayers({ ...st, rotation: 2 })} durationMs={950} showGhosts={false} />)
  expect(ids()).toEqual(before)
})
test('uses the given move duration', () => {
  const { container } = render(<Tokens players={placePlayers(st)} durationMs={475} showGhosts={false} />)
  expect((container.querySelector('[data-id]') as HTMLElement).style.transition).toContain('475ms')
})
test('reduced motion turns transitions off', () => {
  vi.stubGlobal('matchMedia', (q: string) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {} }))
  const { container } = render(<Tokens players={placePlayers(st)} durationMs={950} showGhosts={false} />)
  expect((container.querySelector('[data-id]') as HTMLElement).style.transition).toBe('none')
})
test('ghost rings render when asked', () => {
  const { container } = render(<Tokens players={placePlayers(st)} durationMs={950} showGhosts />)
  expect(container.querySelectorAll('.ghost')).toHaveLength(6)
})
