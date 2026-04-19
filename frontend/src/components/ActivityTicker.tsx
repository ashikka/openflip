const TICKER_ITEMS = [
  { tone: 'base', text: '@mfoc-team published mifare-hardnested v1.4' },
  { tone: 'accent', text: '3 min ago' },
  { tone: 'base', text: '1,847 researchers on waitlist' },
  { tone: 'base', text: '@ghostlayer published ble-airtag-spoof v0.3' },
  { tone: 'accent', text: '7 min ago' },
  { tone: 'base', text: '@travel-redteam pushed hotel-onity-v3 metadata' },
  { tone: 'accent', text: '12 min ago' },
  { tone: 'base', text: 'registry sync passed on 42 new modules' },
]

function TickerRun({ run }: { run: number }) {
  return (
    <div className="flex shrink-0 items-center gap-5 px-4" aria-hidden={run > 0}>
      {TICKER_ITEMS.map((item, index) => (
        <span
          key={`${run}-${index}-${item.text}`}
          className={`font-display text-[1.6rem] uppercase tracking-[0.08em] sm:text-[1.9rem] ${
            item.tone === 'accent' ? 'text-cyan' : 'text-amber'
          }`}
        >
          {item.text}
        </span>
      ))}
    </div>
  )
}

export default function ActivityTicker() {
  return (
    <section className="border-y-2 border-amber bg-black py-3">
      <div className="overflow-hidden">
        <div className="ticker-track flex w-max whitespace-nowrap">
          <TickerRun run={0} />
          <TickerRun run={1} />
        </div>
      </div>
    </section>
  )
}
