/**
 * Device identification using GPT-5.4 Vision.
 *
 * Takes a photo of a hardware device and identifies:
 * - Device name and manufacturer
 * - Communication protocols it uses
 * - Which Flipper Zero capabilities apply
 * - Suggested actions
 */

import OpenAI from "openai";
import { findProtocols, type DeviceProtocolEntry } from "@openflip/shared";
import type { DeviceIdentification } from "@openflip/shared";

/** Lazy-initialized OpenAI client — created on first use, after dotenv has loaded */
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

export async function identifyDevice(
  imageBase64: string,
): Promise<DeviceIdentification> {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4.1",
    messages: [
      {
        role: "system",
        content: `You are an expert at identifying hardware devices and their communication protocols.
When shown an image of a device, respond with a JSON object containing:
- "deviceName": string (specific product name if identifiable, otherwise general category)
- "manufacturer": string (if identifiable, otherwise "Unknown")
- "protocols": string[] (communication protocols: "subghz", "nfc", "rfid", "infrared", "badusb", "ibutton", "gpio", "bluetooth", "wifi")
- "frequency": string (if applicable, e.g., "433.92 MHz", "13.56 MHz", "125 kHz")
- "suggestedActions": string[] (what a Flipper Zero could do with this device)
- "confidence": number (0-1, how confident you are in the identification)
- "notes": string (any important caveats, e.g., "uses rolling codes")

Respond ONLY with valid JSON, no markdown.`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
              detail: "high",
            },
          },
          {
            type: "text",
            text: "Identify this device and its communication protocols. What can a Flipper Zero do with it?",
          },
        ],
      },
    ],
    max_tokens: 1024,
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from vision model");
  }

  const parsed = JSON.parse(content) as {
    deviceName: string;
    manufacturer: string;
    protocols: string[];
    frequency?: string;
    suggestedActions: string[];
    confidence: number;
    notes?: string;
  };

  // Cross-reference with our protocol database for additional context
  const dbMatches = findProtocols(parsed.deviceName);

  // Merge suggested actions from DB
  const allActions = new Set(parsed.suggestedActions);
  for (const match of dbMatches) {
    // Add any relevant notes from our DB
    if (match.notes) {
      allActions.add(match.notes);
    }
  }

  return {
    imageBase64: "", // Don't echo the image back
    deviceName: parsed.deviceName,
    manufacturer: parsed.manufacturer,
    protocols: parsed.protocols,
    suggestedActions: Array.from(allActions),
    confidence: parsed.confidence,
  };
}
