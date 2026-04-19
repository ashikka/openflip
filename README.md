# OpenFlip

**The AI hacker in your pocket.**

Talks to every key fob, badge, door, and beacon around you.
Doesn't know one? It fetches the module and learns — live, on demand.

> Point your phone at any wireless device. OpenFlip identifies it, selects the right exploit module, compiles it, and uploads it to your Flipper Zero over Bluetooth — all in seconds, no manual setup.

[openflip.io](https://openflip.io)

---

## How It Works

```
 ┌─────────────┐        ┌───────────────┐        ┌──────────────┐
 │   Phone      │  BLE   │  Flipper Zero  │  RF    │   Target     │
 │              │◄──────►│                │◄──────►│   Device     │
 │  Camera      │        │  Sub-GHz       │        │              │
 │  AI Agent    │        │  NFC / RFID    │        │  Key Fob     │
 │  Scanner     │        │  BLE           │        │  Smart Lock  │
 │  Module Mgr  │        │  IR / BadUSB   │        │  IoT Device  │
 └──────┬───────┘        └───────────────┘        └──────────────┘
        │
        │  WSS
        ▼
 ┌──────────────┐
 │  Cloud        │
 │  AI Agent     │
 │  Vision API   │
 │  Module Build │
 │  Device KB    │
 └──────────────┘
```

1. **Scan** — Open camera, point at a device
2. **Identify** — AI vision identifies the hardware, protocol, and firmware
3. **Compile** — The right exploit module is selected and compiled for Flipper
4. **Upload** — Module is pushed to Flipper Zero over BLE serial
5. **Execute** — Flipper runs the attack autonomously

---

## Demo Apps

Interactive visualizations for live demos. See the full flow from phone scan to Flipper attack.

### Phone Scanner (`static_app/phone/`)

Mobile-first web app deployed on Cloudflare Workers. Opens the rear camera, runs a futuristic scanning HUD, identifies the target device, and shows a live upload to Flipper Zero.

**Live:** [openflip-scanner.rishit-bansal0.workers.dev](https://openflip-scanner.rishit-bansal0.workers.dev)

```bash
cd static_app/phone
npm install
npm run dev       # local dev
npm run deploy    # push to Cloudflare
```

### Flipper Receiver (`static_app/flipper/`)

Native Flipper Zero FAP (Flipper Application Package). Shows the receiving side: connecting to phone, downloading module with progress bar, installing, executing attack with signal wave animation, then chains directly into the BLE Spam app on Unleashed firmware.

```bash
cd static_app/flipper
ufbt build        # compile the FAP
ufbt launch       # build + upload + run on Flipper via USB
```

Requires [ufbt](https://pypi.org/project/ufbt/) (`pipx install ufbt`).
Compatible with [Unleashed firmware](https://github.com/DarkFlippers/unleashed-firmware) for BLE Spam chain-launch.

---

## Project Structure

```
openflip/
├── frontend/               # Landing page (openflip.io)
├── static_app/
│   ├── phone/              # Cloudflare Workers scanner demo
│   │   ├── public/
│   │   │   └── index.html  # Single-file mobile web app
│   │   ├── wrangler.toml   # Cloudflare config
│   │   └── package.json
│   └── flipper/            # Flipper Zero FAP
│       ├── openflip_recv.c # App source (C)
│       └── application.fam # FAP manifest
├── packages/
│   ├── shared/             # Shared types & device protocol KB
│   ├── flipper-rpc/        # Flipper Zero protobuf RPC over BLE
│   └── server/             # AI agent, vision, module compiler
├── apps/
│   └── mobile/             # React Native phone app (Expo)
└── proto/                  # Flipper protobuf definitions
```

---

## Core Packages

| Package | Description |
|---|---|
| `@openflip/shared` | Shared types, constants, device protocol knowledge base |
| `@openflip/flipper-rpc` | TypeScript Flipper Zero protobuf RPC library over BLE |
| `@openflip/server` | Backend: AI agent, device identification, module compilation |
| `@openflip/mobile` | React Native phone app with BLE, camera, and chat UI |

---

## Key Capabilities

- **Device Identification** — Point camera at any device, AI identifies make/model/firmware/protocol
- **Automatic Module Selection** — Matches device fingerprint against exploit database
- **Live Compilation** — Builds Flipper FAP modules on the fly with uFBT
- **BLE Upload** — Pushes compiled modules to Flipper over Bluetooth LE serial
- **Full Flipper RPC** — Sub-GHz, NFC, RFID, IR, BadUSB, GPIO, storage, app management
- **Attack Chaining** — Demo flows directly into real Flipper apps (BLE Spam, etc.)

---

## Flipper RPC Protocol

The `@openflip/flipper-rpc` package implements the Flipper Zero protobuf RPC protocol:

- Varint length-delimited framing
- `PB.Main` envelope with command_id, command_status, has_next
- BLE serial transport with flow control
- Multi-part response handling for large data transfers
- Request/response correlation via monotonic command IDs

---

## Quick Start

```bash
# Install dependencies
npm install

# Build all packages
npx turbo build

# Run the phone scanner demo locally
cd static_app/phone && npm run dev

# Build the Flipper app
cd static_app/flipper && ufbt build
```

---

## License

MIT
