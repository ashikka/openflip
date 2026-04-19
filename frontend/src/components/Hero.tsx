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
    <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
      <div className="flex flex-col gap-5 sm:gap-7">
        <div className="hidden items-center gap-2 font-display text-[1.15rem] uppercase tracking-[0.18em] text-cyan sm:flex">
          <span className="inline-block h-1.5 w-1.5 bg-cyan blink-cursor" />
          <span>{BOOT_LINES[bootIndex]}</span>
          <span className="blink-cursor">_</span>
        </div>

        <div className="relative">
          <div className="absolute -left-3 top-0 hidden h-full w-1 bg-amber/60 sm:block" />
          <h1 className="font-display text-[2.4rem] leading-[1.02] tracking-[-0.01em] sm:text-[3.8rem] lg:text-[4.6rem]">
            The AI hacker
            <br />
            <span className="text-highlight">
              in your pocket.<span className="blink-cursor text-amber">_</span>
            </span>
          </h1>
        </div>

        <div className="hidden items-center gap-3 font-display text-[0.95rem] tracking-[0.04em] text-amber/80 sm:flex sm:text-[1.05rem]">
          <span>Listen</span>
          <span className="text-amber/40">·</span>
          <span>Learn</span>
          <span className="text-amber/40">·</span>
          <span>Speak</span>
          <span className="mx-2 h-px flex-1 bg-amber/30" />
          <span className="text-cyan">v0.1 preview</span>
        </div>

        <p className="max-w-[52ch] text-[0.8rem] leading-6 text-amber/80 sm:text-[0.95rem] sm:leading-7">
          Talks to every key fob, badge, door, and beacon around you.
          Doesn&apos;t know one? It fetches the module and learns — live, on demand.
        </p>

        <div className="relative panel p-4 sm:p-5">
          <span aria-hidden="true" className="pointer-events-none absolute -left-[2px] -top-[2px] hidden h-3 w-3 border-l-2 border-t-2 border-cyan sm:block" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-[2px] -top-[2px] hidden h-3 w-3 border-r-2 border-t-2 border-cyan sm:block" />
          <span aria-hidden="true" className="pointer-events-none absolute -left-[2px] -bottom-[2px] hidden h-3 w-3 border-l-2 border-b-2 border-cyan sm:block" />
          <span aria-hidden="true" className="pointer-events-none absolute -right-[2px] -bottom-[2px] hidden h-3 w-3 border-r-2 border-b-2 border-cyan sm:block" />

          <div className="mb-3 flex items-baseline justify-between gap-3 sm:mb-4 sm:gap-4">
            <span className="font-display text-[1.3rem] leading-none tracking-[-0.01em] text-amber sm:text-[1.75rem]">
              <span className="text-amber/50">&gt;</span> Join the waitlist
              <span className="blink-cursor">_</span>
            </span>
            <span className="hidden label-cyan whitespace-nowrap sm:inline">Early access</span>
          </div>

          <EmailCapture buttonLabel="Join →" onSuccess={setJoined} analyticsSource="hero" />
        </div>
      </div>

      <div className="relative hidden lg:block">
        <div className="pointer-events-none absolute -inset-6 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,130,0,0.22),transparent_70%)]" />
        <DeviceMockup mode={joined ? 'success' : 'demo'} position={joined?.position} />
      </div>
    </section>
  )
}
