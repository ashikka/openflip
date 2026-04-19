import { useState } from 'react'
import Bit from './Bit'
import EmailCapture, { type WaitlistSuccess } from './EmailCapture'

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="label-sm transition-colors hover:text-amber"
    >
      {children}
    </a>
  )
}

export default function Footer() {
  const [joined, setJoined] = useState<WaitlistSuccess | null>(null)

  return (
    <footer className="border-t-2 border-amber/40 bg-ink">
      <div className="mx-auto w-full max-w-shell px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Bit state="sleeping" size={64} />
            <div>
              <div className="font-display text-[2rem] uppercase leading-none">Missed the ping?</div>
              <p className="mt-1 text-[0.78rem] uppercase tracking-[0.14em] text-amber/60">
                Join the waitlist — be first in the pod.
              </p>
            </div>
          </div>

          <div className="w-full lg:max-w-md">
            <EmailCapture
              buttonLabel="Join"
              onSuccess={setJoined}
              successLabel={joined ? `You are #${joined.position.toLocaleString()}` : undefined}
              analyticsSource="footer"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-amber/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.7rem] uppercase tracking-[0.16em] text-amber/50">
            Independent project · Not affiliated with Flipper Devices Inc.
          </p>
          <div className="flex items-center gap-5">
            <FooterLink href="https://github.com/ashikka/openflip">GitHub</FooterLink>
            <FooterLink href="https://x.com/openflip">X</FooterLink>
            <FooterLink href="https://discord.gg/openflip">Discord</FooterLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
