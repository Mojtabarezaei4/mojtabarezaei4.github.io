import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, test } from 'vitest'
import { PlayerScreen } from '../../src/view/PlayerScreen'

const counter = () => screen.getByLabelText('Current rotation')

test('next button advances the rotation counter', () => {
  render(<PlayerScreen initialSystem="5-1" />)
  expect(counter()).toHaveTextContent('1')
  fireEvent.click(screen.getByRole('button', { name: 'Next rotation' }))
  expect(counter()).toHaveTextContent('2')
})
test('jump buttons set the rotation', () => {
  render(<PlayerScreen initialSystem="5-1" />)
  fireEvent.click(screen.getByRole('button', { name: 'Rotation 4' }))
  expect(counter()).toHaveTextContent('4')
})
test('attack chooser only appears in defense', () => {
  render(<PlayerScreen initialSystem="5-1" />)
  expect(screen.queryByRole('group', { name: 'Attack from' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Defense' }))
  const g = screen.getByRole('group', { name: 'Attack from' })
  for (const n of ['Left', 'Middle', 'Right']) expect(within(g).getByRole('button', { name: n })).toBeInTheDocument()
  expect(screen.getByText(/Attack from the right\. .* block\./)).toBeInTheDocument()
})
test('6-6 has no libero toggle', () => {
  render(<PlayerScreen initialSystem="6-6" />)
  expect(screen.queryByRole('checkbox', { name: /libero/i })).toBeNull()
})
test('speed slider updates the label', () => {
  render(<PlayerScreen initialSystem="5-1" />)
  fireEvent.change(screen.getByRole('slider', { name: 'Speed' }), { target: { value: '2' } })
  expect(screen.getByText('2×')).toBeInTheDocument()
})
test('legend lists full names for 5-1', () => {
  render(<PlayerScreen initialSystem="5-1" />)
  const legend = screen.getByRole('region', { name: "Who's who" })
  for (const n of ['Setter', 'Outside Hitter', 'Middle Blocker', 'Opposite', 'Libero']) expect(within(legend).getByText(n)).toBeInTheDocument()
})
test('receive explains who passes', () => {
  render(<PlayerScreen initialSystem="5-1" />)
  fireEvent.click(screen.getByRole('button', { name: 'Receive' }))
  expect(screen.getByText(/Opponent serves\. .* take the pass\./)).toBeInTheDocument()
})
test('switching system keeps the phase and resets rotation', () => {
  render(<PlayerScreen initialSystem="5-1" />)
  fireEvent.click(screen.getByRole('button', { name: 'Rotation 3' }))
  fireEvent.click(screen.getByRole('button', { name: 'Switch' }))
  fireEvent.click(screen.getByRole('button', { name: '6-2' }))
  expect(counter()).toHaveTextContent('1')
  expect(screen.getByRole('button', { name: 'Switch' })).toHaveAttribute('aria-pressed', 'true')
})
