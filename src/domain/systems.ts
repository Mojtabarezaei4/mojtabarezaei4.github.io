import type { Role, SystemKey, Zone } from './types'

export interface SystemDef {
  start: Record<Zone, string>
  legend: Role[]
}

export const SYSTEMS: Record<SystemKey, SystemDef> = {
  '5-1': { start: { 1: 'S', 2: 'OH1', 3: 'MB2', 4: 'OPP', 5: 'OH2', 6: 'MB1' }, legend: ['S', 'OH', 'MB', 'OPP', 'L'] },
  '6-2': { start: { 1: 'S1', 2: 'OH1', 3: 'MB1', 4: 'S2', 5: 'OH2', 6: 'MB2' }, legend: ['S', 'OH', 'MB', 'L'] },
  '4-2': { start: { 1: 'S1', 2: 'OH1', 3: 'MB1', 4: 'S2', 5: 'OH2', 6: 'MB2' }, legend: ['S', 'OH', 'MB', 'L'] },
  '6-6': { start: { 1: 'P1', 2: 'P2', 3: 'P3', 4: 'P4', 5: 'P5', 6: 'P6' }, legend: ['P', 'S'] },
}

export const ROLE_INFO: Record<Role, { name: string; color: string; job: string }> = {
  S: { name: 'Setter', color: '#FFD84D', job: 'Takes the second touch and sets up the attack.' },
  OH: { name: 'Outside Hitter', color: '#5CE1E6', job: 'Attacks from the left. Main serve-receive passer.' },
  MB: { name: 'Middle Blocker', color: '#A3E635', job: 'Blocks at the net, hits fast middle sets.' },
  OPP: { name: 'Opposite', color: '#FF6F59', job: 'Attacks from the right. Always across from the setter.' },
  L: { name: 'Libero', color: '#C4A1FF', job: 'Back-row defender in a different jersey. Swaps in for a middle.' },
  P: { name: 'Player', color: '#E6E1D6', job: 'All-rounder: passes, sets and hits as they rotate.' },
}
