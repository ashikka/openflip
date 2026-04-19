import { useMemo, useState } from 'react'
import { usePostHog } from '@posthog/react'

type RegistryModule = {
  id: string
  name: string
  author: string
  installs: number
  rating: number
  justAdded?: boolean
  description: string
  hardware: string[]
}

const MODULES: RegistryModule[] = [
  {
    id: 'hid-prox-clone',
    name: 'hid-prox-clone',
    author: '@mfoc-team',
    installs: 2481,
    rating: 5,
    description: 'Normalizes HID Prox captures, trims facility-code drift, stages replay attempts for older badge readers.',
    hardware: ['Sub-GHz', 'LF RFID'],
  },
  {
    id: 'tesla-keyfob-v2',
    name: 'tesla-keyfob-v2',
    author: '@car-hackers',
    installs: 1438,
    rating: 4,
    description: 'Packages field captures into a fast keyfob workflow with sane defaults for drive-up testing.',
    hardware: ['Sub-GHz', 'BLE'],
  },
  {
    id: 'hyundai-rolling-2024',
    name: 'hyundai-rolling-2024',
    author: '@rf-collective',
    installs: 1117,
    rating: 4,
    justAdded: true,
    description: 'Tracks rolling-code windows from recent Hyundai captures; exposes drift, timing, and re-sync candidates.',
    hardware: ['Sub-GHz'],
  },
  {
    id: 'mifare-hardnested',
    name: 'mifare-hardnested',
    author: '@nfc-lab',
    installs: 4102,
    rating: 5,
    description: 'Wraps hardnested attacks into a cleaner pocket flow with better pre-flight checks for key sectors.',
    hardware: ['NFC'],
  },
  {
    id: 'ble-airtag-spoof',
    name: 'ble-airtag-spoof',
    author: '@ghostlayer',
    installs: 1733,
    rating: 4,
    justAdded: true,
    description: 'Builds a quick BLE advertising profile for tag spoofing, telemetry checks, and signal shaping.',
    hardware: ['BLE'],
  },
  {
    id: 'garage-fixed-code',
    name: 'garage-fixed-code',
    author: '@subghz-gang',
    installs: 2987,
    rating: 5,
    description: 'Finds fixed-code remotes fast, fingerprints pulse widths, stores a clean replay-ready profile.',
    hardware: ['Sub-GHz'],
  },
  {
    id: 'tpms-sniff',
    name: 'tpms-sniff',
    author: '@tire-whisper',
    installs: 964,
    rating: 4,
    description: 'Listens for TPMS chatter, annotates wheel positions, makes low-power captures readable.',
    hardware: ['Sub-GHz'],
  },
  {
    id: 'schindler-elevator',
    name: 'schindler-elevator',
    author: '@vertical-research',
    installs: 807,
    rating: 4,
    description: 'Maps elevator panel timing and reader state into a workflow for physical-access teams.',
    hardware: ['LF RFID', 'NFC'],
  },
  {
    id: 'hotel-onity-v3',
    name: 'hotel-onity-v3',
    author: '@travel-redteam',
    installs: 1956,
    rating: 5,
    justAdded: true,
    description: 'Builds a tight hotel-lock profile with timing hints, packet labels, and just what Bit needs at runtime.',
    hardware: ['NFC', 'Sub-GHz'],
  },
  {
    id: 'zigbee-smartlock',
    name: 'zigbee-smartlock',
    author: '@home-invader',
    installs: 1289,
    rating: 4,
    description: 'Parses Zigbee lock chatter, highlights pairing states, stages clean install hooks for command tests.',
    hardware: ['Zigbee', 'BLE'],
  },
  {
    id: 'honda-rolling-bypass',
    name: 'honda-rolling-bypass',
    author: '@car-hackers',
    installs: 1384,
    rating: 4,
    description: 'Bundles recent Honda rolling-code research into a guided capture-and-replay workflow.',
    hardware: ['Sub-GHz'],
  },
  {
    id: 'starlink-dishy-debug',
    name: 'starlink-dishy-debug',
    author: '@orbital-ops',
    installs: 619,
    rating: 3,
    description: 'A lab-first helper for dishy debug traffic, paired with a fast parser for sync-state bursts.',
    hardware: ['BLE', 'Wi-Fi'],
  },
]

function PixelStars({ rating, dim = false }: { rating: number; dim?: boolean }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < rating
        return (
          <svg key={index} viewBox="0 0 8 8" className="h-3 w-3" aria-hidden="true">
            <path
              d="M3 0H5V2H7V4H5V6H3V4H1V2H3Z"
              fill={filled ? (dim ? '#0A0A0A' : '#FF8200') : dim ? 'rgba(10,10,10,0.35)' : '#663300'}
            />
          </svg>
        )
      })}
    </div>
  )
}

export default function ModuleRegistry() {
  const posthog = usePostHog()
  const [selectedId, setSelectedId] = useState('mifare-hardnested')

  const selectedModule = useMemo(
    () => MODULES.find((item) => item.id === selectedId) ?? MODULES[0],
    [selectedId],
  )

  return (
    <section>
      <div className="mb-8 flex flex-col gap-2">
        <span className="label-cyan">Module registry</span>
        <h2 className="max-w-[22ch] font-display text-[2.6rem] uppercase leading-[0.95] sm:text-[3.4rem]">
          One registry. Every protocol. Growing nightly.
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MODULES.map((module) => {
          const active = module.id === selectedId
          return (
            <button
              type="button"
              key={module.id}
              onClick={() => {
                setSelectedId(module.id)
                posthog?.capture('registry_module_opened', {
                  module: module.id,
                  author: module.author,
                })
              }}
              className={`border-2 p-3 text-left transition-colors duration-75 ${
                active
                  ? 'border-amber bg-amber text-ink'
                  : 'border-amber/70 bg-ink text-amber hover:border-amber hover:bg-amber/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-display text-[1.5rem] uppercase leading-none">
                    {module.name}
                  </div>
                  <div className={`mt-1 text-[0.7rem] uppercase tracking-[0.14em] ${active ? 'text-ink/70' : 'text-amber/70'}`}>
                    {module.author}
                  </div>
                </div>
                {module.justAdded ? (
                  <span
                    className={`shrink-0 border px-1.5 py-0.5 font-display text-[0.8rem] uppercase tracking-[0.14em] ${
                      active ? 'border-ink bg-ink text-cyan' : 'border-cyan/70 bg-ink text-cyan'
                    }`}
                  >
                    New
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex items-center justify-between text-[0.7rem] uppercase tracking-[0.14em]">
                <span className={active ? 'text-ink/70' : 'text-amber/70'}>
                  {module.installs.toLocaleString()} installs
                </span>
                <PixelStars rating={module.rating} dim={active} />
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 border-2 border-amber bg-ink p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="font-display text-[2.2rem] uppercase leading-none sm:text-[2.6rem]">
              {selectedModule.name}
            </div>
            <div className="mt-1 font-display text-[1.2rem] uppercase tracking-[0.12em] text-cyan">
              {selectedModule.author}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedModule.hardware.map((item) => (
              <span key={item} className="chip">{item}</span>
            ))}
          </div>
        </div>

        <p className="mt-4 max-w-3xl text-[0.9rem] leading-6 text-amber/80">
          {selectedModule.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" disabled className="btn opacity-40">
            Install
          </button>
          <span className="label-cyan">Available at launch</span>
        </div>
      </div>
    </section>
  )
}
