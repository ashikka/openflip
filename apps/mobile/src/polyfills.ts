/**
 * Polyfills required for React Native environment.
 * Buffer is needed by react-native-ble-plx for base64 encoding/decoding.
 */

import { Buffer } from "buffer";

// Make Buffer available globally (some libraries expect it)
if (typeof globalThis.Buffer === "undefined") {
  (globalThis as Record<string, unknown>).Buffer = Buffer;
}
