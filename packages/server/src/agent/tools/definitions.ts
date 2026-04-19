/**
 * Tool definitions for the OpenFlip AI agent.
 *
 * These are the OpenAI function calling tool schemas that describe
 * every action the agent can perform via the Flipper Zero.
 * The phone app executes these tools over BLE.
 */

import type { ChatCompletionTool } from "openai/resources/chat/completions";

export const FLIPPER_TOOLS: ChatCompletionTool[] = [
  // ── System ──────────────────────────────────
  {
    type: "function",
    function: {
      name: "flipper_ping",
      description: "Ping the Flipper Zero to check connectivity. Returns round-trip time.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "flipper_system_info",
      description:
        "Get device information: name, hardware model/revision, firmware version, protobuf version.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "flipper_reboot",
      description: "Reboot the Flipper Zero. Use 'os' for normal reboot, 'dfu' for DFU mode, 'update' for update mode.",
      parameters: {
        type: "object",
        properties: {
          mode: {
            type: "string",
            enum: ["os", "dfu", "update"],
            description: "Reboot mode",
          },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "flipper_power_info",
      description: "Get battery and power information from the Flipper.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },

  // ── Storage ─────────────────────────────────
  {
    type: "function",
    function: {
      name: "flipper_storage_list",
      description:
        "List files and directories at a path on the Flipper's storage. Use '/ext' for SD card root, '/int' for internal.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Directory path (e.g., '/ext', '/ext/subghz', '/ext/apps')",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "flipper_storage_read",
      description: "Read a file from the Flipper's storage. Returns the file contents as text.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Full file path (e.g., '/ext/subghz/signal.sub')",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "flipper_storage_write",
      description:
        "Write text content to a file on the Flipper's storage. Creates the file if it doesn't exist, overwrites if it does.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Full file path",
          },
          content: {
            type: "string",
            description: "Text content to write",
          },
        },
        required: ["path", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "flipper_storage_delete",
      description: "Delete a file or directory from the Flipper's storage.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Path to delete" },
          recursive: {
            type: "boolean",
            description: "If true, delete directory contents recursively",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "flipper_storage_info",
      description: "Get storage space information (total/free) for a storage path.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Storage path ('/ext' or '/int')",
          },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "flipper_storage_mkdir",
      description: "Create a directory on the Flipper's storage.",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Directory path to create" },
        },
        required: ["path"],
      },
    },
  },

  // ── Sub-GHz ─────────────────────────────────
  {
    type: "function",
    function: {
      name: "subghz_transmit",
      description:
        "Transmit a Sub-GHz signal from a .sub file on the Flipper's SD card. Opens Sub-GHz app in RPC mode, loads the file, transmits for the specified duration, then exits.",
      parameters: {
        type: "object",
        properties: {
          file_path: {
            type: "string",
            description: "Path to .sub file on Flipper (e.g., '/ext/subghz/signal.sub')",
          },
          duration_ms: {
            type: "number",
            description: "How long to transmit in milliseconds (default: 1000)",
          },
        },
        required: ["file_path"],
      },
    },
  },

  // ── NFC ─────────────────────────────────────
  {
    type: "function",
    function: {
      name: "nfc_read",
      description:
        "Start the NFC app in read mode. Hold the Flipper near an NFC tag to read it. The read data will be saved to the Flipper's storage.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "nfc_emulate",
      description:
        "Emulate an NFC tag from a saved dump file. The Flipper will act as the NFC tag until stopped.",
      parameters: {
        type: "object",
        properties: {
          file_path: {
            type: "string",
            description: "Path to NFC dump file (e.g., '/ext/nfc/card.nfc')",
          },
        },
        required: ["file_path"],
      },
    },
  },

  // ── RFID ────────────────────────────────────
  {
    type: "function",
    function: {
      name: "rfid_read",
      description:
        "Start the 125 kHz RFID app in read mode. Hold the Flipper near an RFID card to read it.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "rfid_emulate",
      description:
        "Emulate a 125 kHz RFID card from a saved file. The Flipper will act as the RFID card until stopped.",
      parameters: {
        type: "object",
        properties: {
          file_path: {
            type: "string",
            description: "Path to RFID file (e.g., '/ext/lfrfid/card.rfid')",
          },
        },
        required: ["file_path"],
      },
    },
  },

  // ── Infrared ────────────────────────────────
  {
    type: "function",
    function: {
      name: "ir_transmit",
      description:
        "Transmit an infrared signal from a saved file. Can be used for TV, AC, and other IR-controlled devices.",
      parameters: {
        type: "object",
        properties: {
          file_path: {
            type: "string",
            description: "Path to IR file (e.g., '/ext/infrared/tv_power.ir')",
          },
        },
        required: ["file_path"],
      },
    },
  },

  // ── BadUSB ──────────────────────────────────
  {
    type: "function",
    function: {
      name: "badusb_execute",
      description:
        "Execute a BadUSB (HID keyboard attack) script. The script must already exist on the Flipper's SD card. REQUIRES explicit user confirmation before execution.",
      parameters: {
        type: "object",
        properties: {
          script_path: {
            type: "string",
            description: "Path to BadUSB script (e.g., '/ext/badusb/script.txt')",
          },
          confirm: {
            type: "boolean",
            description: "Must be true to confirm execution. BadUSB is a potentially dangerous tool.",
          },
        },
        required: ["script_path", "confirm"],
      },
    },
  },

  // ── GPIO ────────────────────────────────────
  {
    type: "function",
    function: {
      name: "gpio_set_mode",
      description: "Configure a GPIO pin's mode (input, output push-pull, output open-drain, analog).",
      parameters: {
        type: "object",
        properties: {
          pin: {
            type: "string",
            enum: ["PC0", "PC1", "PC3", "PB2", "PB3", "PA4", "PA6", "PA7"],
            description: "GPIO pin name",
          },
          mode: {
            type: "string",
            enum: ["output_push_pull", "output_open_drain", "input", "analog"],
            description: "Pin mode",
          },
        },
        required: ["pin", "mode"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "gpio_write",
      description: "Set a GPIO pin to HIGH (1) or LOW (0). Pin must be in output mode.",
      parameters: {
        type: "object",
        properties: {
          pin: {
            type: "string",
            enum: ["PC0", "PC1", "PC3", "PB2", "PB3", "PA4", "PA6", "PA7"],
          },
          value: { type: "number", enum: [0, 1] },
        },
        required: ["pin", "value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "gpio_read",
      description: "Read the current value of a GPIO pin.",
      parameters: {
        type: "object",
        properties: {
          pin: {
            type: "string",
            enum: ["PC0", "PC1", "PC3", "PB2", "PB3", "PA4", "PA6", "PA7"],
          },
        },
        required: ["pin"],
      },
    },
  },

  // ── App Management ──────────────────────────
  {
    type: "function",
    function: {
      name: "flipper_app_start",
      description:
        "Launch an application on the Flipper. Can be a built-in app name or path to a .fap file.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "App name or .fap path (e.g., 'Sub-GHz', '/ext/apps/Tools/my_app.fap')",
          },
          args: {
            type: "string",
            description: "Optional arguments (e.g., 'RPC' for RPC mode)",
          },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "flipper_app_stop",
      description: "Stop/exit the currently running application on the Flipper.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },

  // ── GUI ─────────────────────────────────────
  {
    type: "function",
    function: {
      name: "flipper_screenshot",
      description: "Capture a screenshot of the Flipper's current screen (128x64 monochrome display).",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },

  // ── Module Management ───────────────────────
  {
    type: "function",
    function: {
      name: "install_module",
      description:
        "Install a Flipper app module (.fap) by writing it to the Flipper's SD card. The file data should be provided as base64.",
      parameters: {
        type: "object",
        properties: {
          install_path: {
            type: "string",
            description: "Path on Flipper to install to (e.g., '/ext/apps/Tools/my_app.fap')",
          },
          fap_base64: {
            type: "string",
            description: "Base64-encoded .fap file contents",
          },
        },
        required: ["install_path", "fap_base64"],
      },
    },
  },

  // ── Device Identification ───────────────────
  {
    type: "function",
    function: {
      name: "identify_device",
      description:
        "Analyze a photo to identify a hardware device and determine which Flipper capabilities apply. Returns device name, protocols, and suggested actions.",
      parameters: {
        type: "object",
        properties: {
          image_base64: {
            type: "string",
            description: "Base64-encoded image of the device to identify",
          },
        },
        required: ["image_base64"],
      },
    },
  },

  // ── Module Search / Generation ──────────────
  {
    type: "function",
    function: {
      name: "search_modules",
      description:
        "Search the module registry for existing Flipper apps that work with a specific device or protocol.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query (e.g., 'NFC picopass', 'sub-ghz analyzer', 'RFID writer')",
          },
        },
        required: ["query"],
      },
    },
  },
];
