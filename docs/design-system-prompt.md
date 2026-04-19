# OpenFlip Design System Prompt

Build a Cloudflare Pages + D1 waitlist landing page for OpenFlip (`openflip.io`) — a pocket-sized AI red-team agent that lives on a Flipper-like device and dynamically installs exploit modules from an open registry. Think: Flipper Zero with an autonomous AI brain that learns new capabilities from the internet on demand. OpenFlip is the AI-native spiritual successor to the Flipper Zero.

## Tech stack

- Vite + React + TypeScript + Tailwind
- Cloudflare Pages for hosting
- Pages Functions for the API
- D1 for waitlist storage
- No Next.js
- Deployable with `wrangler pages deploy`

## Visual language

A love letter to the Flipper Zero aesthetic, with AI-cybernetic overtones layered on top. Orange dot-matrix LCD on deep black. Chunky pixel UI. Tamagotchi / Game Boy energy underneath, with subtle neural-net / cyberpunk flourishes layered over it. Playful-but-sharp, not menacing.

- Primary orange: `#FF8200`
- Secondary: `#FFA940` highlight, `#663300` dim, `#00E5FF` cyan for AI accents only
- Background: `#0A0A0A`
- Display font: `VT323`
- Body font: `JetBrains Mono`
- Never use sans-serif anywhere
- Add a subtle pixel-grid overlay at 6% opacity across the whole screen
- Every panel should feel like a Flipper menu card: thick 2px orange border, square corners, orange-on-black content
- Hover states invert to black text on solid orange
- Animations should feel frame-based and choppy, roughly 8fps

## Mascot: Bit

OpenFlip's mascot is a cybernetic AI dolphin named Bit. Bit is visually distinct from Flipper's dolphin Lurat and should read as the AI cousin, not a copy.

- Pixel-art style, 32×32 sprite scaled up 4× with `image-rendering: pixelated`
- Orange body outline
- One natural eye, one glowing cyan cybernetic eye with a rotating scanning reticle
- Thin cyan circuit-line tattoos along the dorsal fin and side
- Small antenna/dish on the head
- 4-frame sprite states: `idle`, `scanning`, `installing`, `excited`, `sleeping`
- Bit appears in the hero device screen, section transitions, and the waitlist confirmation state
- Implement Bit as a React component that accepts a `state` prop

## Page sections

1. Hero
   Left side: a pixel-rendered handheld device mockup with an orange LCD screen.
   The screen loops an 18-second hero demo:
   `Bit idle -> 868 MHz signal -> UNKNOWN PROTOCOL -> SEARCHING REGISTRY... -> module card + progress bar -> VERIFYING ✓ -> DECODED -> happy wiggle`

   Right side:
   - Headline: `YOUR WORLD IS LOUDER THAN YOU THINK.`
   - Subtitle: `OpenFlip listens, learns new tricks from the internet, and speaks back. Pocket-sized, community-powered.`
   - Email field styled like a Flipper menu item with `> ENTER EMAIL_`
   - CTA button: `JOIN THE WAITLIST`

2. A day you didn't know you had
   Five pixel-art scenes following Maya through one day:
   - `7:42am` gym locker
   - `9:15am` elevator badge
   - `12:30pm` hotel corridor
   - `4:20pm` parking garage
   - `9:55pm` apartment buzzer

   Each scene should feel like a 16-color illustration with cyan RF waves pulsing out from the target device.

3. Bit learns what it needs to know
   An animated flow diagram styled like a Flipper menu tree:
   `SIGNAL DETECTED -> NO LOCAL HANDLER -> QUERYING REGISTRY... -> MODULE FOUND -> SIGNATURE VERIFIED ✓ -> INSTALLING... -> READY`

4. The Module Registry
   A grid styled like a Flipper app catalog with realistic fake modules:
   - `hid-prox-clone` by `@mfoc-team`
   - `tesla-keyfob-v2` by `@car-hackers`
   - `hyundai-rolling-2024` by `@rf-collective`
   - `mifare-hardnested` by `@nfc-lab`
   - `ble-airtag-spoof` by `@ghostlayer`
   - `garage-fixed-code` by `@subghz-gang`
   - `tpms-sniff` by `@tire-whisper`
   - `schindler-elevator` by `@vertical-research`
   - `starlink-dishy-debug` by `@orbital-ops`
   - `honda-rolling-bypass` by `@car-hackers`
   - `hotel-onity-v3` by `@travel-redteam`
   - `zigbee-smartlock` by `@home-invader`

   Clicking a card should open a detail panel with description, supported hardware, and a disabled `INSTALL` button with tooltip `Available at launch`.

5. Live activity ticker
   A thin strip above the footer, auto-scrolling, using VT323 with orange text and cyan timestamps.

6. Footer
   Second email capture, minimal links, sleeping Bit, and the legal line:
   `OpenFlip is an independent project, not affiliated with Flipper Devices Inc.`

## Functionality

- `functions/api/waitlist.ts` should validate email, hash visitor IP with `env.IP_SALT` using SHA-256, write to D1, and return `{ success: true, position: N }`
- Duplicates should return `409` with `{ error: "Already on the list", duplicate: true }`
- `schema.sql` should define the `waitlist` table and indexes
- `wrangler.toml` should bind D1 as `DB` and include `IP_SALT`
- On successful submit, the hero device screen should transform into a confirmation state:
  - `> WELCOME TO THE POD`
  - `YOU ARE #1,247`
  - `SHARE` button that copies: `I just joined the @openflip waitlist — AI red-teaming in your pocket. openflip.io`
- Capture `utm_source`, `utm_campaign`, and `document.referrer` into the `source` column

## Tone

- Never corporate
- Tight and concrete
- Never use: `revolutionary`, `cutting-edge`, `game-changing`, `democratize`, `disrupt`
- Use these lines directly:
  - `YOUR WORLD IS LOUDER THAN YOU THINK.`
  - `OpenFlip listens, learns new tricks from the internet, and speaks back. Pocket-sized, community-powered.`
  - `Every door, every fob, every badge — emitting.`
  - `Bit doesn't know everything. Bit knows how to learn.`
  - `One registry. Every protocol. Growing nightly.`
  - `WELCOME TO THE POD.`

## Deliverables

```text
openflip-landing/
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── index.html
├── wrangler.toml
├── schema.sql
├── README.md
├── functions/
│   └── api/
│       └── waitlist.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    └── components/
        ├── Hero.tsx
        ├── DeviceMockup.tsx
        ├── HeroDemo.tsx
        ├── Bit.tsx
        ├── MayaDay.tsx
        ├── LearningFlow.tsx
        ├── ModuleRegistry.tsx
        ├── ActivityTicker.tsx
        ├── EmailCapture.tsx
        └── Footer.tsx
```
