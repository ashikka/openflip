type Feature = {
  icon: string
  title: string
  body: string
}

const FEATURES: Feature[] = [
  {
    icon: '◉',
    title: 'Listens',
    body: 'Sub-GHz, NFC, BLE — always sweeping the noise floor around you.',
  },
  {
    icon: '↯',
    title: 'Learns',
    body: 'Asks the open registry for a signed decoder, installs only what it needs.',
  },
  {
    icon: '◆',
    title: 'Speaks',
    body: 'Replays, emulates, and decodes. Pocket-sized, offline-first.',
  },
]

export default function Features() {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <span className="label-cyan">What it does</span>
          <h2 className="mt-1 font-display text-[2.2rem] uppercase leading-none sm:text-[2.8rem]">
            Three tricks. Nothing else.
          </h2>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="border-2 border-amber/70 bg-ink p-5">
            <div className="font-display text-[2.4rem] leading-none text-highlight">{feature.icon}</div>
            <div className="mt-3 font-display text-[1.8rem] uppercase leading-none text-amber">
              {feature.title}
            </div>
            <p className="mt-2 text-[0.82rem] leading-6 text-amber/75">{feature.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
