import { useEffect, useState } from 'react'
import { SYSTEM_KEYS, type SystemKey } from '../domain/types'
import { PickerScreen } from '../view/PickerScreen'
import { PlayerScreen } from '../view/PlayerScreen'

export type Route = { screen: 'picker' } | { screen: 'play'; system: SystemKey }

export function parseRoute(hash: string): Route {
  const [path, query = ''] = hash.replace(/^#/, '').split('?')
  if (path !== '/play') return { screen: 'picker' }
  const s = new URLSearchParams(query).get('system') as SystemKey | null
  return { screen: 'play', system: s && SYSTEM_KEYS.includes(s) ? s : '5-1' }
}

export default function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))
  useEffect(() => {
    const on = () => { setRoute(parseRoute(window.location.hash)); window.scrollTo?.(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route.screen === 'play' ? <PlayerScreen key={route.system} initialSystem={route.system} /> : <PickerScreen />
}
