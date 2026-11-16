export const VIEW_W = 1000
export const VIEW_H = 860
const F = 1322, CAM = 26, H = 15.4, HY = -552

/** Court meters → SVG coords. x 0..9 across, d from net, z height. s = scale (px per meter). */
export function project(x: number, d: number, z = 0): { x: number; y: number; s: number } {
  const s = F / (CAM - d)
  return { x: 500 + (x - 4.5) * s, y: HY + (H - z) * s, s }
}

type P3 = [number, number, number?]
export interface Seg { x1: number; y1: number; x2: number; y2: number }
const r = (n: number) => Math.round(n * 10) / 10
const pts = (a: P3[]) => a.map(([x, d, z]) => { const p = project(x, d, z); return `${r(p.x)},${r(p.y)}` }).join(' ')
const seg = (a: P3, b: P3): Seg => { const p = project(a[0], a[1], a[2]), q = project(b[0], b[1], b[2]); return { x1: r(p.x), y1: r(p.y), x2: r(q.x), y2: r(q.y) } }
const pt = (x: number, d: number, z = 0) => { const p = project(x, d, z); return { x: r(p.x), y: r(p.y), s: p.s } }

export function courtGeometry() {
  let mesh = ''
  for (let x = 0; x <= 9.001; x += 0.5) { const a = project(x, 0, 2.43), b = project(x, 0, 1.43); mesh += `M${r(a.x)} ${r(a.y)}L${r(b.x)} ${r(b.y)}` }
  for (const z of [1.68, 1.93, 2.18]) { const a = project(0, 0, z), b = project(9, 0, z); mesh += `M${r(a.x)} ${r(a.y)}L${r(b.x)} ${r(b.y)}` }
  const ring: [number, number][] = [[6.5, 3.0], [6.5, 4.4], [6.5, 5.7], [4.5, 5.7], [2.5, 5.7], [2.5, 4.4], [2.5, 3.0], [4.5, 3.0]]
  const loop = ring.map(([x, d], i) => { const p = project(x, d); return `${i ? 'L' : 'M'}${r(p.x)} ${r(p.y)}` }).join(' ') + ' Z'
  const numeral = (x: number, d: number) => { const p = pt(x, d); return { x: p.x, y: p.y, fs: Math.round(p.s * 0.95) } }
  const atk = (bx: number, lx: number, ld: number, cx: number, cd: number) => ({ ball: pt(bx, -1.3, 3.4), line: seg([bx, -1.3, 3.4], [lx, ld]), cross: seg([bx, -1.3, 3.4], [cx, cd]) })
  return {
    free: pts([[-3, 0], [12, 0], [12, 13], [-3, 13]]),
    court: pts([[0, 0], [9, 0], [9, 9], [0, 9]]),
    front: pts([[0, 0], [9, 0], [9, 3], [0, 3]]),
    dividers: [seg([3, 0], [3, 9]), seg([6, 0], [6, 9])],
    attackLine: seg([0, 3], [9, 3]),
    attackExt: [seg([-1.75, 3], [0, 3]), seg([9, 3], [10.75, 3])],
    numerals: ([[4, 0.35, 2.75], [3, 3.35, 2.75], [2, 6.35, 2.75], [5, 0.35, 8.65], [6, 3.35, 8.65], [1, 6.35, 8.65]] as const).map(([n, x, d]) => ({ n, ...numeral(x, d) })),
    loop,
    netShadow: pts([[0, 0], [9, 0], [9, 0.35], [0, 0.35]]),
    net: pts([[0, 0, 2.43], [9, 0, 2.43], [9, 0, 1.43], [0, 0, 1.43]]),
    mesh,
    tape: seg([0, 0, 2.43], [9, 0, 2.43]),
    bottomTape: seg([0, 0, 1.43], [9, 0, 1.43]),
    posts: [seg([-1, 0, 0], [-1, 0, 2.55]), seg([10, 0, 0], [10, 0, 2.55])],
    antennae: [seg([0, 0, 1.43], [0, 0, 3.23]), seg([9, 0, 1.43], [9, 0, 3.23])],
    endLabel: pt(4.5, 11.4),
    band: pts([[0.4, 4.6], [8.6, 4.6], [8.6, 7.2], [0.4, 7.2]]),
    bandLabel: pt(0.6, 7.0),
    attacks: { right: atk(7.7, 8.5, 7.6, 1.3, 7.2), middle: atk(4.5, 2.6, 7.9, 6.4, 7.9), left: atk(1.3, 0.5, 7.6, 7.7, 7.2) },
  }
}
export type CourtGeometry = ReturnType<typeof courtGeometry>
