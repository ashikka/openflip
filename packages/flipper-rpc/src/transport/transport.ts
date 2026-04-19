/**
 * Abstract transport interface for communicating with a Flipper Zero.
 *
 * The RPC client uses this abstraction so it doesn't care whether the
 * underlying connection is BLE, USB serial, or WiFi TCP.
 */

export type TransportState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "rpc_ready";

export interface TransportEvents {
  /** Raw data received from the Flipper */
  onData: (data: Uint8Array) => void;
  /** Transport state changed */
  onStateChange: (state: TransportState) => void;
  /** Transport error */
  onError: (error: Error) => void;
  /** Transport disconnected (may be unexpected) */
  onDisconnect: (reason?: string) => void;
}

export interface Transport {
  /** Current transport state */
  readonly state: TransportState;

  /** Register event handlers */
  on<K extends keyof TransportEvents>(event: K, handler: TransportEvents[K]): void;

  /** Remove event handler */
  off<K extends keyof TransportEvents>(event: K, handler: TransportEvents[K]): void;

  /**
   * Connect to the Flipper Zero.
   * For BLE: scan, pair, connect, discover services, negotiate MTU.
   * For USB: open serial port.
   */
  connect(deviceId?: string): Promise<void>;

  /**
   * Initialize the RPC session.
   * Drains the CLI prompt and sends `start_rpc_session\r`.
   * Must be called after connect() before sending any protobuf commands.
   */
  startRpcSession(): Promise<void>;

  /**
   * Write raw bytes to the Flipper.
   * The transport handles chunking based on MTU or buffer limits.
   */
  write(data: Uint8Array): Promise<void>;

  /**
   * Get available buffer space on the Flipper (for flow control).
   * Returns the number of bytes that can be written without overflow.
   * BLE transport reads this from the flow control characteristic.
   */
  getAvailableBuffer(): Promise<number>;

  /** Disconnect from the Flipper */
  disconnect(): Promise<void>;

  /** Negotiate MTU (BLE only, no-op for USB/WiFi) */
  negotiateMtu?(requestedMtu: number): Promise<number>;
}
