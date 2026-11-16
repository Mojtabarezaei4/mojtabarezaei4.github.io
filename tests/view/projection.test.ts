import { expect, test } from 'vitest'
import { courtGeometry, project } from '../../src/view/projection'

test('court centre line projects to the middle of the view', () => {
  expect(project(4.5, 0).x).toBe(500)
})
test('end line is wider than the net line (perspective)', () => {
  const w = (d: number) => project(9, d).x - project(0, d).x
  expect(w(9)).toBeGreaterThan(w(0))
})
test('net top is above the floor at the net', () => {
  expect(project(4.5, 0, 2.43).y).toBeLessThan(project(4.5, 0).y)
})
test('geometry gives the court polygon as 4 points', () => {
  expect(courtGeometry().court.split(' ')).toHaveLength(4)
})

test('the top labels (y ≤ 40) sit above the net antennae', () => {
  const g = courtGeometry()
  for (const a of g.antennae) expect(Math.min(a.y1, a.y2)).toBeGreaterThan(48)
})
test('the end-line label stays inside the view', () => {
  expect(courtGeometry().endLabel.y).toBeLessThan(855)
})
