/**
 * BLE Transport for Flipper Zero.
 *
 * Implements the Transport interface over Bluetooth Low Energy using
 * the Flipper's serial BLE service. This is designed to be used from
 * the React Native app with react-native-ble-plx.
 *
 * Key implementation details:
 * 1. The Flipper exposes a custom serial service (not standard UART)
 * 2. Flow control is CRITICAL — the Flipper will disconnect if overwhelmed
 * 3. MTU negotiation is important for performance (default 23 vs max 512)
 * 4. Data from the Flipper arrives as BLE notifications on the TX characteristic
 *
 * This class is transport-only. It does NOT know about protobuf or RPC —
 * it just moves bytes back and forth. The RPC client layer sits on top.
 */

import {
  FLIPPER_BLE,
  FLIPPER_MAX_MTU,
  RPC_SESSION_START_CMD,
  FLIPPER_CLI_PROMPT,
} from "@openflip/shared";
import type { Transport, TransportState, TransportEvents } from "./transport.js";

// ──────────────────────────────────────────────
// BLE abstraction interface
// ──────────────────────────────────────────────

/**
 * Minimal BLE interface that the transport depends on.
 * In React Native, this is backed by react-native-ble-plx's BleManager.
 * In tests, it can be mocked.
 */
export interface BleAdapter {
  /** Connect to a device by ID */
  connect(deviceId: string): Promise<void>;
  /** Disconnect from the device */
  disconnect(deviceId: string): Promise<void>;
  /** Discover all services and characteristics */
  discoverServicesAndCharacteristics(deviceId: string): Promise<void>;
  /** Request MTU size */
  requestMtu(deviceId: string, mtu: number): Promise<number>;
  /** Write data to a characteristic (with response) */
  writeCharacteristic(
    deviceId: string,
    serviceUuid: string,
    charUuid: string,
    data: Uint8Array,
    withResponse: boolean,
  ): Promise<void>;
  /** Read data from a characteristic */
  readCharacteristic(
    deviceId: string,
    serviceUuid: string,
    charUuid: string,
  ): Promise<Uint8Array>;
  /** Subscribe to characteristic notifications */
  monitorCharacteristic(
    deviceId: string,
    serviceUuid: string,
    charUuid: string,
    callback: (data: Uint8Array) => void,
  ): { remove: () => void };
  /** Monitor device disconnection */
  onDisconnected(
    deviceId: string,
    callback: (error: Error | null) => void,
  ): { remove: () => void };
}

// ──────────────────────────────────────────────
// BLE Transport Implementation
// ──────────────────────────────────────────────

export class BleTransport implements Transport {
  private _state: TransportState = "disconnected";
  private deviceId: string | null = null;
  private ble: BleAdapter;
  private negotiatedMtu = 23; // BLE default
  private txSubscription: { remove: () => void } | null = null;
  private disconnectSubscription: { remove: () => void } | null = null;

  // Event handlers — using Set<Function> to avoid complex generic variance issues
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  private handlers: Record<string, Set<Function>> = {};

  // Write queue for flow-controlled writes
  private writeQueue: Array<{
    data: Uint8Array;
    resolve: () => void;
    reject: (err: Error) => void;
  }> = [];
  private isWriting = false;

  constructor(bleAdapter: BleAdapter) {
    this.ble = bleAdapter;
  }

  get state(): TransportState {
    return this._state;
  }

  on<K extends keyof TransportEvents>(event: K, handler: TransportEvents[K]): void {
    if (!this.handlers[event]) {
      this.handlers[event] = new Set();
    }
    this.handlers[event].add(handler);
  }

  off<K extends keyof TransportEvents>(event: K, handler: TransportEvents[K]): void {
    this.handlers[event]?.delete(handler);
  }

  private emit<K extends keyof TransportEvents>(
    event: K,
    ...args: Parameters<TransportEvents[K]>
  ): void {
    const handlerSet = this.handlers[event];
    if (handlerSet) {
      for (const handler of handlerSet) {
        (handler as (...a: Parameters<TransportEvents[K]>) => void)(...args);
      }
    }
  }

  private setState(state: TransportState): void {
    this._state = state;
    this.emit("onStateChange", state);
  }

  // ──────────────────────────────────────────────
  // Connection lifecycle
  // ──────────────────────────────────────────────

