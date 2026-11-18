import type { PlacedPlayer, Scene } from './place'
import { placePlayers } from './place'
import { playersAt } from './rotation'
import type { SystemKey, Zone } from './types'

/** Zones a player stands in, rotation 0..5. */
export function pathFor(system: SystemKey, id: string): Zone[] {
  return [0, 1, 2, 3, 4, 5].map((r) => playersAt(system, r).find((p) => p.id === id)!.zone)
}

const ROW_LEFT: Partial<Record<Zone, Zone>> = { 3: 4, 2: 3, 6: 5, 1: 6 }
const ROW_RIGHT: Partial<Record<Zone, Zone>> = { 4: 3, 3: 2, 5: 6, 6: 1 }
const BEHIND: Partial<Record<Zone, Zone>> = { 4: 5, 3: 6, 2: 1 }
const IN_FRONT: Partial<Record<Zone, Zone>> = { 5: 4, 6: 3, 1: 2 }
const SIDE: Record<string, string> = { FL: 'left front', FM: 'middle front', FR: 'right front', BL: 'left back', BM: 'middle back', BR: 'right back' }

export interface JobNote {
  title: string
  text: string
  offCourt: boolean
}

/** Plain-language "your job here" for one player in the current scene. */
export function jobNote(p: PlacedPlayer, s: Scene): JobNote {
  const title = `Zone ${p.zone} · ${p.front ? 'front' : 'back'} row`
  const replaced = p.role === 'MB' && p.show.role === 'L'
  if (replaced)
    return { title, offCourt: true, text: 'You are off court: the libero (L) takes your place in the back row. You come back on when you rotate to the front row (or to serve in zone 1).' }

  const all = placePlayers(s)
  const code = (z: Zone | undefined) => (z ? all.find((q) => q.zone === z)!.show.code : '')
  const sixSix = s.system === '6-6'

  switch (s.phase) {
    case 'lineup': {
      const parts: string[] = []
      if (ROW_LEFT[p.zone]) parts.push(`right of ${code(ROW_LEFT[p.zone])}`)
      if (ROW_RIGHT[p.zone]) parts.push(`left of ${code(ROW_RIGHT[p.zone])}`)
      if (BEHIND[p.zone]) parts.push(`in front of ${code(BEHIND[p.zone])}`)
      if (IN_FRONT[p.zone]) parts.push(`behind ${code(IN_FRONT[p.zone])}`)
      return { title, offCourt: false, text: `When the ball is served you must stand ${parts.join(', ')}. That is the overlap rule.` }
    }
    case 'serve':
      if (p.zone === 1) return { title, offCourt: false, text: 'You serve. Step behind the end line, serve, then run in to your defensive spot.' }
      return { title, offCourt: false, text: p.front ? 'Your team is serving. Stay at the net, ready to block their attack.' : 'Your team is serving. Hold your zone, ready to dig their attack.' }
    case 'receive':
      if (p.tag === 'PASS') return { title, offCourt: false, text: 'You pass the serve. Get low on the passing line and send the ball high to the setter’s target near the net.' }
      if (p.tag === 'SETS') return { title, offCourt: false, text: sixSix ? 'You are in zone 3, so you set. Wait at the net for the pass.' : 'You set. Stay out of the passing line, then run to the target near the net for the second touch.' }
      return { title, offCourt: false, text: p.front ? 'You don’t pass. Stand at the net out of the passers’ way and get ready to attack.' : 'You don’t pass. Stay deep and out of the way, then move to your back-row spot.' }
    case 'switch':
      if (p.tag === 'SETS') return { title, offCourt: false, text: sixSix ? 'In a 6-6 nobody switches. You are in zone 3, so you set.' : 'Run to the target near the net and set the second ball.' }
      if (sixSix) return { title, offCourt: false, text: 'In a 6-6 nobody switches. Play the ball from your own zone.' }
      return { title, offCourt: false, text: `Move to the ${SIDE[slotName(p)]} – your specialist spot${p.front ? ', where you attack from' : ', where you defend'}.` }
    case 'rally': {
      const r: Record<string, string> = {
        PASS: 'You take the serve: pass it high to the setter’s target near the net.',
        SETS: 'You set: get under the ball at the target and set your hitter.',
        ATTACK: 'You attack: approach, jump and hit the ball over the net.',
        COVER: 'You cover your hitter: get low close to them in case the ball is blocked back.',
      }
      if (p.tag && r[p.tag]) return { title, offCourt: false, text: r[p.tag] }
      return { title, offCourt: false, text: s.rallyStep === 4 ? 'Get back to your base spot, ready to defend.' : 'Follow the ball and move to where you can help: approach if you are in the front row, cover if you are in the back.' }
    }
    case 'defense': {
      const t: Record<string, string> = {
        BLOCK: 'Jump and block at the net with your partner.',
        TIP: 'Pull off the net and cover short tips that drop just behind the block.',
        LINE: 'Dig hard shots hit straight down your sideline.',
        CROSS: 'Dig shots hit diagonally across the court.',
        DIG: 'Dig balls hit into your area.',
        DEEP: 'Cover deep balls and anything that flies off the block.',
      }
      return { title, offCourt: false, text: t[p.tag ?? 'DIG'] }
    }
  }
}

function slotName(p: PlacedPlayer): keyof typeof SIDE {
  const fx = p.spot.x < 3 ? 'L' : p.spot.x > 6 ? 'R' : 'M'
  return `${p.front ? 'F' : 'B'}${fx}` as keyof typeof SIDE
}
