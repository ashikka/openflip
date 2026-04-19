import { useState } from 'react'
import Bit from './Bit'
import EmailCapture, { type WaitlistSuccess } from './EmailCapture'

export default function Footer() {
  const [joined, setJoined] = useState<WaitlistSuccess | null>(null)

  return (
    <footer className="border-t border-amber/30 bg-ink sm:border-t-2 sm:border-amber/40">
      <div className="mx-auto w-full max-w-shell px-4 py-6 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Bit state="sleeping" size={52} className="shrink-0" />
            <div>
              <div className="font-display text-[1.5rem] uppercase leading-none sm:text-[2rem]">
                Missed the ping?
              </div>
              <p className="mt-1 text-[0.68rem] uppercase tracking-[0.14em] text-amber/60 sm:text-[0.78rem]">
                Join the waitlist — be first in the pod.
              </p>
            </div>
          </div>

          <div className="hidden w-full sm:block lg:max-w-md">
            <EmailCapture
              buttonLabel="Join"
              onSuccess={setJoined}
              successLabel={joined ? `You are #${joined.position.toLocaleString()}` : undefined}
              analyticsSource="footer"
            />
          </div>
        </div>

        <div className="mt-6 border-t border-amber/20 pt-4 sm:mt-8 sm:pt-5">
          <p className="text-[0.6rem] uppercase tracking-[0.14em] text-amber/50 sm:text-[0.7rem] sm:tracking-[0.16em]">
            Independent project · Not affiliated with Flipper Devices Inc.
          </p>
        </div>
      </div>
    </footer>
  )
}
