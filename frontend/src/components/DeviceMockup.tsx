import { useState } from 'react'
import { usePostHog } from '@posthog/react'
import Bit from './Bit'
import HeroDemo from './HeroDemo'

type DeviceMockupProps = {
  mode: 'demo' | 'success'
  position?: number | null
}

const SHARE_COPY = 'I just joined the @openflip waitlist — AI red-teaming in your pocket. openflip.io'

function DPad() {
  return (
    <div className="relative grid h-20 w-20 grid-cols-3 grid-rows-3 gap-0.5">
      <div />
      <div className="border border-amber/70 bg-ink" />
      <div />
      <div className="border border-amber/70 bg-ink" />
      <div className="border border-amber bg-ink" />
      <div className="border border-amber/70 bg-ink" />
      <div />
      <div className="border border-amber/70 bg-ink" />
      <div />
    </div>
  )
}

function BackButton() {
  return (
    <div className="flex h-10 w-10 items-center justify-center border border-amber/70 bg-ink font-display text-[1.4rem] text-amber/80">
      ←
    </div>
  )
}

function SuccessScreen({
  position,
  copied,
  onShare,
}: {
  position?: number | null
  copied: boolean
  onShare: () => void
}) {
  return (
    <div className="flex h-full flex-col justify-between gap-3 bg-[#130903] p-3 text-amber">
      <div className="flex items-center justify-between font-display text-[1.2rem] uppercase tracking-[0.12em]">
        <span>PodEntry.bit</span>
        <span className="text-cyan">Confirmed</span>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Bit state="excited" size={88} />
        <div className="text-left">
          <div className="font-display text-[1.35rem] uppercase text-highlight">Welcome</div>
          <div className="font-display text-[2.6rem] uppercase leading-none">
            #{(position ?? 0).toLocaleString()}
          </div>
          <div className="mt-1 font-display text-[1.15rem] uppercase tracking-[0.12em] text-cyan">
            Pocket AI red-team agent
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onShare}
        className="border-2 border-amber bg-amber px-3 py-2 font-display text-[1.35rem] uppercase tracking-[0.08em] text-ink hover:bg-highlight"
      >
        {copied ? 'Link copied ✓' : 'Share the pod'}
      </button>
    </div>
  )
}

export default function DeviceMockup({ mode, position }: DeviceMockupProps) {
  const posthog = usePostHog()
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(SHARE_COPY)
      posthog?.capture('waitlist_share_clicked', { position: position ?? null })
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[26rem]">
      <div className="border-2 border-amber bg-[#1a1410] p-3 shadow-pixel">
        <div className="flex items-center justify-between px-1 pb-2 font-display text-[1.1rem] uppercase tracking-[0.16em] text-highlight">
          <span>OpenFlip · v0</span>
          <span className="flex items-center gap-1 text-cyan">
            <span className="inline-block h-1.5 w-1.5 bg-cyan blink-cursor" />
            Link
          </span>
        </div>

        <div className="border-2 border-amber bg-ink p-2">
          <div className="scanlines border-2 border-amber bg-[#0f0702]">
            {mode === 'success' ? (
              <SuccessScreen position={position} copied={copied} onShare={handleShare} />
            ) : (
              <HeroDemo />
            )}
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between px-1">
          <DPad />
          <div className="flex flex-col items-end gap-2">
            <BackButton />
            <div className="grid w-12 gap-1">
              <span className="h-1 bg-amber/80" />
              <span className="h-1 bg-amber/60" />
              <span className="h-1 bg-amber/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
