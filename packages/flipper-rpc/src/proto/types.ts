/**
 * TypeScript types for the Flipper Zero protobuf RPC protocol.
 *
 * These mirror the official .proto definitions from flipperdevices/flipperzero-protobuf.
 * We define them manually to avoid a heavy codegen dependency — the Flipper schema
 * is stable and well-documented, so hand-typed interfaces are maintainable.
 *
 * Reference: https://github.com/flipperdevices/flipperzero-protobuf
 */

// ──────────────────────────────────────────────
// Core envelope: PB.Main
// ──────────────────────────────────────────────

export interface PBMain {
  commandId: number;
  commandStatus: number;
  hasNext: boolean;
  content?: PBContent;
}

export type PBContent =
  | { type: "empty" }
  | { type: "stopSession" }
  // System
  | { type: "systemPingRequest"; data: PBSystemPingRequest }
  | { type: "systemPingResponse"; data: PBSystemPingResponse }
  | { type: "systemRebootRequest"; data: PBSystemRebootRequest }
  | { type: "systemDeviceInfoRequest" }
  | { type: "systemDeviceInfoResponse"; data: PBSystemDeviceInfoResponse }
  | { type: "systemGetDatetimeRequest" }
  | { type: "systemGetDatetimeResponse"; data: PBSystemDatetimeResponse }
  | { type: "systemPowerInfoRequest" }
  | { type: "systemPowerInfoResponse"; data: PBSystemPowerInfoResponse }
  | { type: "systemProtobufVersionRequest" }
  | { type: "systemProtobufVersionResponse"; data: PBSystemProtobufVersionResponse }
  // Storage
  | { type: "storageInfoRequest"; data: PBStorageInfoRequest }
  | { type: "storageInfoResponse"; data: PBStorageInfoResponse }
  | { type: "storageListRequest"; data: PBStorageListRequest }
  | { type: "storageListResponse"; data: PBStorageListResponse }
  | { type: "storageReadRequest"; data: PBStorageReadRequest }
  | { type: "storageReadResponse"; data: PBStorageReadResponse }
  | { type: "storageWriteRequest"; data: PBStorageWriteRequest }
  | { type: "storageDeleteRequest"; data: PBStorageDeleteRequest }
  | { type: "storageMkdirRequest"; data: PBStorageMkdirRequest }
  | { type: "storageStatRequest"; data: PBStorageStatRequest }
  | { type: "storageStatResponse"; data: PBStorageStatResponse }
  // App
  | { type: "appStartRequest"; data: PBAppStartRequest }
  | { type: "appLockStatusRequest" }
  | { type: "appLockStatusResponse"; data: PBAppLockStatusResponse }
  | { type: "appExitRequest" }
  | { type: "appLoadFileRequest"; data: PBAppLoadFileRequest }
  | { type: "appButtonPressRequest"; data: PBAppButtonPressRequest }
  | { type: "appButtonReleaseRequest" }
  | { type: "appButtonPressReleaseRequest"; data: PBAppButtonPressReleaseRequest }
  | { type: "appGetErrorRequest" }
  | { type: "appGetErrorResponse"; data: PBAppGetErrorResponse }
  | { type: "appDataExchangeRequest"; data: PBAppDataExchangeRequest }
  // GUI
  | { type: "guiStartScreenStreamRequest" }
  | { type: "guiStopScreenStreamRequest" }
  | { type: "guiScreenFrame"; data: PBGuiScreenFrame }
  // GPIO
  | { type: "gpioSetPinModeRequest"; data: PBGpioSetPinModeRequest }
  | { type: "gpioWritePinRequest"; data: PBGpioWritePinRequest }
  | { type: "gpioReadPinRequest"; data: PBGpioReadPinRequest }
  | { type: "gpioReadPinResponse"; data: PBGpioReadPinResponse };

// ──────────────────────────────────────────────
// System messages
// ──────────────────────────────────────────────

export interface PBSystemPingRequest {
  data?: Uint8Array;
}

export interface PBSystemPingResponse {
  data?: Uint8Array;
}

export interface PBSystemRebootRequest {
  mode: "os" | "dfu" | "update";
}

export interface PBSystemDeviceInfoResponse {
  key: string;
  value: string;
}

export interface PBSystemDatetimeResponse {
  hour: number;
  minute: number;
  second: number;
  day: number;
  month: number;
  year: number;
  weekday: number;
}

export interface PBSystemPowerInfoResponse {
  key: string;
  value: string;
}

export interface PBSystemProtobufVersionResponse {
  major: number;
  minor: number;
}

// ──────────────────────────────────────────────
// Storage messages
// ──────────────────────────────────────────────

export interface PBStorageInfoRequest {
  path: string;
}

export interface PBStorageInfoResponse {
  totalSpace: number;
  freeSpace: number;
}

export interface PBStorageListRequest {
  path: string;
  filterMaxSize?: number;
}

export interface PBStorageFile {
  type: number; // 0 = file, 1 = directory
  name: string;
  size: number;
  data?: Uint8Array;
}

export interface PBStorageListResponse {
  file: PBStorageFile[];
}

export interface PBStorageReadRequest {
  path: string;
}

export interface PBStorageReadResponse {
  file: PBStorageFile;
}

export interface PBStorageWriteRequest {
  path: string;
  file: PBStorageFile;
}

export interface PBStorageDeleteRequest {
  path: string;
  recursive: boolean;
}

export interface PBStorageMkdirRequest {
  path: string;
}

export interface PBStorageStatRequest {
  path: string;
}

export interface PBStorageStatResponse {
  file: PBStorageFile;
}

// ──────────────────────────────────────────────
// App messages
// ──────────────────────────────────────────────

export interface PBAppStartRequest {
  name: string;
  args?: string;
}

export interface PBAppLockStatusResponse {
  locked: boolean;
}

export interface PBAppLoadFileRequest {
  path: string;
}

export interface PBAppButtonPressRequest {
  args?: string;
}

export interface PBAppButtonPressReleaseRequest {
  args?: string;
}

export interface PBAppGetErrorResponse {
  code: number;
  text: string;
}

export interface PBAppDataExchangeRequest {
  data: Uint8Array;
}

// ──────────────────────────────────────────────
// GUI messages
// ──────────────────────────────────────────────

export interface PBGuiScreenFrame {
  data: Uint8Array;
  orientation: number;
}

// ──────────────────────────────────────────────
// GPIO messages
// ──────────────────────────────────────────────

export enum GpioPinMode {
  OUTPUT_PUSH_PULL = 0,
  OUTPUT_OPEN_DRAIN = 1,
  INPUT = 2,
  ANALOG = 3,
}

export enum GpioPin {
  PC0 = 0,
  PC1 = 1,
  PC3 = 2,
  PB2 = 3,
  PB3 = 4,
  PA4 = 5,
  PA6 = 6,
  PA7 = 7,
}

export interface PBGpioSetPinModeRequest {
  pin: GpioPin;
  mode: GpioPinMode;
}

export interface PBGpioWritePinRequest {
  pin: GpioPin;
  value: number;
}

export interface PBGpioReadPinRequest {
  pin: GpioPin;
}

export interface PBGpioReadPinResponse {
  value: number;
}
