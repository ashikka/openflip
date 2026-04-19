/**
 * High-level Flipper Zero RPC client.
 *
 * Sits on top of the transport layer and provides an ergonomic API for
 * sending commands and receiving responses. Handles:
 * - Command ID tracking (each request gets a unique monotonic ID)
 * - Request/response correlation (matching responses to pending requests)
 * - Multi-part responses (has_next flag for streamed data)
 * - Timeout handling
 * - Error status mapping
 */

import type { Transport } from "../transport/transport.js";
import { encodePBMain } from "../proto/encoder.js";
import { DecoderBuffer } from "../proto/decoder.js";
import type { PBMain, PBContent } from "../proto/types.js";
import { CommandStatus, COMMAND_STATUS_MESSAGES } from "@openflip/shared";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface RpcClientOptions {
  /** Default timeout for RPC calls in ms (default: 10000) */
  defaultTimeout?: number;
}

interface PendingRequest {
  commandId: number;
  resolve: (responses: PBMain[]) => void;
  reject: (error: Error) => void;
  responses: PBMain[];
  timer: ReturnType<typeof setTimeout>;
}

export class FlipperRpcError extends Error {
  constructor(
    message: string,
    public readonly commandStatus: number,
    public readonly commandId: number,
  ) {
    super(message);
    this.name = "FlipperRpcError";
  }
}

// ──────────────────────────────────────────────
// RPC Client
// ──────────────────────────────────────────────

export class RpcClient {
  private transport: Transport;
  private nextCommandId = 1;
  private pendingRequests = new Map<number, PendingRequest>();
  private decoderBuffer = new DecoderBuffer();
  private defaultTimeout: number;
  private dataHandler: ((data: Uint8Array) => void) | null = null;

  /** Event listeners for unsolicited messages (screen frames, etc.) */
  private unsolicitedHandlers = new Set<(msg: PBMain) => void>();

  constructor(transport: Transport, options?: RpcClientOptions) {
    this.transport = transport;
    this.defaultTimeout = options?.defaultTimeout ?? 10_000;
  }

  /**
   * Start listening for data from the transport.
   * Call this after the transport is connected and RPC session is started.
   */
  start(): void {
    this.dataHandler = (data: Uint8Array) => {
      this.decoderBuffer.push(data);
      const messages = this.decoderBuffer.drain();
      for (const msg of messages) {
        this.handleMessage(msg);
      }
    };
    this.transport.on("onData", this.dataHandler);
  }

  /** Stop listening and clean up */
  stop(): void {
    if (this.dataHandler) {
      this.transport.off("onData", this.dataHandler);
      this.dataHandler = null;
    }
    // Reject all pending requests
    for (const pending of this.pendingRequests.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error("RPC client stopped"));
    }
    this.pendingRequests.clear();
    this.decoderBuffer.clear();
  }

  /** Register a handler for unsolicited messages (e.g., screen stream frames) */
  onUnsolicited(handler: (msg: PBMain) => void): () => void {
    this.unsolicitedHandlers.add(handler);
    return () => this.unsolicitedHandlers.delete(handler);
  }

  // ──────────────────────────────────────────────
  // Core send/receive
  // ──────────────────────────────────────────────

  /**
   * Send an RPC command and wait for the complete response.
   * Handles multi-part responses (has_next) automatically.
   */
  async send(
    content: PBContent,
    options?: { timeout?: number },
  ): Promise<PBMain[]> {
    const commandId = this.nextCommandId++;
    const timeout = options?.timeout ?? this.defaultTimeout;

    const msg: PBMain = {
      commandId,
      commandStatus: 0,
      hasNext: false,
      content,
    };

    const encoded = encodePBMain(msg);

    return new Promise<PBMain[]>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(commandId);
        reject(
          new Error(
            `RPC timeout after ${timeout}ms for command ${commandId} (${content.type})`,
          ),
        );
      }, timeout);

      this.pendingRequests.set(commandId, {
        commandId,
        resolve,
        reject,
        responses: [],
        timer,
      });

      this.transport.write(encoded).catch((err) => {
        clearTimeout(timer);
        this.pendingRequests.delete(commandId);
        reject(err);
      });
    });
  }

  /**
   * Send a command expecting a single response (most common case).
   * Throws FlipperRpcError if the command status is not OK.
   */
  async sendSingle(
    content: PBContent,
    options?: { timeout?: number },
  ): Promise<PBMain> {
    const responses = await this.send(content, options);
    const response = responses[0];
    if (!response) {
      throw new Error("No response received");
    }
    if (response.commandStatus !== CommandStatus.OK) {
      const statusMsg =
        COMMAND_STATUS_MESSAGES[response.commandStatus] ?? "Unknown error";
      throw new FlipperRpcError(
        `Flipper RPC error: ${statusMsg} (status=${response.commandStatus})`,
        response.commandStatus,
        response.commandId,
      );
    }
    return response;
  }

  // ──────────────────────────────────────────────
  // Message handling
  // ──────────────────────────────────────────────

  private handleMessage(msg: PBMain): void {
    // Check if this is a response to a pending request
    const pending = this.pendingRequests.get(msg.commandId);
    if (pending) {
      pending.responses.push(msg);

      // If has_next is false, this is the last part of the response
      if (!msg.hasNext) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(msg.commandId);

        // Check for error status on the final message
        pending.resolve(pending.responses);
      }
      return;
    }

    // Unsolicited message (command_id = 0 or unknown)
    // These are events like screen frames, app data exchange, etc.
    for (const handler of this.unsolicitedHandlers) {
      handler(msg);
    }
  }
}
