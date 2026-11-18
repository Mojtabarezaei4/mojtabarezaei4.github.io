import type { Attack, Phase } from '../domain/types'

export const PHASES: { key: Phase; label: string }[] = [
  { key: 'lineup', label: 'Lineup' }, { key: 'serve', label: 'Serve' }, { key: 'receive', label: 'Receive' },
  { key: 'switch', label: 'Switch' }, { key: 'defense', label: 'Defense' }, { key: 'rally', label: 'Rally' },
]
export const ATTACKS: { key: Attack; label: string }[] = [
  { key: 'left', label: 'Left' }, { key: 'middle', label: 'Middle' }, { key: 'right', label: 'Right' },
]
export const PHASE_TEXT: Record<Phase, { title: string; text: string }> = {
  lineup: { title: 'Rotational order', text: 'Where everyone must stand at the moment of the serve. Each player has to stay in order with their neighbours — this is the overlap rule.' },
  serve: { title: 'We serve', text: 'The player who rotated into zone 1 steps behind the end line and serves. Everyone else holds their spot until the ball is hit.' },
  receive: { title: 'Serve receive', text: 'The other team serves. Three players form a passing line: both outside hitters and the libero. Everyone else gets out of the way, stacked at the net or tucked behind a teammate, but still in rotational order. Dashed rings show each player’s official zone.' },
  switch: { title: 'Switch to base', text: 'Once the serve is hit, players run to their specialist spots: hitters to their side, middles to the middle, the setter to the target. Dashed rings show where they started.' },
  rally: { title: 'Rally playback', text: 'One whole point when the other team serves: serve, pass, set, attack, then back to base. Watch the ball and who touches it. Autoplay goes through the steps, then the team rotates.' },
  defense: { title: 'Defense', text: 'The other team attacks. The front-row players on that side jump to block. Everyone else spreads around the block: one covers short tips, one digs down the line, one digs cross-court and one covers deep. This setup is called perimeter defense.' },
}
export const SWITCH_6_6 = 'In a 6-6 nobody switches. Players stay in their zones and whoever is in zone 3 sets.'
export const RECEIVE_6_6 = 'The other team serves. Five players spread out in a W to pass; the player in zone 3 waits at the net to set.'
