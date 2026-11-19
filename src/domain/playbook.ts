import { overlapPairs } from './overlap'
import { placePlayers } from './place'
import { playersAt } from './rotation'
import { SYSTEM_KEYS, type Spot, type SystemKey, type Zone } from './types'

/** Situations a coach can edit. Both are "at the moment of the serve", so the overlap rule applies. */
export type Situation = 'serve' | 'receive'
export interface RosterEntry { name: string; num: string }

/** A coach's playbook. Only changes from the defaults are stored, so share links stay short. */
export interface Playbook {
  v: 1
  system: SystemKey
  team: string
  /** keyed by player id (S, OH1, …) plus 'L' for the libero */
  roster: Record<string, RosterEntry>
  /** keyed by `${rotation}-${situation}` → player id → spot */
  spots: Record<string, Record<string, Spot>>
  notes: Record<string, string>
}

export const playbookKey = (rotation: number, situation: Situation) => `${rotation}-${situation}`

export function emptyPlaybook(system: SystemKey): Playbook {
  return { v: 1, system, team: '', roster: {}, spots: {}, notes: {} }
}

export function defaultSpots(system: SystemKey, rotation: number, situation: Situation): Record<string, Spot> {
  const placed = placePlayers({ system, rotation, phase: situation, attack: 'right', libero: false })
  return Object.fromEntries(placed.map((p) => [p.id, { ...p.spot }]))
}

export function spotsFor(pb: Playbook, rotation: number, situation: Situation): Record<string, Spot> {
  return { ...defaultSpots(pb.system, rotation, situation), ...(pb.spots[playbookKey(rotation, situation)] ?? {}) }
}

export function setSpot(pb: Playbook, rotation: number, situation: Situation, id: string, spot: Spot): Playbook {
  const k = playbookKey(rotation, situation)
  return { ...pb, spots: { ...pb.spots, [k]: { ...(pb.spots[k] ?? {}), [id]: { x: round(spot.x), d: round(spot.d) } } } }
}

export function resetSpots(pb: Playbook, rotation: number, situation: Situation): Playbook {
  const spots = { ...pb.spots }
  delete spots[playbookKey(rotation, situation)]
  return { ...pb, spots }
}

export function setRoster(pb: Playbook, id: string, entry: RosterEntry): Playbook {
  return { ...pb, roster: { ...pb.roster, [id]: entry } }
}

export function setNote(pb: Playbook, rotation: number, situation: Situation, note: string): Playbook {
  const notes = { ...pb.notes, [playbookKey(rotation, situation)]: note }
  if (!note) delete notes[playbookKey(rotation, situation)]
  return { ...pb, notes }
}

export function noteFor(pb: Playbook, rotation: number, situation: Situation): string {
  return pb.notes[playbookKey(rotation, situation)] ?? ''
}

/** "#9 Sara" when the roster knows the player, else the code ("OPP"). */
export function playerLabel(pb: Playbook, id: string): string {
  const r = pb.roster[id]
  if (!r || (!r.name && !r.num)) return id
  return [r.num ? `#${r.num}` : '', r.name].filter(Boolean).join(' ')
}

export function playbookViolations(pb: Playbook, rotation: number, situation: Situation): string[] {
  const players = playersAt(pb.system, rotation)
  const spots = spotsFor(pb, rotation, situation)
  const byZone = Object.fromEntries(players.map((p) => [p.zone, spots[p.id]])) as Record<Zone, Spot>
  const idAt = (z: Zone) => players.find((p) => p.zone === z)!.id
  const who = (z: Zone) => `${playerLabel(pb, idAt(z))} (zone ${z})`
  return overlapPairs(byZone, situation === 'serve' ? 1 : undefined).map(({ a, b, kind }) =>
    kind === 'left' ? `${who(a)} must stay left of ${who(b)}` : `${who(a)} must stay in front of ${who(b)}`)
}

export function playbookStatus(pb: Playbook, rotation: number, situation: Situation): 'default' | 'custom' | 'overlap' {
  if (playbookViolations(pb, rotation, situation).length) return 'overlap'
  return pb.spots[playbookKey(rotation, situation)] ? 'custom' : 'default'
}

/** URL-safe share code: JSON → UTF-8 → base64url. */
export function encodePlaybook(pb: Playbook): string {
  const bytes = new TextEncoder().encode(JSON.stringify(pb))
  let bin = ''
  bytes.forEach((b) => { bin += String.fromCharCode(b) })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodePlaybook(code: string): Playbook | null {
  try {
    if (!code) return null
    const bin = atob(code.replace(/-/g, '+').replace(/_/g, '/'))
    const pb = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))))
    const obj = (o: unknown) => typeof o === 'object' && o !== null && !Array.isArray(o)
    if (!obj(pb) || pb.v !== 1 || !SYSTEM_KEYS.includes(pb.system) || typeof pb.team !== 'string') return null
    if (!obj(pb.roster) || !obj(pb.spots) || !obj(pb.notes)) return null
    return pb as Playbook
  } catch {
    return null
  }
}

const round = (n: number) => Math.round(n * 10) / 10
