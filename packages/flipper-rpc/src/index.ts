// ──────────────────────────────────────────────
// @openflip/flipper-rpc
//
// TypeScript library for communicating with a Flipper Zero
// over its protobuf RPC protocol via BLE serial.
// ──────────────────────────────────────────────

// Proto types and encoding
export type { PBMain, PBContent } from "./proto/types.js";
export { GpioPin, GpioPinMode } from "./proto/types.js";
export { encodePBMain, encodeVarint, decodeVarint } from "./proto/encoder.js";
export { decodePBMain, DecoderBuffer } from "./proto/decoder.js";

// Transport
export type { Transport, TransportState, TransportEvents } from "./transport/transport.js";
export type { BleAdapter } from "./transport/ble-transport.js";
export { BleTransport } from "./transport/ble-transport.js";

// RPC Client
export { RpcClient, FlipperRpcError } from "./commands/rpc-client.js";
export type { RpcClientOptions } from "./commands/rpc-client.js";

// Commands — System
export {
  ping,
  getDeviceInfo,
  getProtobufVersion,
  getDatetime,
  getPowerInfo,
  reboot,
} from "./commands/system.js";

// Commands — Storage
export {
  storageInfo,
  storageList,
  storageRead,
  storageReadText,
  storageWrite,
  storageWriteText,
  storageDelete,
  storageMkdir,
  storageStat,
} from "./commands/storage.js";

// Commands — App
export {
  appStart,
  appLockStatus,
  appExit,
  appLoadFile,
  appButtonPress,
  appButtonRelease,
  appButtonPressRelease,
  appGetError,
  appDataExchange,
  subghzTransmit,
  nfcStartRead,
  nfcEmulate,
  rfidStartRead,
  rfidEmulate,
  irTransmit,
  badUsbExecute,
} from "./commands/app.js";

// Commands — GPIO
export { gpioSetPinMode, gpioWritePin, gpioReadPin } from "./commands/gpio.js";

// Commands — GUI
export { startScreenStream } from "./commands/gui.js";
export type { ScreenFrameCallback } from "./commands/gui.js";
