import { describe, expect, test } from 'vitest'
import { receiveSpots } from '../../src/domain/receive'
import {
  decodePlaybook, emptyPlaybook, encodePlaybook, playbookStatus, playbookViolations, setNote, setRoster, setSpot, spotsFor,
} from '../../src/domain/playbook'

describe('playbook', () => {
  test('a new playbook uses the default formations', () => {
    const pb = emptyPlaybook('5-1')
    expect(spotsFor(pb, 0, 'receive')).toEqual(receiveSpots('5-1', 0).spots)
    expect(playbookStatus(pb, 0, 'receive')).toBe('default')
  })
  test('moving a player makes the rotation custom', () => {
    const pb = setSpot(emptyPlaybook('5-1'), 0, 'receive', 'OH2', { x: 1.5, d: 6.5 })
    expect(spotsFor(pb, 0, 'receive').OH2).toEqual({ x: 1.5, d: 6.5 })
    expect(playbookStatus(pb, 0, 'receive')).toBe('custom')
    expect(playbookStatus(pb, 1, 'receive')).toBe('default')
  })
  test('an illegal move is reported with names and numbers', () => {
    let pb = setRoster(emptyPlaybook('5-1'), 'OPP', { name: 'Sara', num: '9' })
    pb = setRoster(pb, 'MB2', { name: 'Ida', num: '11' })
    pb = setSpot(pb, 0, 'receive', 'OPP', { x: 5.5, d: 1.0 }) // OPP (zone 4) right of MB2 (zone 3)
    expect(playbookStatus(pb, 0, 'receive')).toBe('overlap')
    expect(playbookViolations(pb, 0, 'receive')).toContain('#9 Sara (zone 4) must stay left of #11 Ida (zone 3)')
  })
  test('without a roster, codes are used', () => {
    const pb = setSpot(emptyPlaybook('5-1'), 0, 'receive', 'OPP', { x: 5.5, d: 1.0 })
    expect(playbookViolations(pb, 0, 'receive')).toContain('OPP (zone 4) must stay left of MB2 (zone 3)')
  })
  test('in serve the server is exempt from the overlap rule', () => {
    const pb = setSpot(emptyPlaybook('5-1'), 0, 'serve', 'S', { x: 1, d: 10.5 })
    expect(playbookStatus(pb, 0, 'serve')).toBe('custom')
  })
  test('the share code survives a round trip, notes and names included', () => {
    let pb = setRoster(emptyPlaybook('6-2'), 'S1', { name: 'Ella Ö', num: '3' })
    pb = { ...pb, team: 'Södermalm VK' }
    pb = setSpot(pb, 2, 'receive', 'OH1', { x: 2, d: 6 })
    pb = setNote(pb, 2, 'receive', 'Ella hides behind Maja – release on contact!')
    const back = decodePlaybook(encodePlaybook(pb))
    expect(back).toEqual(pb)
  })
  test('the share code is URL-safe', () => {
    const code = encodePlaybook(setNote(emptyPlaybook('5-1'), 0, 'receive', 'a+b/c=?&#'))
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/)
  })
  test('broken codes are rejected', () => {
    expect(decodePlaybook('not-a-playbook')).toBeNull()
    expect(decodePlaybook('')).toBeNull()
    expect(decodePlaybook(encodePlaybook({ ...emptyPlaybook('5-1'), system: '9-9' as never }))).toBeNull()
  })
})
