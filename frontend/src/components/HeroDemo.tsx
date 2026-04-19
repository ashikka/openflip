import { useEffect, useState } from 'react'
import Bit, { type BitState } from './Bit'

type DemoStage = {
  label: string
  state: BitState
  frequency: string
  headline: string
  status: string
  progress: number
  module?: { name: string; author: string }
}

const STAGES: DemoStage[] = [
  {
    label: 'PASSIVE',
    state: 'idle',
    frequency: 'LISTENING',
    headline: 'BIT IDLING',
    status: 'CHANNEL SWEEP',
    progress: 10,
  },
  {
    label: 'LOCK',
    state: 'scanning',
    frequency: '868 MHz',
    headline: 'UNKNOWN PROTOCOL',
    status: 'SIGNAL PEAK',
    progress: 24,
  },
  {
    label: 'QUERY',
    state: 'scanning',
    frequency: '868 MHz',
    headline: 'SEARCHING REGISTRY',
    status: 'REMOTE LOOKUP',
    progress: 42,
  },
  {
    label: 'MODULE',
    state: 'installing',
    frequency: '868 MHz',
    headline: 'MODULE FOUND',
    status: 'INSTALLING',
    progress: 72,
    module: { name: 'hotel-onity-v3', author: '@travel-redteam' },
  },
  {
    label: 'VERIFY',
    state: 'installing',
    frequency: '868 MHz',
    headline: 'VERIFYING ✓',
    status: 'SIGNED',
    progress: 92,
    module: { name: 'hotel-onity-v3', author: '@travel-redteam' },
  },
  {
    label: 'READY',
    state: 'excited',
    frequency: 'READY',
    headline: 'DECODED',
    status: 'PLAYBOOK LIVE',
    progress: 100,
    module: { name: 'hotel-onity-v3', author: 'verified' },
  },
]

export default function HeroDemo() {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStageIndex((current) => (current + 1) % STAGES.length)
    }, 3000)
    return () => window.clearInterval(timer)
  }, [])

  const stage = STAGES[stageIndex]

  return (
    <div className="scan-bars flex h-full min-h-[15rem] flex-col justify-between gap-3 p-3 text-amber">
      <div className="flex items-center justify-between font-display text-[1.05rem] uppercase tracking-[0.14em]">
        <span>OpenFlip://scan</span>
        <span className="text-cyan">{stage.frequency}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-[78px] w-[78px] shrink-0 items-center justify-center border-2 border-amber bg-ink/60">
          <Bit state={stage.state} size={68} />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div
            className={`truncate font-display text-[1.45rem] uppercase leading-tight ${
              stage.label === 'LOCK' ? 'screen-flash text-highlight' : ''
            }`}
          >
            {stage.headline}
          </div>
          <div className="inline-block border border-amber/70 px-2 py-0.5 font-display text-[1.05rem] uppercase tracking-[0.12em] text-amber/80">
            {stage.status}
          </div>
          {stage.module ? (
            <div className="truncate font-display text-[1.1rem] uppercase tracking-[0.08em] text-cyan">
              {stage.module.name}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border border-amber/70 p-1.5">
        <div className="mb-1 flex items-center justify-between font-display text-[0.95rem] uppercase tracking-[0.14em] text-amber/80">
          <span>{stage.label}</span>
          <span className="text-cyan">{stage.progress}%</span>
        </div>
        <div className="h-2 border border-amber/70 bg-ink">
          <div
            className={`progress-fill h-full ${stage.state === 'installing' ? 'bg-cyan' : 'bg-amber'}`}
            style={{ width: `${stage.progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
