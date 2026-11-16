import type { Attack } from '../domain/types'
import { SPEED_MAX, SPEED_MIN } from '../state/reducer'
import { ATTACKS } from './copy'

const Icon = ({ d, fill }: { d: string; fill?: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
)

export function Transport({ playing, onPrev, onToggle, onNext }: { playing: boolean; onPrev: () => void; onToggle: () => void; onNext: () => void }) {
  return (
    <div className="transport">
      <button type="button" className="icon-btn" aria-label="Previous rotation" onClick={onPrev}><Icon d="M19 5 L9 12 L19 19 Z M5 5 V19" /></button>
      <button type="button" className="play-btn" aria-label={playing ? 'Pause' : 'Play'} onClick={onToggle}>
        {playing ? <Icon fill d="M6 5h4v14H6z M14 5h4v14h-4z" /> : <Icon fill d="M7 4 L20 12 L7 20 Z" />}
        <span>{playing ? 'PAUSE' : 'PLAY'}</span>
      </button>
      <button type="button" className="icon-btn" aria-label="Next rotation" onClick={onNext}><Icon d="M5 5 L15 12 L5 19 Z M19 5 V19" /></button>
    </div>
  )
}

export const speedLabel = (s: number) => `${s.toFixed(2).replace(/\.?0+$/, '')}×`

export function SpeedSlider({ speed, onChange }: { speed: number; onChange: (s: number) => void }) {
  return (
    <div className="speed">
      <label htmlFor="speed" className="eyebrow">SPEED</label>
      <span className="speed-end">slow</span>
      <input id="speed" type="range" min={SPEED_MIN} max={SPEED_MAX} step={0.25} value={speed} aria-label="Speed" onChange={(e) => onChange(parseFloat(e.target.value))} />
      <span className="speed-end">fast</span>
      <span className="speed-val">{speedLabel(speed)}</span>
    </div>
  )
}

export function LiberoToggle({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <label className="libero">
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} />
      <span className="libero-mark" aria-hidden="true">L</span>
      <span className="libero-text">Libero in for back-row middle</span>
    </label>
  )
}

export function AttackChooser({ value, onChange }: { value: Attack; onChange: (a: Attack) => void }) {
  return (
    <div className="attack" role="group" aria-label="Attack from">
      <span className="eyebrow">ATTACK FROM</span>
      {ATTACKS.map((a) => (
        <button key={a.key} type="button" className="attack-btn" aria-pressed={a.key === value} onClick={() => onChange(a.key)}>{a.label}</button>
      ))}
    </div>
  )
}
