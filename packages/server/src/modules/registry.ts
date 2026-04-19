/**
 * Module Registry
 *
 * A curated catalog of known Flipper Zero FAP modules.
 * The AI agent can search this to find existing modules for a device/protocol
 * before resorting to generating a custom one.
 */

import type { FlipperModule } from "@openflip/shared";

/**
 * Static module registry. In production, this would be backed by a database
 * and pull from the Flipper Apps Catalog API.
 */
const MODULE_REGISTRY: FlipperModule[] = [
  // NFC modules
  {
    id: "picopass",
    name: "Picopass / iClass",
    description:
      "Read, save, and emulate HID iClass SE / Picopass cards. Supports standard keys and custom key dictionaries.",
    category: "NFC",
    version: "1.8",
    author: "Bettse",
    protocols: ["nfc"],
    downloadUrl: "https://lab.flipper.net/apps/picopass",
    generated: false,
  },
  {
    id: "nfc_magic",
    name: "NFC Magic",
    description:
      "Write NFC dumps to magic (Gen1a/Gen2) Mifare Classic cards. Supports direct write and UID change.",
    category: "NFC",
    version: "1.3",
    author: "gornekich",
    protocols: ["nfc"],
    downloadUrl: "https://lab.flipper.net/apps/nfc_magic",
    generated: false,
  },
  {
    id: "seader",
    name: "Seader",
    description:
      "Seos / iClass SE credential reader using SAM. Requires a Seader SAM expansion module.",
    category: "NFC",
    version: "2.1",
    author: "Bettse",
    protocols: ["nfc", "gpio"],
    downloadUrl: "https://lab.flipper.net/apps/seader",
    generated: false,
  },

  // Sub-GHz modules
  {
    id: "subghz_bruteforcer",
    name: "Sub-GHz Bruteforcer",
    description:
      "Brute-force fixed-code Sub-GHz protocols (CAME, NICE, Linear, etc.). For authorized testing only.",
    category: "Sub-GHz",
    version: "3.2",
    author: "DarkFlippers",
    protocols: ["subghz"],
    downloadUrl: "https://lab.flipper.net/apps/subghz_bruteforcer",
    generated: false,
  },
  {
    id: "spectrum_analyzer",
    name: "Spectrum Analyzer",
    description:
      "Visual spectrum analyzer for the CC1101 radio. Shows signal strength across a frequency range in real-time.",
    category: "Sub-GHz",
    version: "1.5",
    author: "jolcese",
    protocols: ["subghz"],
    downloadUrl: "https://lab.flipper.net/apps/spectrum_analyzer",
    generated: false,
  },
  {
    id: "weather_station",
    name: "Weather Station",
    description:
      "Receive and decode weather station sensor data. Supports Oregon Scientific, AcuRite, LaCrosse, and many more.",
    category: "Sub-GHz",
    version: "1.4",
    author: "flipperdevices",
    protocols: ["subghz"],
    downloadUrl: "https://lab.flipper.net/apps/weather_station",
    generated: false,
  },

  // RFID modules
  {
    id: "lfrfid_debug",
    name: "RFID Debug",
    description:
      "Low-level RFID debug tool. View raw modulation, timing data, and bit patterns from 125 kHz cards.",
    category: "RFID",
    version: "1.0",
    author: "flipperdevices",
    protocols: ["rfid"],
    generated: false,
  },

  // Infrared modules
  {
    id: "ir_scope",
    name: "IR Scope",
    description:
      "Infrared signal oscilloscope. Visualize raw IR signals with timing data for protocol analysis.",
    category: "Infrared",
    version: "1.2",
    author: "amec0e",
    protocols: ["infrared"],
    downloadUrl: "https://lab.flipper.net/apps/ir_scope",
    generated: false,
  },
  {
    id: "xremote",
    name: "XRemote",
    description:
      "Advanced universal remote with customizable button layouts. Supports multiple IR devices simultaneously.",
    category: "Infrared",
    version: "2.0",
    author: "kala13x",
    protocols: ["infrared"],
    downloadUrl: "https://lab.flipper.net/apps/xremote",
    generated: false,
  },

  // GPIO modules
  {
    id: "gpio_reader",
    name: "GPIO Reader",
    description: "Read and display real-time values from all GPIO pins.",
    category: "GPIO",
    version: "1.0",
    author: "aureli1c",
    protocols: ["gpio"],
    downloadUrl: "https://lab.flipper.net/apps/gpio_reader",
    generated: false,
  },
  {
    id: "spi_mem_manager",
    name: "SPI Memory Manager",
    description:
      "Read, write, and erase SPI flash memory chips via the Flipper's GPIO SPI interface.",
    category: "GPIO",
    version: "1.1",
    author: "flipperdevices",
    protocols: ["gpio"],
    downloadUrl: "https://lab.flipper.net/apps/spi_mem_manager",
    generated: false,
  },

  // Utility modules
  {
    id: "ble_spam",
    name: "BLE Spam",
    description:
      "Broadcast BLE advertisement packets. Can trigger pairing popups on nearby devices for demonstration purposes.",
    category: "Bluetooth",
    version: "2.5",
    author: "Willy-JL",
    protocols: ["bluetooth"],
    downloadUrl: "https://lab.flipper.net/apps/ble_spam",
    generated: false,
  },
  {
    id: "wifi_marauder",
    name: "WiFi Marauder",
    description:
      "WiFi penetration testing tool (requires ESP32 Marauder companion board on GPIO). Scan, deauth, probe.",
    category: "WiFi",
    version: "6.0",
    author: "0xchocolate",
    protocols: ["gpio"],
    downloadUrl: "https://lab.flipper.net/apps/wifi_marauder",
    generated: false,
  },
];

/**
 * Search the module registry by query string.
 * Matches against name, description, category, and protocols.
 */
export function searchModules(query: string): FlipperModule[] {
  if (!query.trim()) return MODULE_REGISTRY;

  const lower = query.toLowerCase();
  const terms = lower.split(/\s+/);

  return MODULE_REGISTRY.filter((mod) => {
    const searchable = [
      mod.name,
      mod.description,
      mod.category,
      ...mod.protocols,
      mod.author,
    ]
      .join(" ")
      .toLowerCase();

    return terms.every((term) => searchable.includes(term));
  }).sort((a, b) => {
    // Prioritize exact name matches
    const aNameMatch = a.name.toLowerCase().includes(lower) ? 1 : 0;
    const bNameMatch = b.name.toLowerCase().includes(lower) ? 1 : 0;
    return bNameMatch - aNameMatch;
  });
}
