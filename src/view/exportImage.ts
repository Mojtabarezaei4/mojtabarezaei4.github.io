import type { Playbook } from '../domain/playbook'
import { ROLE_INFO } from '../domain/systems'
import { courtDepth, exportFileName, fitCourt, playbookSheet, type Panel, type RotationLayout } from './exportLayout'

const C = { ground: '#0F1318', panel: '#171C23', border: '#2A313B', text: '#EDE8DF', text2: '#C9C3B8', muted: '#9AA3AE', accent: '#FFB24D', court: '#2E5E8E', front: '#336898', free: '#1E3A57', bad: '#FF6F59' }
const DISPLAY = "'Barlow Condensed', 'Arial Narrow', sans-serif"
const BODY = "Barlow, system-ui, sans-serif"
const MONO = "'JetBrains Mono', ui-monospace, monospace"

/** Draw one rotation's flat court with tokens into the box (x, y, w); returns the height used. */
function paintCourt(ctx: CanvasRenderingContext2D, l: RotationLayout, x: number, y: number, w: number, k: number, depth: Panel = l.situation, tokenScale = 1): number {
  const v = courtDepth(depth)
  const sc = w / (v.x1 - v.x0)
  const h = (v.d1 - v.d0) * sc
  const px = (m: number) => x + (m - v.x0) * sc
  const py = (m: number) => y + (m - v.d0) * sc
  ctx.fillStyle = C.free; roundRect(ctx, x, y, w, h, 8 * k); ctx.fill()
  ctx.fillStyle = C.court; ctx.fillRect(px(0), py(0), 9 * sc, 9 * sc)
  ctx.fillStyle = C.front; ctx.fillRect(px(0), py(0), 9 * sc, 3 * sc)
  ctx.strokeStyle = 'rgba(237,232,223,.28)'; ctx.lineWidth = 1.5 * k; ctx.setLineDash([6 * k, 6 * k])
  for (const xm of [3, 6]) { ctx.beginPath(); ctx.moveTo(px(xm), py(0)); ctx.lineTo(px(xm), py(9)); ctx.stroke() }
  ctx.setLineDash([])
  ctx.strokeStyle = C.text; ctx.lineWidth = 3 * k
  ctx.beginPath(); ctx.moveTo(px(0), py(3)); ctx.lineTo(px(9), py(3)); ctx.stroke()
  ctx.strokeRect(px(0), py(0), 9 * sc, 9 * sc)
  // net
  ctx.lineWidth = 5 * k; ctx.beginPath(); ctx.moveTo(px(-0.6), py(0)); ctx.lineTo(px(9.6), py(0)); ctx.stroke()
  ctx.fillStyle = C.muted; ctx.font = `600 ${11 * k}px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
  ctx.fillText('NET', px(4.5), py(0) - 6 * k)
  // zone numbers
  ctx.font = `800 ${26 * k}px ${DISPLAY}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
  for (const [z, zx, zd] of [[4, 0.25, 2.75], [3, 3.25, 2.75], [2, 6.25, 2.75], [5, 0.25, 8.75], [6, 3.25, 8.75], [1, 6.25, 8.75]] as const) {
    ctx.fillStyle = z === 1 ? 'rgba(255,178,77,.6)' : 'rgba(237,232,223,.3)'
    ctx.fillText(String(z), px(zx), py(zd))
  }
  // tokens: all discs first, then all names on top, so a close teammate never hides a name
  const r = 0.42 * sc * tokenScale
  for (const t of l.tokens) {
    const cx = px(t.spot.x), cy = py(t.spot.d)
    ctx.beginPath(); ctx.arc(cx, cy, r + 3 * k, 0, Math.PI * 2); ctx.fillStyle = t.flagged ? C.bad : C.text; ctx.fill()
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = ROLE_INFO[t.role].color; ctx.fill()
    ctx.lineWidth = 2.5 * k; ctx.strokeStyle = C.ground; ctx.stroke()
    ctx.fillStyle = C.ground; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.font = `800 ${(t.top.length > 3 ? 0.36 : 0.5) * sc * tokenScale}px ${DISPLAY}`
    ctx.fillText(t.top, cx, cy + 1 * k)
  }
  for (const t of l.tokens) {
    if (!t.bottom) continue
    const cx = px(t.spot.x), cy = py(t.spot.d)
    ctx.font = `600 ${Math.max(11 * k, 0.3 * sc * tokenScale)}px ${BODY}`; ctx.textAlign = 'center'
    const tw = ctx.measureText(t.bottom).width + 10 * k
    const ty = cy + r + 6 * k
    ctx.fillStyle = 'rgba(15,19,24,.85)'; roundRect(ctx, cx - tw / 2, ty, tw, 0.36 * sc * tokenScale + 6 * k, 4 * k); ctx.fill()
    ctx.fillStyle = C.text; ctx.textBaseline = 'top'; ctx.fillText(t.bottom, cx, ty + 3 * k)
  }
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'
  return h
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath()
}

