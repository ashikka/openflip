/**
 * Core types shared across the OpenFlip platform.
 */

// ──────────────────────────────────────────────
// Flipper Device
// ──────────────────────────────────────────────

export interface FlipperDevice {
  /** BLE device ID (platform-specific) */
  id: string;
  /** Device name from BLE advertisement (e.g. "Flipper ABCDE") */
  name: string;
  /** Signal strength */
  rssi: number;
  /** Whether we have an active RPC session */
  connected: boolean;
}

export interface FlipperDeviceInfo {
  name: string;
  hardwareModel: string;
  hardwareRevision: string;
  firmwareVersion: string;
  firmwareBranch: string;
  firmwareBuildDate: string;
  protobufMajor: number;
  protobufMinor: number;
}

export interface FlipperStorageInfo {
  totalSpace: number;
  freeSpace: number;
}

export interface FlipperStorageEntry {
  name: string;
  type: "file" | "directory";
  size: number;
}

// ──────────────────────────────────────────────
// RPC Protocol
// ──────────────────────────────────────────────

/** Command status codes from the Flipper protobuf schema */
export enum CommandStatus {
  OK = 0,
  ERROR = 1,
  ERROR_DECODE = 2,
  ERROR_NOT_IMPLEMENTED = 3,
  ERROR_BUSY = 4,
  ERROR_STORAGE_NOT_READY = 5,
  ERROR_STORAGE_EXIST = 6,
  ERROR_STORAGE_NOT_EXIST = 7,
  ERROR_STORAGE_INVALID_PARAMETER = 8,
  ERROR_STORAGE_DENIED = 9,
  ERROR_STORAGE_INVALID_NAME = 10,
  ERROR_STORAGE_INTERNAL = 11,
  ERROR_STORAGE_NOT_IMPLEMENTED = 12,
  ERROR_STORAGE_ALREADY_OPEN = 13,
  ERROR_STORAGE_DIR_NOT_EMPTY = 14,
  ERROR_INVALID_PARAMETERS = 15,
  ERROR_APP_CANT_START = 16,
  ERROR_APP_SYSTEM_LOCKED = 17,
  ERROR_APP_NOT_RUNNING = 21,
  ERROR_APP_CMD_ERROR = 22,
  ERROR_GPIO_MODE_INCORRECT = 58,
  ERROR_GPIO_UNKNOWN_PIN_MODE = 59,
}

/** Map command status to human-readable messages */
export const COMMAND_STATUS_MESSAGES: Record<number, string> = {
  [CommandStatus.OK]: "OK",
  [CommandStatus.ERROR]: "Unknown error",
  [CommandStatus.ERROR_DECODE]: "Decode error",
  [CommandStatus.ERROR_NOT_IMPLEMENTED]: "Not implemented",
  [CommandStatus.ERROR_BUSY]: "Device busy",
  [CommandStatus.ERROR_STORAGE_NOT_READY]: "Storage not ready",
  [CommandStatus.ERROR_STORAGE_EXIST]: "Already exists",
  [CommandStatus.ERROR_STORAGE_NOT_EXIST]: "Does not exist",
  [CommandStatus.ERROR_STORAGE_INVALID_PARAMETER]: "Invalid storage parameter",
  [CommandStatus.ERROR_STORAGE_DENIED]: "Storage access denied",
  [CommandStatus.ERROR_STORAGE_INVALID_NAME]: "Invalid name",
  [CommandStatus.ERROR_STORAGE_INTERNAL]: "Storage internal error",
  [CommandStatus.ERROR_STORAGE_NOT_IMPLEMENTED]: "Storage operation not implemented",
  [CommandStatus.ERROR_STORAGE_ALREADY_OPEN]: "File already open",
  [CommandStatus.ERROR_STORAGE_DIR_NOT_EMPTY]: "Directory not empty",
  [CommandStatus.ERROR_INVALID_PARAMETERS]: "Invalid parameters",
  [CommandStatus.ERROR_APP_CANT_START]: "Cannot start app",
  [CommandStatus.ERROR_APP_SYSTEM_LOCKED]: "System locked (another app is running)",
  [CommandStatus.ERROR_APP_NOT_RUNNING]: "App not running",
  [CommandStatus.ERROR_APP_CMD_ERROR]: "App command error",
  [CommandStatus.ERROR_GPIO_MODE_INCORRECT]: "GPIO mode incorrect",
  [CommandStatus.ERROR_GPIO_UNKNOWN_PIN_MODE]: "Unknown GPIO pin mode",
};

// ──────────────────────────────────────────────
// Agent / Tool Calling
// ──────────────────────────────────────────────

export type ToolCallStatus = "pending" | "running" | "success" | "error";

export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, unknown>;
  status: ToolCallStatus;
  result?: unknown;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface AgentMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolCalls?: ToolCall[];
  imageUrl?: string;
  timestamp: number;
}

// ──────────────────────────────────────────────
// WebSocket Protocol
// ──────────────────────────────────────────────

export type WSMessageType =
  | "agent_message"
  | "tool_call_request"
  | "tool_call_result"
  | "device_identified"
  | "module_ready"
  | "flipper_status"
  | "error";

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  sessionId: string;
  payload: T;
  timestamp: number;
}

export interface ToolCallRequest {
  callId: string;
  toolName: string;
  parameters: Record<string, unknown>;
}

export interface ToolCallResult {
  callId: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface DeviceIdentification {
  imageBase64: string;
  deviceName?: string;
  manufacturer?: string;
  protocols: string[];
  suggestedActions: string[];
  confidence: number;
}

// ──────────────────────────────────────────────
// Module System
// ──────────────────────────────────────────────

export interface FlipperModule {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  author: string;
  protocols: string[];
  /** URL to download pre-built .fap binary */
  downloadUrl?: string;
  /** Whether this module was AI-generated */
  generated: boolean;
}

export type ModuleBuildStatus =
  | "queued"
  | "generating"
  | "compiling"
  | "compiled"
  | "failed";

export interface ModuleBuildResult {
  moduleId: string;
  status: ModuleBuildStatus;
  fapBinary?: Uint8Array;
  buildLog?: string;
  error?: string;
}
