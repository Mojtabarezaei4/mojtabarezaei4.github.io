import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from '../../src/app/App'

test('renders brand', () => {
  render(<App />)
  expect(screen.getByText('VOLLEYROT')).toBeInTheDocument()
})