function header(ctx: CanvasRenderingContext2D, title: string, subtitle: string, x: number, y: number) {
  ctx.fillStyle = C.text; ctx.font = `800 64px ${DISPLAY}`; ctx.fillText(title.toUpperCase(), x, y + 56)
  ctx.fillStyle = C.accent; ctx.font = `700 24px ${MONO}`; ctx.fillText(subtitle.toUpperCase(), x, y + 100)
}

function footer(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = C.muted; ctx.font = `500 18px ${MONO}`; ctx.textAlign = 'right'
  ctx.fillText(`VOLLEYROT · ${location.host || 'volleyrot'}`, W - 60, H - 36); ctx.textAlign = 'left'
}

/** The whole playbook on one landscape picture: blocks placed like the zones, Lineup · Serve · Receive in each. */
export async function renderPlaybookCanvas(pb: Playbook): Promise<HTMLCanvasElement> {
  await document.fonts?.ready
  const sheet = playbookSheet(pb)
  const W = 3300, margin = 60, blockGap = 80, panelGap = 16, top = 170, blockTitle = 54, panelTitle = 34, foot = 80
  const panelW = (W - 2 * margin - 2 * blockGap - 6 * panelGap) / 9
  const panelH = fitCourt(panelW, 10_000, 'serve').h // same depth in every panel so the courts line up
  const blockW = 3 * panelW + 2 * panelGap
  const blockH = blockTitle + panelTitle + panelH
  const H = Math.round(top + 2 * blockH + blockGap + foot)
  const cv = Object.assign(document.createElement('canvas'), { width: W, height: H })
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = C.ground; ctx.fillRect(0, 0, W, H)
  header(ctx, sheet.title, sheet.subtitle, margin, 30)
  ctx.fillStyle = C.muted; ctx.font = `500 22px ${MONO}`; ctx.textAlign = 'right'
  ctx.fillText('ROTATIONS PLACED LIKE THE ZONES · NET AT THE TOP OF EVERY COURT', W - margin, 130); ctx.textAlign = 'left'
  for (const b of sheet.blocks) {
    const bx = margin + b.col * (blockW + blockGap), by = top + b.row * (blockH + blockGap)
    const bad = b.panels.some((p) => p.warnings.length)
    ctx.fillStyle = C.panel; roundRect(ctx, bx - 14, by - 6, blockW + 28, blockH + 20, 10); ctx.fill()
    ctx.fillStyle = bad ? C.bad : C.text; ctx.font = `800 40px ${DISPLAY}`
    ctx.fillText(`ROTATION ${b.label}${bad ? ' · OVERLAP' : ''}`, bx, by + 38)
    b.panels.forEach((l, i) => {
      const px = bx + i * (panelW + panelGap), py = by + blockTitle
      ctx.fillStyle = l.warnings.length ? C.bad : C.accent; ctx.font = `700 20px ${MONO}`
      ctx.fillText(l.subtitle.split(' · ')[2].toUpperCase(), px, py + 22)
      paintCourt(ctx, l, px, py + panelTitle, panelW, 0.62, 'serve', 1.45)
    })
  }
  footer(ctx, W, H)
  return cv
}

function download(cv: HTMLCanvasElement, name: string) {
  cv.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: name })
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }, 'image/png')
}

export async function downloadPlaybookImage(pb: Playbook) {
  download(await renderPlaybookCanvas(pb), exportFileName(pb))
}
