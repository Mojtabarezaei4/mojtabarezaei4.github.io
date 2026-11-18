import { useEffect, type Dispatch } from 'react'
import { BASE_TICK_MS, RALLY_TICK_MS, type Action, type State } from './reducer'

/** One pending timer at most; re-armed whenever what it depends on changes. */
export function useAutoplay(state: State, dispatch: Dispatch<Action>): void {
  const { playing, speed, rotation, system, phase, rallyStep } = state
  useEffect(() => {
    if (!playing) return
    const rally = phase === 'rally'
    const t = setTimeout(() => dispatch({ type: rally ? 'rallyNext' : 'next' }), (rally ? RALLY_TICK_MS : BASE_TICK_MS) / speed)
    return () => clearTimeout(t)
  }, [playing, speed, rotation, system, phase, rallyStep, dispatch])
}
