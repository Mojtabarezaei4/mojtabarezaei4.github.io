import { useEffect, type Dispatch } from 'react'
import { BASE_TICK_MS, type Action, type State } from './reducer'

/** One pending timer at most; re-armed whenever what it depends on changes. */
export function useAutoplay(state: State, dispatch: Dispatch<Action>): void {
  const { playing, speed, rotation, system } = state
  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => dispatch({ type: 'next' }), BASE_TICK_MS / speed)
    return () => clearTimeout(t)
  }, [playing, speed, rotation, system, dispatch])
}
