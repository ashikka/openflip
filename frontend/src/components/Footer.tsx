import { useState } from 'react'
import Bit from './Bit'
import EmailCapture, { type WaitlistSuccess } from './EmailCapture'

const WAITLIST_PRICE = '$150'

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="border-2 border-amber px-3 py-2 font-display text-[1.35rem] uppercase tracking-[0.08em] transition-colors duration-100 hover:bg-amber hover:text-black sm:text-[1.55rem]"
    >
      {children}
    </a>
  )
}

export default function Footer() {
  const [joined, setJoined] = useState<WaitlistSuccess | null>(null)

  return (
    <footer className="bg-[#090909] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_auto]">
        <div className="pixel-panel p-6 sm:p-8">
          <div className="space-y-3">
            <div className="font-display text-[1.7rem] uppercase tracking-[0.1em] text-cyan sm:text-[1.9rem]">
              Missed The First Ping?
            </div>
            <h2 className="max-w-[13ch] font-display text-[3.2rem] uppercase leading-[0.9] sm:text-[4.2rem]">
              Join the waitlist before Bit powers down.
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-highlight sm:text-base">
              When the pod wakes up, the first people in line should already be there.
            </p>
          </div>

          <div className="mt-6 max-w-3xl">
            <EmailCapture
              compact
              buttonLabel="JOIN THE WAITLIST"
              onSuccess={setJoined}
              successLabel={joined ? `POSITION LOGGED // #${joined.position.toLocaleString()}` : undefined}
              analyticsSource="footer"
            />
          </div>

          <div className="mt-4 inline-flex border-2 border-cyan bg-cyan/10 px-4 py-3 font-display text-[1.45rem] uppercase tracking-[0.08em] text-cyan shadow-glow sm:text-[1.65rem]">
            Waitlist Price Lock // {WAITLIST_PRICE}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="border-2 border-amber/50 px-3 py-2 font-display text-[1.35rem] uppercase tracking-[0.08em] text-amber/60 sm:text-[1.55rem]">
              Docs Coming Soon
            </span>
            <FooterLink href="https://x.com/openflip">Twitter/X</FooterLink>
            <FooterLink href="https://discord.gg/openflip">Discord</FooterLink>
            <FooterLink href="https://github.com/ashikka/openflip">GitHub</FooterLink>
          </div>
        </div>

        <div className="pixel-panel flex min-h-[18rem] min-w-[18rem] flex-col items-center justify-between gap-5 p-6 text-center">
          <Bit state="sleeping" size={164} />
          <div className="space-y-3">
            <div className="font-display text-[2.4rem] uppercase leading-none sm:text-[2.8rem]">
              Bit Signs Off.
            </div>
            <p className="max-w-xs text-xs uppercase leading-6 tracking-[0.16em] text-amber/70">
              OpenFlip is an independent project, not affiliated with Flipper Devices Inc.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
