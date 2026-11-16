import { useMemo, useReducer } from 'react'
import { placePlayers, type PlacedPlayer } from '../domain/place'
import { setsThisRally } from '../domain/roles'
import type { Attack, Phase, SystemKey } from '../domain/types'
import { BASE_MOVE_MS, initialState, reducer } from '../state/reducer'
import { useAutoplay } from '../state/useAutoplay'
import { AttackChooser, LiberoToggle, SpeedSlider, Transport } from './Controls'
import { Court } from './Court'
import { PhaseTabs, RotationCounter, SystemChips } from './Header'
import { Legend, PhaseCard, RotationInfo } from './Sidebar'
import { Tokens } from './Tokens'

export function setterLine(players: PlacedPlayer[], system: SystemKey): string {
  const s = players.find((p) => setsThisRally(p, system))!
  if (system === '6-6') return `${s.code} is in zone 3, so they set`
  return `${s.code} sets · in zone ${s.zone} (${s.front ? 'front' : 'back'} row)`
}

export function summaryLine(players: PlacedPlayer[], phase: Phase, attack: Attack): string {
  const codes = (pred: (p: PlacedPlayer) => boolean, sep: string) => players.filter(pred).map((p) => p.show.code).join(sep)
  if (phase === 'defense') return `Attack from the ${attack}. ${codes((p) => p.tag === 'BLOCK', ' + ')} block.`
  if (phase === 'receive') return `Opponent serves. ${codes((p) => p.tag === 'PASS', ', ')} take the pass.`
  if (phase === 'switch') {
    const s = players.find((p) => p.tag === 'SETS')!
    return s.zone === 3 && s.role === 'P' ? `${s.show.code} sets from zone 3.` : `${s.show.code} runs to the target to set.`
  }
  return `${players.find((p) => p.zone === 1)!.show.code} serves from zone 1.`
}

export function PlayerScreen({ initialSystem, onHome }: { initialSystem: SystemKey; onHome?: () => void }) {
  const [state, dispatch] = useReducer(reducer, initialSystem, initialState)
  useAutoplay(state, dispatch)
  const { system, rotation, phase, attack, libero, playing, speed } = state
  const players = useMemo(() => placePlayers({ system, rotation, phase, attack, libero }), [system, rotation, phase, attack, libero])

  return (
    <div className="ps">
      <header className="ps-header">
        <div className="ps-top">
          <a className="brand" href="#/" onClick={onHome} aria-label="Volleyrot – back to system picker">
            <Ball /><span>VOLLEYROT</span>
          </a>
          <SystemChips value={system} onChange={(s) => dispatch({ type: 'system', system: s })} />
        </div>
        <RotationCounter rotation={rotation} setterLine={setterLine(players, system)} onJump={(r) => dispatch({ type: 'jump', rotation: r })} />
        <PhaseTabs value={phase} onChange={(p) => dispatch({ type: 'phase', phase: p })} />
      </header>
      <div className="ps-body">
        <main className="ps-main">
          <div className="court-stage">
            <Court phase={phase} attack={attack} showPath />
            <Tokens players={players} durationMs={Math.round(BASE_MOVE_MS / speed)} showGhosts={phase !== 'lineup'} />
          </div>
          {phase === 'defense' && <AttackChooser value={attack} onChange={(a) => dispatch({ type: 'attack', attack: a })} />}
          <div className="controls">
            <Transport playing={playing} onPrev={() => dispatch({ type: 'prev' })} onNext={() => dispatch({ type: 'next' })} onToggle={() => dispatch({ type: 'toggle' })} />
            <SpeedSlider speed={speed} onChange={(v) => dispatch({ type: 'speed', speed: v })} />
            {system !== '6-6' && <LiberoToggle on={libero} onChange={(on) => dispatch({ type: 'libero', on })} />}
          </div>
        </main>
        <aside className="ps-aside">
          <PhaseCard phase={phase} system={system} summary={summaryLine(players, phase, attack)} />
          <Legend system={system} libero={libero && system !== '6-6'} />
          <RotationInfo players={players} />
        </aside>
      </div>
    </div>
  )
}

export function Ball() {
  return (
    <svg width="28" height="28" viewBox="0 0 34 34" aria-hidden="true">
      <circle cx="17" cy="17" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path d="M17 3 C 24 10, 24 24, 17 31 M4 12 C 12 15, 22 15, 30 12 M4 22 C 12 19, 22 19, 30 22" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
