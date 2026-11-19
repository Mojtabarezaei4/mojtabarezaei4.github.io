import { useEffect, useState } from 'react'
import { SYSTEM_KEYS, type SystemKey } from '../domain/types'
import { decodePlaybook, encodePlaybook, type Playbook } from '../domain/playbook'
import { CoachScreen } from '../view/CoachScreen'
import { PickerScreen } from '../view/PickerScreen'
import { PlayerScreen } from '../view/PlayerScreen'

export type Route =
  | { screen: 'picker' }
  | { screen: 'play'; system: SystemKey; playbook?: Playbook }
  | { screen: 'coach'; playbook: Playbook | null }

export function parseRoute(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#/, '').split('?')
  const q = new URLSearchParams(query)
  const pb = q.get('pb') ? decodePlaybook(q.get('pb')!) : null
  if (path === '/coach') return { screen: 'coach', playbook: pb }
  if (path !== '/play') return { screen: 'picker' }
  if (pb) return { screen: 'play', system: pb.system, playbook: pb }
  const s = q.get('system') as SystemKey | null
  return { screen: 'play', system: s && SYSTEM_KEYS.includes(s) ? s : '5-1' }
}

export default function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  useEffect(() => {
    const on = () => { setRoute(parseRoute(window.location.hash)); window.scrollTo?.(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  if (route.screen === 'coach')
    return <CoachScreen initial={route.playbook} onChange={(pb) => history.replaceState(null, '', `#/coach?pb=${encodePlaybook(pb)}`)} />
  if (route.screen === 'play') return <PlayerScreen key={route.system} initialSystem={route.system} playbook={route.playbook ?? null} />
  return <PickerScreen />
}
