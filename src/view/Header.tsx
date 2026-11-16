import type { Phase, SystemKey } from '../domain/types'
import { SYSTEM_KEYS } from '../domain/types'
import { PHASES } from './copy'

export function SystemChips({ value, onChange }: { value: SystemKey; onChange: (s: SystemKey) => void }) {
  return (
    <div className="chips" role="group" aria-label="System">
      {SYSTEM_KEYS.map((s) => (
        <button key={s} type="button" className="chip" aria-pressed={s === value} onClick={() => onChange(s)}>{s}</button>
      ))}
    </div>
  )
}

export function RotationCounter({ rotation, setterLine, onJump }: { rotation: number; setterLine: string; onJump: (r: number) => void }) {
  return (
    <div className="counter">
      <div className="counter-num">
        <span className="eyebrow">ROTATION</span>
        <div><output aria-label="Current rotation" className="counter-big">{rotation + 1}</output><span className="counter-of">/ 6</span></div>
      </div>
      <div className="counter-side">
        <div className="pips" role="group" aria-label="Jump to rotation">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <button key={i} type="button" className="pip" aria-label={`Rotation ${i + 1}`} aria-pressed={i === rotation} onClick={() => onJump(i)}>{i + 1}</button>
          ))}
        </div>
        <span className="counter-line">{setterLine}</span>
      </div>
    </div>
  )
}

export function PhaseTabs({ value, onChange }: { value: Phase; onChange: (p: Phase) => void }) {
  return (
    <div className="phases" role="group" aria-label="Phase">
      {PHASES.map((p) => (
        <button key={p.key} type="button" className="phase" aria-pressed={p.key === value} onClick={() => onChange(p.key)}>{p.label}</button>
      ))}
    </div>
  )
}
