type Step = {
  cmd: string
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    cmd: 'scan --all',
    title: 'SENSE',
    body: 'Sub-GHz, NFC, BLE, Zigbee. Every fob, badge, and doorway around you turns into data.',
  },
  {
    cmd: 'fetch module',
    title: 'LEARN',
    body: 'New protocol? Bit pings the open registry, pulls a signed decoder, installs it in seconds.',
  },
  {
    cmd: 'replay / emu',
    title: 'ACT',
    body: 'Replay, emulate, spoof, decode. Offline, in your pocket. No cloud. No leash.',
  },
]

export default function Features() {
  return (
    <section>
      <div className="mb-5 sm:mb-8">
        <div className="flex items-center gap-2 font-display text-[0.95rem] uppercase tracking-[0.2em] text-cyan sm:gap-3 sm:text-[1.1rem]">
          <span className="inline-block h-1.5 w-1.5 bg-cyan" />
          <span>// Operational Brief</span>
        </div>
        <h2 className="mt-2 max-w-[22ch] font-display text-[1.8rem] leading-[1.05] tracking-[-0.01em] sm:text-[3rem]">
          How it works.
          <br />
          <span className="text-highlight">Why you&apos;ll carry it.</span>
        </h2>
      </div>

      <div className="border border-amber/70 bg-ink sm:border-2">
        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className={`flex flex-col gap-2 p-4 sm:grid sm:grid-cols-[3rem_9rem_1fr] sm:items-center sm:gap-6 sm:p-5 ${
              index > 0 ? 'border-t border-amber/30 sm:border-t-2' : ''
            }`}
          >
            <div className="flex items-baseline gap-3 sm:block">
              <span className="font-display text-[1rem] uppercase tracking-[0.18em] text-amber/60 sm:text-[1.15rem]">
                0{index + 1}
              </span>
              <span className="font-display text-[1.6rem] uppercase leading-none text-amber sm:hidden">
                {step.title}
              </span>
            </div>
            <div className="hidden flex-col gap-1 sm:flex">
              <span className="font-display text-[0.9rem] uppercase tracking-[0.16em] text-cyan">
                &gt; {step.cmd}
              </span>
              <span className="font-display text-[2.4rem] uppercase leading-none text-amber">
                {step.title}
              </span>
            </div>
            <p className="max-w-[60ch] text-[0.8rem] leading-6 text-amber/85 sm:text-[0.92rem] sm:leading-7">
              {step.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 border border-cyan/60 bg-ink p-4 shadow-glow sm:mt-8 sm:border-2 sm:p-5">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="font-display text-[1.4rem] leading-tight tracking-[-0.01em] text-cyan sm:text-[2rem]">
            One device · Every protocol · Zero cloud.
          </div>
          <span className="hidden chip-cyan whitespace-nowrap sm:inline-flex">Bit v0.1</span>
        </div>
        <p className="mt-2 hidden max-w-[52ch] text-[0.85rem] leading-6 text-amber/75 sm:mt-3 sm:block">
          A Flipper-shaped pocket deck with an AI brain. Your personal red-team, riding shotgun in your
          jacket — learning new tricks from the internet on demand.
        </p>
      </div>
    </section>
  )
}
