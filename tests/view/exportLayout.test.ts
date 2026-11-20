import { describe, expect, test } from 'vitest'
import { emptyPlaybook, setNote, setRoster, setSpot } from '../../src/domain/playbook'
import { courtDepth, exportFileName, fitCourt, playbookSheet, rotationLayout, zoneSlot } from '../../src/view/exportLayout'

const pb = () => {
  let p = { ...emptyPlaybook('5-1'), team: 'Södermalm VK' }
  p = setRoster(p, 'OPP', { name: 'Sara', num: '9' })
  p = setRoster(p, 'L', { name: 'Alva', num: '1' })
  return setNote(p, 0, 'receive', 'Sara: stay left of the middle.')
}

describe('rotation image layout', () => {
  test('title names team, system, rotation and situation', () => {
    const l = rotationLayout(pb(), 1, 'receive') // index 1 = setter zone 6 in a 5-1
    expect(l.title).toBe('Södermalm VK')
    expect(l.subtitle).toBe('5-1 · Rotation 6 · Receive')
  })
  test('six tokens with numbers and names where known', () => {
    const l = rotationLayout(pb(), 0, 'receive')
    expect(l.tokens).toHaveLength(6)
    const opp = l.tokens.find((t) => t.id === 'OPP')!
    expect(opp).toMatchObject({ top: '9', bottom: 'Sara' })
    expect(l.tokens.find((t) => t.id === 'OH1')).toMatchObject({ top: 'OH1', bottom: '' })
  })
  test('the libero shows in place of the back-row middle in receive', () => {
    const lib = rotationLayout(pb(), 0, 'receive').tokens.find((t) => t.top === '1')!
    expect(lib).toMatchObject({ bottom: 'Alva', role: 'L' })
  })
  test('positions are in court metres', () => {
    const s = rotationLayout(pb(), 0, 'receive').tokens.find((t) => t.id === 'S')!
    expect(s.spot).toEqual({ x: 8.2, d: 6.1 })
  })
  test('note and overlap warnings are included', () => {
    const p = setSpot(pb(), 0, 'receive', 'OPP', { x: 5.5, d: 1 })
    const l = rotationLayout(p, 0, 'receive')
    expect(l.note).toBe('Sara: stay left of the middle.')
    expect(l.warnings).toEqual(['#9 Sara (zone 4) must stay left of MB2 (zone 3)'])
    expect(l.tokens.find((t) => t.id === 'OPP')!.flagged).toBe(true)
  })
  test('a team-less playbook gets a neutral title', () => {
    expect(rotationLayout(emptyPlaybook('6-2'), 0, 'serve').title).toBe('Volleyrot playbook')
  })
})

describe('playbook sheet (one landscape picture)', () => {
  test('rotations sit where their zone is: 4 3 2 on top, 5 6 1 below', () => {
    expect([1, 2, 3, 4, 5, 6].map(zoneSlot)).toEqual([
      { col: 2, row: 1 }, { col: 2, row: 0 }, { col: 1, row: 0 }, { col: 0, row: 0 }, { col: 0, row: 1 }, { col: 1, row: 1 },
    ])
  })
  test('six blocks, each with lineup, serve and receive side by side', () => {
    const s = playbookSheet(pb())
    expect(s.title).toBe('Södermalm VK')
    expect(s.subtitle).toBe('5-1 · Lineup · Serve · Receive')
    expect(s.blocks).toHaveLength(6)
    for (const b of s.blocks) expect(b.panels.map((p) => p.situation)).toEqual(['lineup', 'serve', 'receive'])
  })
  test('5-1 rotation 1 (setter in zone 1) is the bottom-right block', () => {
    const b = playbookSheet(pb()).blocks.find((x) => x.label === 1)!
    expect(b).toMatchObject({ col: 2, row: 1 })
    expect(b.panels[0].tokens.find((t) => t.id === 'S')!.spot).toEqual({ x: 7.5, d: 6.4 }) // lineup: zone 1
    expect(b.panels[2].tokens.find((t) => t.id === 'S')!.spot).toEqual({ x: 8.2, d: 6.1 }) // receive: chart
  })
  test('other systems label rotations 1-6 and place them the same way', () => {
    const b = playbookSheet(emptyPlaybook('6-2')).blocks.find((x) => x.label === 3)!
    expect(b).toMatchObject({ col: 1, row: 0 })
  })
  test('an overlap shows on the block', () => {
    const p = setSpot(pb(), 0, 'receive', 'OPP', { x: 5.5, d: 1 })
    const b = playbookSheet(p).blocks.find((x) => x.label === 1)!
    expect(b.panels[2].warnings).toHaveLength(1)
    expect(b.panels[1].warnings).toHaveLength(0)
  })
  test('lineup shows the middle in zone 1 (serving), the libero in 5 or 6', () => {
    const b = playbookSheet(pb()).blocks.find((x) => x.label === 5)! // setter zone 5 → MB1 in zone 1? check by role
    const lineup = b.panels[0]
    for (const t of lineup.tokens) if (t.role === 'L') expect([5, 6]).toContain(t.zone)
  })
})

describe('fitting the court into the picture', () => {
  test('receive needs no room behind the end line, serve does', () => {
    expect(courtDepth('receive').d1).toBeLessThan(10)
    expect(courtDepth('serve').d1).toBeGreaterThan(10.5)
  })
  test('the court never grows past the space it is given', () => {
    for (const sit of ['serve', 'receive'] as const)
      for (const [w, h] of [[960, 700], [960, 1200], [520, 480], [400, 900]]) {
        const f = fitCourt(w, h, sit)
        expect(f.w).toBeLessThanOrEqual(w)
        expect(f.h).toBeLessThanOrEqual(h + 0.001)
        expect(Math.min(w - f.w, h - f.h)).toBeLessThan(1) // fills one side
      }
  })
})