  async connect(deviceId: string): Promise<void> {
    if (this._state !== "disconnected") {
      throw new Error(`Cannot connect: transport is ${this._state}`);
    }

    this.deviceId = deviceId;
    this.setState("connecting");

    try {
      // 1. Connect to the BLE device
      await this.ble.connect(deviceId);

      // 2. Discover services and characteristics
      await this.ble.discoverServicesAndCharacteristics(deviceId);

      // 3. Negotiate MTU (request max, Flipper supports up to 414)
      this.negotiatedMtu = await this.ble.requestMtu(deviceId, FLIPPER_MAX_MTU);

      // 4. Subscribe to TX characteristic for incoming data
      this.txSubscription = this.ble.monitorCharacteristic(
        deviceId,
        FLIPPER_BLE.SERIAL_SERVICE_UUID,
        FLIPPER_BLE.TX_CHARACTERISTIC_UUID,
        (data) => this.emit("onData", data),
      );

      // 5. Monitor for unexpected disconnects
      this.disconnectSubscription = this.ble.onDisconnected(deviceId, (error) => {
        this.cleanup();
        this.setState("disconnected");
        this.emit("onDisconnect", error?.message ?? "Unknown disconnect");
      });

      this.setState("connected");
    } catch (error) {
      this.cleanup();
      this.setState("disconnected");
      throw error;
    }
  }

  async startRpcSession(): Promise<void> {
    if (this._state !== "connected" || !this.deviceId) {
      throw new Error("Must be connected before starting RPC session");
    }

    // Give the Flipper a moment after BLE connection
    await sleep(200);

    // Drain any existing CLI prompt data by reading what's available
    // The Flipper sends ">: " when a BLE serial session starts
    await sleep(100);

    // Send start_rpc_session command as raw ASCII
    const cmd = new TextEncoder().encode(RPC_SESSION_START_CMD);
    await this.writeRaw(cmd);

    // Wait for the Flipper to acknowledge and enter RPC mode
    await sleep(300);

    this.setState("rpc_ready");
  }

  async disconnect(): Promise<void> {
    if (this.deviceId) {
      try {
        await this.ble.disconnect(this.deviceId);
      } catch {
        // Ignore disconnect errors
      }
    }
    this.cleanup();
    this.setState("disconnected");
  }

  private cleanup(): void {
    this.txSubscription?.remove();
    this.txSubscription = null;
    this.disconnectSubscription?.remove();
    this.disconnectSubscription = null;
    this.writeQueue = [];
    this.isWriting = false;
  }

  async negotiateMtu(requestedMtu: number): Promise<number> {
    if (!this.deviceId) throw new Error("Not connected");
    this.negotiatedMtu = await this.ble.requestMtu(this.deviceId, requestedMtu);
    return this.negotiatedMtu;
  }

  // ──────────────────────────────────────────────
  // Flow-controlled writes
  // ──────────────────────────────────────────────

  async write(data: Uint8Array): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.writeQueue.push({ data, resolve, reject });
      this.processWriteQueue();
    });
  }

  private async processWriteQueue(): Promise<void> {
    if (this.isWriting || this.writeQueue.length === 0) return;
    this.isWriting = true;

    while (this.writeQueue.length > 0) {
      const item = this.writeQueue.shift()!;
      try {
        await this.writeWithFlowControl(item.data);
        item.resolve();
      } catch (error) {
        item.reject(error instanceof Error ? error : new Error(String(error)));
      }
    }

    this.isWriting = false;
  }

  /**
   * Write data respecting BLE flow control.
   *
   * 1. Check available buffer on Flipper (flow control characteristic)
   * 2. Chunk data to fit within MTU - 3 bytes (ATT header)
   * 3. Write each chunk, waiting for buffer availability between chunks
   */
  private async writeWithFlowControl(data: Uint8Array): Promise<void> {
    const maxChunkSize = this.negotiatedMtu - 3; // ATT header overhead
    let offset = 0;

    while (offset < data.length) {
      // Check flow control before each chunk
      const available = await this.getAvailableBuffer();
      if (available === 0) {
        // Wait and retry
        await sleep(10);
        continue;
      }

      const chunkSize = Math.min(maxChunkSize, data.length - offset, available);
      const chunk = data.slice(offset, offset + chunkSize);

      await this.writeRaw(chunk);
      offset += chunkSize;
    }
  }

  /** Write raw bytes to the RX characteristic */
  private async writeRaw(data: Uint8Array): Promise<void> {
    if (!this.deviceId) throw new Error("Not connected");

    await this.ble.writeCharacteristic(
      this.deviceId,
      FLIPPER_BLE.SERIAL_SERVICE_UUID,
      FLIPPER_BLE.RX_CHARACTERISTIC_UUID,
      data,
      true, // With response for reliability
    );
  }

  async getAvailableBuffer(): Promise<number> {
    if (!this.deviceId) return 0;

    try {
      const data = await this.ble.readCharacteristic(
        this.deviceId,
        FLIPPER_BLE.SERIAL_SERVICE_UUID,
        FLIPPER_BLE.FLOW_CONTROL_UUID,
      );

      // Flow control value is a uint32 LE
      if (data.length >= 4) {
        return data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24);
      }
      if (data.length >= 2) {
        return data[0] | (data[1] << 8);
      }
      if (data.length >= 1) {
        return data[0];
      }
      return 1024; // Default if we can't read
    } catch {
      // If flow control read fails, assume buffer is available
      return 1024;
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
