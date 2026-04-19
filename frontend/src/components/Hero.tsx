import { useEffect, useState } from 'react'
import DeviceMockup from './DeviceMockup'
import EmailCapture, { type WaitlistSuccess } from './EmailCapture'

const BOOT_LINES = [
  '> BOOTING_BIT',
  '> LOADING_REGISTRY',
  '> SWEEPING 300–928 MHZ',
  '> READY',
]

export default function Hero() {
  const [joined, setJoined] = useState<WaitlistSuccess | null>(null)
  const [bootIndex, setBootIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBootIndex((current) => (current + 1) % BOOT_LINES.length)
    }, 1400)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
      <div className="flex flex-col gap-7">
        <div className="flex items-center gap-2 font-display text-[1.15rem] uppercase tracking-[0.18em] text-cyan">
          <span className="inline-block h-1.5 w-1.5 bg-cyan blink-cursor" />
          <span>{BOOT_LINES[bootIndex]}</span>
          <span className="blink-cursor">_</span>
        </div>

        <div className="relative">
          <div className="absolute -left-4 top-0 hidden h-full w-1 bg-amber/60 sm:block" />
          <h1 className="font-display text-[3.2rem] uppercase leading-[0.9] sm:text-[4.4rem] lg:text-[5.2rem]">
            Your pocket
            <br />
            AI red-team
            <br />
            <span className="text-highlight">
              agent.<span className="blink-cursor text-amber">_</span>
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3 font-display text-[1.2rem] uppercase tracking-[0.16em] text-amber/80 sm:text-[1.35rem]">
          <span>Listen</span>
          <span className="text-amber/40">·</span>
          <span>Learn</span>
          <span className="text-amber/40">·</span>
          <span>Speak</span>
          <span className="mx-2 h-px flex-1 bg-amber/30" />
          <span className="text-cyan">v0.1 preview</span>
        </div>

        <p className="max-w-[48ch] text-[0.95rem] leading-7 text-amber/80">
          OpenFlip listens on Sub-GHz, NFC, and BLE — then learns new tricks from the open internet on
          demand. Pocket-sized, offline-first, community-powered.
        </p>

        <div className="relative panel p-5">
          <span aria-hidden="true" className="pointer-events-none absolute -left-[2px] -top-[2px] h-3 w-3 border-l-2 border-t-2 border-cyan" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-[2px] -top-[2px] h-3 w-3 border-r-2 border-t-2 border-cyan" />
          <span aria-hidden="true" className="pointer-events-none absolute -left-[2px] -bottom-[2px] h-3 w-3 border-l-2 border-b-2 border-cyan" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-[2px] -bottom-[2px] h-3 w-3 border-r-2 border-b-2 border-cyan" />

          <div className="mb-4 flex items-baseline justify-between gap-4">
            <span className="font-display text-[2rem] uppercase leading-none tracking-[0.08em] text-amber sm:text-[2.3rem]">
              &gt; Join the waitlist
              <span className="blink-cursor">_</span>
            </span>
            <span className="label-cyan whitespace-nowrap">Early access</span>
          </div>

          <EmailCapture buttonLabel="Join →" onSuccess={setJoined} analyticsSource="hero" />
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute -inset-6 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,130,0,0.22),transparent_70%)]" />
        <DeviceMockup mode={joined ? 'success' : 'demo'} position={joined?.position} />
      </div>
    </section>
  )
}
