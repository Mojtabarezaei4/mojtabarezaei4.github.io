import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, test } from 'vitest'
import { emptyPlaybook, setNote, setRoster } from '../../src/domain/playbook'
import { PlayerScreen } from '../../src/view/PlayerScreen'

const pb = () => {
  let p = { ...emptyPlaybook('5-1'), team: 'Södermalm VK' }
  p = setRoster(p, 'OH1', { name: 'Maja', num: '7' })
  p = setNote(p, 0, 'receive', 'Maja: call the ball early.')
  return p
}

test('a shared playbook shows the team, the coach note and player names', () => {
  render(<PlayerScreen initialSystem="5-1" playbook={pb()} />)
  expect(screen.getByText(/Södermalm VK/)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Receive' }))
  expect(screen.getByRole('region', { name: 'Coach note' })).toHaveTextContent('Maja: call the ball early.')
  const info = screen.getByRole('region', { name: 'In this rotation' })
  expect(within(info).getByText(/#7 Maja/)).toBeInTheDocument()
})
test('no coach note in phases the coach did not write for', () => {
  render(<PlayerScreen initialSystem="5-1" playbook={pb()} />)
  expect(screen.queryByRole('region', { name: 'Coach note' })).toBeNull()
})
test('switching to another system leaves the playbook out', () => {
  render(<PlayerScreen initialSystem="5-1" playbook={pb()} />)
  fireEvent.click(screen.getByRole('button', { name: '6-2' }))
  expect(screen.queryByText(/Södermalm VK/)).toBeNull()
})
