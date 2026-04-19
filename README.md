# OpenFlip

AI-agent-controlled Flipper Zero. Connect your Flipper over Bluetooth, point your camera at any device, and let the agent figure out what to do.

## Architecture

```
Cloud Backend (Node.js)          Phone App (React Native)         Flipper Zero
┌───────────────────┐            ┌───────────────────┐           ┌──────────────┐
│  AI Agent (GPT)   │◄──WSS───► │  Chat UI          │           │  Sub-GHz     │
│  Vision API       │            │  Camera           │◄───BLE──►│  NFC / RFID  │
│  Module Builder   │            │  BLE Manager      │           │  IR / BadUSB │
│  Device KB        │            │  Flipper RPC      │           │  GPIO        │
└───────────────────┘            └───────────────────┘           └──────────────┘
```

## Packages

| Package | Description |
|---|---|
| `@openflip/shared` | Shared types, constants, device protocol knowledge base |
| `@openflip/flipper-rpc` | TypeScript Flipper Zero protobuf RPC library over BLE |
| `@openflip/server` | Backend: AI agent, device identification, module compilation |
| `@openflip/mobile` | React Native phone app with BLE, camera, and chat UI |

## Quick Start

```bash
# Install dependencies
npm install

# Build all packages
npx turbo build

# Start the backend server
cp packages/server/.env.example packages/server/.env
# Edit .env with your OpenAI API key
cd packages/server && npm run dev

# Start the mobile app (requires Expo dev client)
cd apps/mobile && npm run dev
```

## Key Features

- **BLE Connection**: Scans for and connects to Flipper Zero over Bluetooth LE with flow control
- **AI Agent**: GPT-powered agent with 27 tool definitions covering all Flipper capabilities
- **Device Identification**: Point camera at any device — AI identifies it and suggests Flipper actions
- **Full RPC Control**: Sub-GHz, NFC, RFID, IR, BadUSB, GPIO, storage, app management
- **Module System**: Search existing modules, or AI-generate and compile custom ones with uFBT
- **Real-time Chat**: Tool execution cards, inline results, screen mirroring

## Flipper RPC Protocol

The `@openflip/flipper-rpc` package implements the Flipper Zero protobuf RPC protocol:

- Varint length-delimited framing
- `PB.Main` envelope with command_id, command_status, has_next
- BLE serial transport with flow control (critical for reliable communication)
- Multi-part response handling for large data transfers
- Request/response correlation via monotonic command IDs

## License

MIT
