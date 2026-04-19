import { usePostHog } from '@posthog/react'

type RegistryModule = {
  id: string
  name: string
  author: string
  installs: number
  hardware: string
  justAdded?: boolean
}

const MODULES: RegistryModule[] = [
  { id: 'hid-prox-clone', name: 'hid-prox-clone', author: '@mfoc-team', installs: 2481, hardware: 'Sub-GHz' },
  { id: 'tesla-keyfob-v2', name: 'tesla-keyfob-v2', author: '@car-hackers', installs: 1438, hardware: 'BLE' },
  { id: 'hyundai-rolling-2024', name: 'hyundai-rolling-2024', author: '@rf-collective', installs: 1117, hardware: 'Sub-GHz', justAdded: true },
  { id: 'mifare-hardnested', name: 'mifare-hardnested', author: '@nfc-lab', installs: 4102, hardware: 'NFC' },
  { id: 'ble-airtag-spoof', name: 'ble-airtag-spoof', author: '@ghostlayer', installs: 1733, hardware: 'BLE', justAdded: true },
  { id: 'garage-fixed-code', name: 'garage-fixed-code', author: '@subghz-gang', installs: 2987, hardware: 'Sub-GHz' },
  { id: 'tpms-sniff', name: 'tpms-sniff', author: '@tire-whisper', installs: 964, hardware: 'Sub-GHz' },
  { id: 'hotel-onity-v3', name: 'hotel-onity-v3', author: '@travel-redteam', installs: 1956, hardware: 'NFC', justAdded: true },
  { id: 'zigbee-smartlock', name: 'zigbee-smartlock', author: '@home-invader', installs: 1289, hardware: 'Zigbee' },
  { id: 'honda-rolling-bypass', name: 'honda-rolling-bypass', author: '@car-hackers', installs: 1384, hardware: 'Sub-GHz' },
  { id: 'schindler-elevator', name: 'schindler-elevator', author: '@vertical-research', installs: 807, hardware: 'LF RFID' },
  { id: 'starlink-dishy-debug', name: 'starlink-dishy-debug', author: '@orbital-ops', installs: 619, hardware: 'BLE' },
]

export default function ModuleRegistry() {
  const posthog = usePostHog()

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <span className="label-cyan">Open registry</span>
          <h2 className="mt-1 font-display text-[2.2rem] uppercase leading-none sm:text-[2.8rem]">
            Growing nightly.
          </h2>
        </div>
        <span className="label-sm hidden sm:block">{MODULES.length}+ modules · signed</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((module) => (
          <button
            type="button"
            key={module.id}
            onClick={() =>
              posthog?.capture('registry_module_opened', { module: module.id, author: module.author })
            }
            className="group flex items-center justify-between gap-3 border-2 border-amber/50 bg-ink px-3 py-2.5 text-left transition-colors hover:border-amber hover:bg-amber/10"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-display text-[1.35rem] uppercase leading-none">
                  {module.name}
                </span>
                {module.justAdded ? (
                  <span className="shrink-0 border border-cyan/70 px-1 font-display text-[0.75rem] uppercase tracking-[0.14em] text-cyan">
                    New
                  </span>
                ) : null}
              </div>
              <div className="mt-1 truncate text-[0.7rem] uppercase tracking-[0.14em] text-amber/60">
                {module.author} · {module.installs.toLocaleString()} installs
              </div>
            </div>
            <span className="shrink-0 font-display text-[0.85rem] uppercase tracking-[0.14em] text-cyan">
              {module.hardware}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
