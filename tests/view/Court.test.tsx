import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { Court } from '../../src/view/Court'

test('shows the passing line only in receive', () => {
  const { rerender } = render(<Court phase="receive" attack="right" showPath />)
  expect(screen.getByText('PASSING LINE')).toBeInTheDocument()
  rerender(<Court phase="lineup" attack="right" showPath />)
  expect(screen.queryByText('PASSING LINE')).toBeNull()
})
test('shows the attack only in defense', () => {
  const { rerender } = render(<Court phase="defense" attack="left" showPath />)
  expect(screen.getByText('ATTACK')).toBeInTheDocument()
  rerender(<Court phase="switch" attack="left" showPath />)
  expect(screen.queryByText('ATTACK')).toBeNull()
})
test('draws all six zone numbers', () => {
  render(<Court phase="lineup" attack="right" showPath />)
  for (const n of ['1', '2', '3', '4', '5', '6']) expect(screen.getByText(n)).toBeInTheDocument()
})

test('only one label is shown above the net at a time', () => {
  const { rerender } = render(<Court phase="receive" attack="right" showPath />)
  expect(screen.queryByText('OPPONENT SIDE · NOT SHOWN')).toBeNull()
  rerender(<Court phase="defense" attack="right" showPath />)
  expect(screen.queryByText('OPPONENT SIDE · NOT SHOWN')).toBeNull()
  rerender(<Court phase="lineup" attack="right" showPath />)
  expect(screen.getByText('OPPONENT SIDE · NOT SHOWN')).toBeInTheDocument()
})

test('the top label is hidden during the rally (the ball flies there)', () => {
  render(<Court phase="rally" attack="right" showPath />)
  expect(screen.queryByText('OPPONENT SIDE · NOT SHOWN')).toBeNull()
})
