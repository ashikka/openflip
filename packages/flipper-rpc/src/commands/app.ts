/**
 * Application commands: start, stop, load file, button press, data exchange.
 *
 * The Flipper's app subsystem is the primary way to interact with
 * protocol-specific features (Sub-GHz, NFC, RFID, IR, BadUSB).
 *
 * Flow for most protocol operations:
 * 1. Start the app with optional "RPC" arg for RPC-mode apps
 * 2. Load a signal/data file into the running app
 * 3. Use button press/release to trigger actions (transmit, emulate, etc.)
 * 4. Exit the app when done
 */

import type { RpcClient } from "./rpc-client.js";

/**
 * Start a Flipper application.
 *
 * @param name - App name (e.g., "Sub-GHz", "NFC", "125 kHz RFID", "Bad USB", "Infrared")
 *               or path to a .fap file (e.g., "/ext/apps/NFC/picopass.fap")
 * @param args - Optional launch arguments. Use "RPC" for Sub-GHz RPC mode.
 */
export async function appStart(
  rpc: RpcClient,
  name: string,
  args?: string,
): Promise<void> {
  await rpc.sendSingle(
    {
      type: "appStartRequest",
      data: { name, args },
    },
    { timeout: 10_000 },
  );
}

/**
 * Check if the system is locked (another app is running).
 */
export async function appLockStatus(
  rpc: RpcClient,
): Promise<{ locked: boolean }> {
  const response = await rpc.sendSingle({ type: "appLockStatusRequest" });
  if (response.content?.type === "appLockStatusResponse") {
    return { locked: response.content.data.locked };
  }
  return { locked: false };
}

/**
 * Exit the currently running app.
 */
export async function appExit(rpc: RpcClient): Promise<void> {
  await rpc.sendSingle({ type: "appExitRequest" });
}

/**
 * Load a file into the currently running app.
 * Used to select a signal file in Sub-GHz, NFC dump, IR signal, etc.
 */
export async function appLoadFile(
  rpc: RpcClient,
  path: string,
): Promise<void> {
  await rpc.sendSingle({
    type: "appLoadFileRequest",
    data: { path },
  });
}

/**
 * Send a button press to the running app.
 * Simulates pressing a button on the Flipper's interface.
 */
export async function appButtonPress(
  rpc: RpcClient,
  args?: string,
): Promise<void> {
  await rpc.sendSingle({
    type: "appButtonPressRequest",
    data: { args },
  });
}

/**
 * Release a button press in the running app.
 */
export async function appButtonRelease(rpc: RpcClient): Promise<void> {
  await rpc.sendSingle({ type: "appButtonReleaseRequest" });
}

/**
 * Combined button press + release in a single RPC call.
 */
export async function appButtonPressRelease(
  rpc: RpcClient,
  args?: string,
): Promise<void> {
  await rpc.sendSingle({
    type: "appButtonPressReleaseRequest",
    data: { args },
  });
}

/**
 * Get the last error from the running app.
 */
export async function appGetError(
  rpc: RpcClient,
): Promise<{ code: number; text: string }> {
  const response = await rpc.sendSingle({ type: "appGetErrorRequest" });
  if (response.content?.type === "appGetErrorResponse") {
    return response.content.data;
  }
  return { code: 0, text: "" };
}

/**
 * Exchange data with the running app.
 * Used for bidirectional communication with RPC-mode apps.
 */
export async function appDataExchange(
  rpc: RpcClient,
  data: Uint8Array,
): Promise<void> {
  await rpc.sendSingle({
    type: "appDataExchangeRequest",
    data: { data },
  });
}

// ──────────────────────────────────────────────
// High-level protocol helpers
// ──────────────────────────────────────────────

/**
 * Transmit a Sub-GHz signal file.
 *
 * Flow:
 * 1. Start Sub-GHz app in RPC mode
 * 2. Load the .sub file
 * 3. Press button to start transmitting
 * 4. Wait for specified duration
 * 5. Release button to stop
 * 6. Exit app
 */
export async function subghzTransmit(
  rpc: RpcClient,
  filePath: string,
  durationMs = 1000,
): Promise<void> {
  await appStart(rpc, "Sub-GHz", "RPC");
  await sleep(500); // Wait for app to initialize

  await appLoadFile(rpc, filePath);
  await sleep(200);

  await appButtonPress(rpc);
  await sleep(durationMs);
  await appButtonRelease(rpc);

  await sleep(200);
  await appExit(rpc);
}

/**
 * Start NFC reading.
 * Returns after starting — the actual read result comes from the Flipper's storage
 * after the NFC app saves it.
 */
export async function nfcStartRead(rpc: RpcClient): Promise<void> {
  await appStart(rpc, "NFC", "RPC");
}

/**
 * Emulate an NFC dump file.
 */
export async function nfcEmulate(
  rpc: RpcClient,
  filePath: string,
): Promise<void> {
  await appStart(rpc, "NFC", "RPC");
  await sleep(500);
  await appLoadFile(rpc, filePath);
}

/**
 * Start RFID reading.
 */
export async function rfidStartRead(rpc: RpcClient): Promise<void> {
  await appStart(rpc, "125 kHz RFID", "RPC");
}

/**
 * Emulate an RFID card from file.
 */
export async function rfidEmulate(
  rpc: RpcClient,
  filePath: string,
): Promise<void> {
  await appStart(rpc, "125 kHz RFID", "RPC");
  await sleep(500);
  await appLoadFile(rpc, filePath);
}

/**
 * Transmit an infrared signal from file.
 */
export async function irTransmit(
  rpc: RpcClient,
  filePath: string,
): Promise<void> {
  await appStart(rpc, "Infrared", "RPC");
  await sleep(500);
  await appLoadFile(rpc, filePath);
  await appButtonPress(rpc);
  await sleep(500);
  await appButtonRelease(rpc);
  await appExit(rpc);
}

/**
 * Execute a BadUSB script.
 * Requires the script file to already exist on the Flipper's SD card.
 */
export async function badUsbExecute(
  rpc: RpcClient,
  scriptPath: string,
): Promise<void> {
  await appStart(rpc, "Bad USB", "RPC");
  await sleep(500);
  await appLoadFile(rpc, scriptPath);
  await appButtonPress(rpc);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
