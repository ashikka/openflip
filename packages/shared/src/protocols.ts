/**
 * Device protocol mapping — maps known device categories to
 * Flipper Zero capabilities and interaction strategies.
 *
 * This is the static JSON knowledge base. The AI agent uses this
 * as grounding context when identifying devices and planning actions.
 */

export type FlipperCapability =
  | "subghz"
  | "nfc"
  | "rfid"
  | "infrared"
  | "badusb"
  | "ibutton"
  | "gpio"
  | "bluetooth";

export interface DeviceProtocolEntry {
  /** Category of device */
  category: string;
  /** Common keywords / device names for matching */
  keywords: string[];
  /** Which Flipper capabilities apply */
  capabilities: FlipperCapability[];
  /** Protocol details */
  details: {
    frequency?: string;
    modulation?: string;
    encoding?: string;
    standard?: string;
  };
  /** Notes for the AI agent */
  notes: string;
}

/**
 * Static knowledge base of device-to-protocol mappings.
 * Used by the agent to determine how to interact with identified devices.
 */
export const DEVICE_PROTOCOL_DB: DeviceProtocolEntry[] = [
  // ── Sub-GHz Devices ──────────────────────────
  {
    category: "Garage Door Opener",
    keywords: ["garage", "chamberlain", "liftmaster", "genie", "linear", "craftsman"],
    capabilities: ["subghz"],
    details: {
      frequency: "300-390 MHz (US), 433 MHz (EU)",
      modulation: "AM/OOK or rolling code",
    },
    notes:
      "Modern openers (Security+ 2.0, Intellicode) use rolling codes — capture only, no replay. Older fixed-code remotes can be captured and replayed. Always check local laws.",
  },
  {
    category: "Car Key Fob",
    keywords: ["key fob", "car remote", "vehicle", "toyota", "honda", "ford", "bmw"],
    capabilities: ["subghz"],
    details: {
      frequency: "315 MHz (US/Japan), 433.92 MHz (EU)",
      modulation: "ASK/OOK, rolling code",
    },
    notes:
      "Nearly all modern car fobs use rolling codes (KeeLoq, Hitag). Capture for analysis only. Replay attacks generally do not work on vehicles after ~2005.",
  },
  {
    category: "Wireless Doorbell",
    keywords: ["doorbell", "ring", "wireless bell", "chime"],
    capabilities: ["subghz"],
    details: {
      frequency: "433.92 MHz",
      modulation: "ASK/OOK, fixed code",
    },
    notes:
      "Most wireless doorbells use simple fixed codes on 433 MHz. Can be captured and replayed. Good for demonstration purposes.",
  },
  {
    category: "Weather Station / Sensor",
    keywords: ["weather station", "temperature sensor", "humidity", "acurite", "oregon scientific"],
    capabilities: ["subghz"],
    details: {
      frequency: "433.92 MHz or 915 MHz",
      modulation: "ASK/OOK",
    },
    notes: "Read-only. Can capture and decode sensor data. Various protocols supported by Flipper firmware.",
  },
  {
    category: "RF Remote Control",
    keywords: ["rf remote", "wireless remote", "433 remote", "light remote", "fan remote"],
    capabilities: ["subghz"],
    details: {
      frequency: "433.92 MHz or 315 MHz",
      modulation: "ASK/OOK, fixed code",
    },
    notes: "Simple fixed-code remotes for lights, fans, power outlets. Can capture and replay.",
  },

  // ── NFC Devices ──────────────────────────────
  {
    category: "NFC Access Card",
    keywords: [
      "nfc card", "mifare", "mifare classic", "mifare ultralight",
      "ntag", "desfire", "access card", "hotel key", "gym card",
    ],
    capabilities: ["nfc"],
    details: {
      frequency: "13.56 MHz",
      standard: "ISO 14443-A/B",
    },
    notes:
      "Mifare Classic: can read, save, emulate (with known keys). Mifare Ultralight/NTAG: read and emulate. DESFire: partial read only. Picopass/iClass supported via plugin.",
  },
  {
    category: "NFC Payment Card",
    keywords: ["credit card", "debit card", "contactless payment", "visa", "mastercard"],
    capabilities: ["nfc"],
    details: {
      frequency: "13.56 MHz",
      standard: "ISO 14443-A, EMV",
    },
    notes:
      "Can read public data (card number partial, expiry). Cannot clone or emulate payment cards due to cryptographic authentication. Read-only analysis.",
  },
  {
    category: "NFC Tag / Sticker",
    keywords: ["nfc tag", "nfc sticker", "ntag215", "ntag216", "amiibo"],
    capabilities: ["nfc"],
    details: {
      frequency: "13.56 MHz",
      standard: "NFC Forum Type 2",
    },
    notes:
      "Can read, write (if not locked), and emulate. NTAG215 is used for Amiibo — can emulate saved dumps. NTAG216 for larger payloads.",
  },

  // ── RFID Devices ──────────────────────────────
  {
    category: "RFID Access Card (125 kHz)",
    keywords: [
      "rfid card", "em4100", "hid prox", "hid proxcard", "indala",
      "access badge", "building badge", "parking card", "t5577",
    ],
    capabilities: ["rfid"],
    details: {
      frequency: "125 kHz",
      encoding: "ASK, Manchester, PSK",
    },
    notes:
      "EM4100: read, write (to T5577), emulate. HID ProxCard (26-bit H10301): read and emulate. Indala: read and emulate. T5577 is a writable card that can emulate most 125 kHz protocols.",
  },

  // ── Infrared Devices ─────────────────────────
  {
    category: "TV / Media Remote",
    keywords: [
      "tv", "television", "remote control", "samsung tv", "lg tv",
      "sony tv", "roku", "fire tv", "apple tv", "projector",
    ],
    capabilities: ["infrared"],
    details: {
      standard: "NEC, RC5, RC6, Samsung, SIRC, Kaseikyo",
    },
    notes:
      "Flipper has a universal IR remote database. Can learn custom signals. Supports all major IR protocols. Useful for TV-B-Gone style demos.",
  },
  {
    category: "Air Conditioner",
    keywords: ["ac", "air conditioner", "hvac", "climate control", "daikin", "mitsubishi"],
    capabilities: ["infrared"],
    details: {
      standard: "Proprietary (manufacturer-specific)",
    },
    notes:
      "AC remotes use complex IR protocols with state encoding (temperature, mode, fan speed). Can learn and replay, but modifying parameters requires protocol-specific modules.",
  },

  // ── iButton Devices ──────────────────────────
  {
    category: "iButton Key",
    keywords: ["ibutton", "dallas key", "cyfral", "metakom", "door key", "intercom"],
    capabilities: ["ibutton"],
    details: {
      standard: "Dallas DS1990A, Cyfral, Metakom",
    },
    notes:
      "Contact-based 1-Wire keys. Dallas: read, write (to RW1990), emulate. Cyfral/Metakom: read and emulate only.",
  },

  // ── USB/HID Devices ──────────────────────────
  {
    category: "Computer / USB Device",
    keywords: ["computer", "laptop", "pc", "usb", "keyboard", "workstation"],
    capabilities: ["badusb"],
    details: {
      standard: "USB HID",
    },
    notes:
      "BadUSB emulates a keyboard and types pre-scripted payloads. Requires physical USB connection. Supports DuckyScript-compatible syntax. Use responsibly — authorized testing only.",
  },

  // ── GPIO / Hardware ──────────────────────────
  {
    category: "Microcontroller / Dev Board",
    keywords: [
      "arduino", "esp32", "raspberry pi", "stm32", "dev board",
      "breadboard", "sensor", "servo", "led", "motor",
    ],
    capabilities: ["gpio"],
    details: {
      standard: "SPI, I2C, UART, GPIO",
    },
    notes:
      "Flipper GPIO provides 13 I/O pins (3.3V logic, 5V tolerant). Can interface with external hardware via SPI, I2C, UART. 5V output available via OTG.",
  },
];

/**
 * Look up protocols for a device category or keyword.
 */
export function findProtocols(query: string): DeviceProtocolEntry[] {
  const lower = query.toLowerCase();
  return DEVICE_PROTOCOL_DB.filter(
    (entry) =>
      entry.category.toLowerCase().includes(lower) ||
      entry.keywords.some((kw) => kw.includes(lower) || lower.includes(kw))
  );
}
