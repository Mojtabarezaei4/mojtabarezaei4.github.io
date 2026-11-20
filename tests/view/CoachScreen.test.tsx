import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { decodePlaybook, emptyPlaybook } from '../../src/domain/playbook'
import { CoachScreen } from '../../src/view/CoachScreen'

const setup = () => {
  const onChange = vi.fn()
  render(<CoachScreen initial={emptyPlaybook('5-1')} onChange={onChange} />)
  return { onChange, last: () => onChange.mock.calls.at(-1)![0] }
}
const token = (name: RegExp) => screen.getByRole('button', { name })
const press = (el: HTMLElement, key: string, n = 1) => { for (let i = 0; i < n; i++) fireEvent.keyDown(el, { key }) }

describe('coach view', () => {
  test('shows six movable players for rotation 1 receive', () => {
    setup()
    expect(screen.getAllByRole('button', { name: /zone \d.*arrow keys/ })).toHaveLength(6)
  })
  test('moving OPP across MB1 raises an overlap warning and marks the rotation', () => {
    setup()
    press(token(/^OPP, zone 4/), 'ArrowRight', 9)
    expect(screen.getByRole('alert')).toHaveTextContent('OPP (zone 4) must stay left of MB2 (zone 3)')
    expect(within(screen.getByRole('region', { name: 'Playbook' })).getByText(/R1 · OVERLAP/)).toBeInTheDocument()
  })
  test('reset to default clears the change', () => {
    setup()
    press(token(/^OPP, zone 4/), 'ArrowRight', 9)
    fireEvent.click(screen.getByRole('button', { name: 'Reset to default' }))
    expect(screen.queryByRole('alert')).toBeNull()
  })
  test('roster names appear in warnings', () => {
    setup()
    fireEvent.change(screen.getByLabelText('OPP number'), { target: { value: '9' } })
    fireEvent.change(screen.getByLabelText('OPP name'), { target: { value: 'Sara' } })
    press(token(/^#9 Sara, zone 4/), 'ArrowRight', 9)
    expect(screen.getByRole('alert')).toHaveTextContent('#9 Sara (zone 4) must stay left of MB2 (zone 3)')
  })
  test('the server may stand anywhere behind the end line in serve', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'We serve' }))
    press(token(/^S, zone 1/), 'ArrowLeft', 12)
    expect(screen.queryByRole('alert')).toBeNull()
  })
  test('notes and edits end up in the share link', () => {
    const { last } = setup()
    fireEvent.change(screen.getByLabelText(/Note to players/), { target: { value: 'Call the ball!' } })
    press(token(/^OH2, zone 5/), 'ArrowDown', 1)
    const link = (screen.getByLabelText('Share link') as HTMLInputElement).value
    expect(link).toMatch(/#\/play\?pb=/)
    const pb = decodePlaybook(link.split('pb=')[1])!
    expect(pb.notes['0-receive']).toBe('Call the ball!')
    expect(pb.spots['0-receive'].OH2).toBeDefined()
    expect(last()).toEqual(pb)
  })
  test('rotation buttons switch the edited rotation', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Rotation 4' }))
    expect(screen.getByRole('heading', { name: /Rotation 4 · Receive/ })).toBeInTheDocument()
  })
})

test('5-1 rotations are numbered by setter zone in the coach view too', () => {
  setup()
  const g = screen.getByRole('group', { name: 'Rotation' })
  expect(within(g).getAllByRole('button').map((b) => b.textContent)).toEqual(['1', '6', '5', '4', '3', '2'])
  fireEvent.click(screen.getByRole('button', { name: 'Rotation 6' }))
  expect(screen.getByRole('heading', { name: /Rotation 6 · Receive/ })).toBeInTheDocument()
})

describe('export as image', () => {
  test('one button downloads the whole playbook as one picture', async () => {
    const exp = await import('../../src/view/exportImage')
    const dl = vi.spyOn(exp, 'downloadPlaybookImage').mockResolvedValue()
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Download image' }))
    expect(dl).toHaveBeenCalledWith(expect.objectContaining({ system: '5-1' }))
    expect(screen.queryByRole('button', { name: 'Download all rotations' })).toBeNull()
  })
})
