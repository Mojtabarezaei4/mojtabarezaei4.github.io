import { placePlayers } from '../domain/place'
import { noteFor, playbookViolations, spotsFor, type Playbook, type Situation } from '../domain/playbook'
import { playersAt, rotationLabel } from '../domain/rotation'
import type { Role, Spot, Zone } from '../domain/types'

/** A panel on the picture: the official lineup, or one of the coach-editable situations. */
export type Panel = Situation | 'lineup'

/** What goes into an exported image, independent of how it is painted. */
export interface ImageToken {
  id: string
  role: Role
  zone: Zone
  spot: Spot
  /** big text in the disc: shirt number, else the position code */
  top: string
  /** small text under the disc: name, if known */
  bottom: string
  flagged: boolean
}
export interface RotationLayout {
  title: string
  subtitle: string
  situation: Panel
  tokens: ImageToken[]
  note: string
  warnings: string[]
}

const SIT_LABEL: Record<Panel, string> = { lineup: 'Lineup', serve: 'We serve', receive: 'Receive' }

export function rotationLayout(pb: Playbook, rotation: number, situation: Panel): RotationLayout {
  const spots = situation === 'lineup'
    ? Object.fromEntries(placePlayers({ system: pb.system, rotation, phase: 'lineup', attack: 'right', libero: false }).map((p) => [p.id, p.spot]))
    : spotsFor(pb, rotation, situation)
  const warnings = situation === 'lineup' ? [] : playbookViolations(pb, rotation, situation)
  const tokens = playersAt(pb.system, rotation).map((p) => {
    // The libero replaces the back-row middle, except the middle serving from zone 1.
    const libero = pb.system !== '6-6' && p.role === 'MB' && !p.front && !(situation !== 'receive' && p.zone === 1)
    const key = libero ? 'L' : p.id
    const r = pb.roster[key]
    return {
      id: p.id,
      role: libero ? 'L' : p.role,
      zone: p.zone,
      spot: spots[p.id],
      top: r?.num || (libero ? 'L' : p.id),
      bottom: r?.name ?? '',
      flagged: warnings.some((w) => w.includes(`(zone ${p.zone})`)),
    } satisfies ImageToken
  })
  return {
    title: pb.team || 'Volleyrot playbook',
    subtitle: `${pb.system} · Rotation ${rotationLabel(pb.system, rotation)} · ${SIT_LABEL[situation]}`,
    situation,
    tokens,
    note: situation === 'lineup' ? '' : noteFor(pb, rotation, situation),
    warnings,
  }
}

/** Where rotation N sits on the picture: like zone N on the court (4 3 2 on top, 5 6 1 below). */
export function zoneSlot(label: number): { col: number; row: number } {
  const slots: Record<number, { col: number; row: number }> = {
    4: { col: 0, row: 0 }, 3: { col: 1, row: 0 }, 2: { col: 2, row: 0 },
    5: { col: 0, row: 1 }, 6: { col: 1, row: 1 }, 1: { col: 2, row: 1 },
  }
  return slots[label]
}

/** The whole playbook on one picture: six rotation blocks, each with Lineup, Serve and Receive side by side. */
export function playbookSheet(pb: Playbook) {
  return {
    title: pb.team || 'Volleyrot playbook',
    subtitle: `${pb.system} · Lineup · Serve · Receive`,
    blocks: [0, 1, 2, 3, 4, 5].map((r) => {
      const label = rotationLabel(pb.system, r)
      return { label, ...zoneSlot(label), panels: (['lineup', 'serve', 'receive'] as const).map((p) => rotationLayout(pb, r, p)) }
    }),
  }
}

const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function exportFileName(pb: Playbook): string {
  return `${slug(pb.team) || 'volleyrot'}-${pb.system}-playbook.png`
}

/** Visible area of the flat court in metres. Serve needs room behind the end line for the server. */
export function courtDepth(situation: Panel) {
  return { x0: -0.9, x1: 9.9, d0: -0.5, d1: situation === 'serve' ? 11.2 : 9.7 }
}

/** Largest court (keeping proportions) that fits in w × h pixels. */
export function fitCourt(w: number, h: number, situation: Panel): { w: number; h: number } {
  const v = courtDepth(situation)
  const ratio = (v.d1 - v.d0) / (v.x1 - v.x0)
  return w * ratio <= h ? { w, h: w * ratio } : { w: h / ratio, h }
}
