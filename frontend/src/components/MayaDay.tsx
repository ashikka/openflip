type Scene = {
  id: string
  time: string
  location: string
  caption: string
}

const SCENES: Scene[] = [
  {
    id: 'gym-locker',
    time: '07:42',
    location: 'Gym locker',
    caption: 'A locker latch chirps a pattern Bit has never heard before.',
  },
  {
    id: 'elevator-badge',
    time: '09:15',
    location: 'Elevator badge',
    caption: 'The office reader spits a badge exchange that sounds routine — until it isn’t.',
  },
  {
    id: 'hotel-corridor',
    time: '12:30',
    location: 'Hotel corridor',
    caption: 'A hallway lock ticks awake and its radio starts sounding like a story.',
  },
  {
    id: 'parking-garage',
    time: '16:20',
    location: 'Parking garage',
    caption: 'A barrier arm waits for a fob while its fixed-code cousin leaks into the air.',
  },
  {
    id: 'apartment-buzzer',
    time: '21:55',
    location: 'Apartment buzzer',
    caption: 'The front door is still talking to anyone willing to listen.',
  },
]

function RFWaves({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="6" fill="none" stroke="#00E5FF" strokeWidth="1.5" className="rf-wave" />
      <circle cx={x} cy={y} r="10" fill="none" stroke="#00E5FF" strokeWidth="1.5" className="rf-wave rf-wave-delay-1" />
      <circle cx={x} cy={y} r="14" fill="none" stroke="#00E5FF" strokeWidth="1.5" className="rf-wave rf-wave-delay-2" />
    </g>
  )
}

function SceneArt({ id }: { id: string }) {
  switch (id) {
    case 'gym-locker':
      return (
        <svg viewBox="0 0 160 96" className="h-full w-full" preserveAspectRatio="none" shapeRendering="crispEdges">
          <rect width="160" height="96" fill="#140C06" />
          <rect y="70" width="160" height="26" fill="#2A1808" />
          <rect x="10" y="8" width="28" height="62" fill="#3A250D" />
          <rect x="42" y="8" width="28" height="62" fill="#3A250D" />
          <rect x="74" y="8" width="28" height="62" fill="#3A250D" />
          <rect x="34" y="31" width="3" height="7" fill="#FF8200" />
          <rect x="108" y="23" width="8" height="8" fill="#C99B6B" />
          <rect x="104" y="31" width="16" height="18" fill="#FF8200" />
          <rect x="106" y="49" width="4" height="18" fill="#5A350D" />
          <rect x="114" y="49" width="4" height="18" fill="#5A350D" />
          <RFWaves x={36} y={34} />
        </svg>
      )
    case 'elevator-badge':
      return (
        <svg viewBox="0 0 160 96" className="h-full w-full" preserveAspectRatio="none" shapeRendering="crispEdges">
          <rect width="160" height="96" fill="#13100A" />
          <rect x="46" y="10" width="66" height="68" fill="#2C210F" />
          <rect x="50" y="14" width="28" height="60" fill="#4A2B0F" />
          <rect x="80" y="14" width="28" height="60" fill="#4A2B0F" />
          <rect x="116" y="34" width="10" height="18" fill="#FF8200" />
          <rect x="118" y="37" width="6" height="4" fill="#00E5FF" />
          <rect x="20" y="26" width="8" height="8" fill="#C99B6B" />
          <rect x="16" y="34" width="16" height="22" fill="#FF8200" />
          <rect y="78" width="160" height="18" fill="#22170D" />
          <RFWaves x={121} y={42} />
        </svg>
      )
    case 'hotel-corridor':
      return (
        <svg viewBox="0 0 160 96" className="h-full w-full" preserveAspectRatio="none" shapeRendering="crispEdges">
          <rect width="160" height="96" fill="#140B06" />
          <rect x="0" y="0" width="34" height="96" fill="#241607" />
          <rect x="126" y="0" width="34" height="96" fill="#241607" />
          <rect x="54" y="14" width="52" height="58" fill="#3C220C" />
          <rect x="82" y="38" width="4" height="10" fill="#FF8200" />
          <rect x="30" y="60" width="12" height="12" fill="#C99B6B" />
          <rect x="26" y="72" width="20" height="10" fill="#FF8200" />
          <rect x="0" y="72" width="160" height="24" fill="#2B1709" />
          <RFWaves x={84} y={43} />
        </svg>
      )
    case 'parking-garage':
      return (
        <svg viewBox="0 0 160 96" className="h-full w-full" preserveAspectRatio="none" shapeRendering="crispEdges">
          <rect width="160" height="96" fill="#0F1012" />
          <rect y="62" width="160" height="34" fill="#181C20" />
          <rect x="96" y="24" width="12" height="28" fill="#FF8200" />
          <rect x="98" y="29" width="8" height="6" fill="#00E5FF" />
          <rect x="52" y="44" width="42" height="6" fill="#FFA940" />
          <rect x="18" y="56" width="38" height="12" fill="#5A6370" />
          <rect x="22" y="50" width="20" height="8" fill="#5A6370" />
          <rect x="118" y="36" width="8" height="8" fill="#C99B6B" />
          <rect x="114" y="44" width="16" height="18" fill="#FF8200" />
          <RFWaves x={102} y={33} />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 160 96" className="h-full w-full" preserveAspectRatio="none" shapeRendering="crispEdges">
          <rect width="160" height="96" fill="#121212" />
          <rect x="76" y="8" width="52" height="80" fill="#2C1A0C" />
          <rect x="120" y="34" width="8" height="22" fill="#FF8200" />
          <rect x="121" y="38" width="6" height="3" fill="#00E5FF" />
          <rect x="30" y="28" width="8" height="8" fill="#C99B6B" />
          <rect x="26" y="36" width="16" height="22" fill="#FF8200" />
          <rect x="0" y="82" width="160" height="14" fill="#20140A" />
          <RFWaves x={124} y={40} />
        </svg>
      )
  }
}

export default function MayaDay() {
  return (
    <section>
      <div className="mb-8 flex flex-col gap-2">
        <span className="label-cyan">One day · five ignored signals</span>
        <h2 className="max-w-[18ch] font-display text-[2.6rem] uppercase leading-[0.95] sm:text-[3.4rem]">
          Every door, every fob, every badge — emitting.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SCENES.map((scene) => (
          <article
            key={scene.id}
            className="group flex flex-col overflow-hidden border-2 border-amber/70 bg-ink transition-colors hover:border-amber"
          >
            <div className="aspect-[16/9] overflow-hidden bg-ink" style={{ imageRendering: 'pixelated' }}>
              <SceneArt id={scene.id} />
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-[1.35rem] uppercase tracking-[0.12em] text-cyan">
                  {scene.time}
                </span>
                <span className="label-sm">{scene.location}</span>
              </div>
              <p className="text-[0.85rem] leading-6 text-amber/80">{scene.caption}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
