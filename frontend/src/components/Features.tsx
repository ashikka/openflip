type Step = {
  cmd: string
  title: string
  body: string
}

const STEPS: Step[] = [
  {
    cmd: 'scan --all',
    title: 'SENSE',
    body: 'Sub-GHz, NFC, BLE, Zigbee. Every fob, badge, and doorway around you turns into data on the screen.',
  },
  {
    cmd: 'fetch module',
    title: 'LEARN',
    body: 'Never seen this protocol before? Bit pings the open registry, pulls a signed decoder, installs it in seconds.',
  },
  {
    cmd: 'replay / emu',
    title: 'ACT',
    body: 'Replay, emulate, spoof, decode. All offline, all in your pocket. No cloud. No leash. No telemetry.',
  },
]

export default function Features() {
  return (
    <section>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 font-display text-[1.1rem] uppercase tracking-[0.2em] text-cyan">
            <span className="inline-block h-1.5 w-1.5 bg-cyan" />
            <span>// Operational Brief</span>
          </div>
          <h2 className="mt-2 max-w-[22ch] font-display text-[2.6rem] uppercase leading-[0.95] sm:text-[3.6rem]">
            How it works.
            <br />
            <span className="text-highlight">Why you&apos;ll carry it.</span>
          </h2>
        </div>
      </div>

      <div className="border-2 border-amber/70 bg-ink">
        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className={`grid gap-4 p-5 sm:grid-cols-[4rem_10rem_1fr] sm:items-center sm:gap-6 ${
              index > 0 ? 'border-t-2 border-amber/30' : ''
            }`}
          >
            <div className="flex items-center gap-3 font-display text-[1.15rem] uppercase tracking-[0.18em] text-amber/60">
              <span>0{index + 1}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-display text-[0.9rem] uppercase tracking-[0.16em] text-cyan">
                &gt; {step.cmd}
              </span>
              <span className="font-display text-[2.4rem] uppercase leading-none text-amber">
                {step.title}
              </span>
            </div>
            <p className="max-w-[60ch] text-[0.92rem] leading-7 text-amber/85">{step.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 border-2 border-cyan/60 bg-ink p-5 shadow-glow">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-display text-[2.2rem] uppercase leading-tight text-cyan sm:text-[2.6rem]">
            One device · Every protocol · Zero cloud.
          </div>
          <span className="chip-cyan whitespace-nowrap">Bit v0.1</span>
        </div>
        <p className="mt-3 max-w-[52ch] text-[0.85rem] leading-6 text-amber/75">
          A Flipper-shaped pocket deck with an AI brain. Your personal red-team, riding shotgun in your
          jacket — learning new tricks from the internet on demand.
        </p>
      </div>
    </section>
  )
}
