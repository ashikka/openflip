import { useState } from 'react'
import DeviceMockup from './DeviceMockup'
import EmailCapture, { type WaitlistSuccess } from './EmailCapture'

const WAITLIST_PRICE = '$150'

export default function Hero() {
  const [joined, setJoined] = useState<WaitlistSuccess | null>(null)

  return (
    <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:gap-14">
      <div className="flex flex-col gap-8 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip-cyan">Pocket AI Red Team</span>
          <span className="chip">Waitlist Open</span>
          <span className="chip">Ships 2026</span>
        </div>

        <h1 className="font-display text-[3.4rem] uppercase leading-[0.92] sm:text-[4.6rem] lg:text-[5.6rem]">
          Your world is louder
          <br />
          <span className="text-highlight">than you think.</span>
        </h1>

        <p className="max-w-[46ch] text-[0.95rem] leading-7 text-amber/80">
          OpenFlip listens, learns new tricks from the internet, and speaks back. Pocket-sized,
          community-powered, open-registry.
        </p>

        <div className="panel p-5">
          <div className="flex items-end justify-between gap-4">
            <div className="label-cyan">Join the waitlist</div>
            <div className="text-right">
              <div className="label-sm">Price lock</div>
              <div className="font-display text-[2.4rem] leading-none text-cyan">{WAITLIST_PRICE}</div>
            </div>
          </div>
          <div className="mt-4">
            <EmailCapture buttonLabel="Get early access" onSuccess={setJoined} analyticsSource="hero" />
          </div>
          <p className="mt-3 text-[0.72rem] uppercase tracking-[0.16em] text-amber/50">
            No spam. One launch email. Unsubscribe any time.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="border-2 border-amber/40 bg-ink/60 p-3">
            <div className="label-cyan">Listen</div>
            <div className="mt-1 font-display text-[1.55rem] uppercase text-amber leading-tight">Sub-GHz · NFC · BLE</div>
          </div>
          <div className="border-2 border-amber/40 bg-ink/60 p-3">
            <div className="label-cyan">Learn</div>
            <div className="mt-1 font-display text-[1.55rem] uppercase text-amber leading-tight">Signed modules</div>
          </div>
          <div className="border-2 border-amber/40 bg-ink/60 p-3">
            <div className="label-cyan">Speak</div>
            <div className="mt-1 font-display text-[1.55rem] uppercase text-amber leading-tight">Pocket-sized</div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute -inset-6 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,130,0,0.18),transparent_70%)]" />
        <DeviceMockup mode={joined ? 'success' : 'demo'} position={joined?.position} />
      </div>
    </section>
  )
}
