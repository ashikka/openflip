const TICKER_ITEMS = [
  { tone: 'base', text: '@mfoc-team published mifare-hardnested v1.4' },
  { tone: 'accent', text: '3m ago' },
  { tone: 'base', text: '@ghostlayer published ble-airtag-spoof v0.3' },
  { tone: 'accent', text: '7m ago' },
  { tone: 'base', text: '@travel-redteam pushed hotel-onity-v3' },
  { tone: 'accent', text: '12m ago' },
  { tone: 'base', text: 'registry sync · 42 modules' },
  { tone: 'accent', text: 'just now' },
]

function TickerRun({ run }: { run: number }) {
  return (
    <div className="flex shrink-0 items-center gap-6 px-6" aria-hidden={run > 0}>
      {TICKER_ITEMS.map((item, index) => (
        <span
          key={`${run}-${index}-${item.text}`}
          className={`font-display text-[1.1rem] uppercase tracking-[0.14em] ${
            item.tone === 'accent' ? 'text-cyan' : 'text-amber/80'
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
    <section className="border-y border-amber/30 bg-ink py-2">
      <div className="overflow-hidden">
        <div className="ticker-track flex w-max whitespace-nowrap">
          <TickerRun run={0} />
          <TickerRun run={1} />
        </div>
      </div>
    </section>
  )
}
