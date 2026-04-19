/**
 * FlipperClient — high-level service that combines BLE transport + RPC client.
 *
 * This is what the app UI interacts with. It handles:
 * - Connecting to a Flipper via BLE
 * - Starting the RPC session
 * - Exposing all commands as simple async methods
 * - Executing tool calls from the backend agent
 */

import {
  BleTransport,
  RpcClient,
  // System
  ping,
  getDeviceInfo,
  getPowerInfo,
  getProtobufVersion,
  getDatetime,
  reboot,
  // Storage
  storageInfo,
  storageList,
  storageRead,
  storageReadText,
  storageWrite,
  storageWriteText,
  storageDelete,
  storageMkdir,
  storageStat,
  // App
  appStart,
  appExit,
  appLockStatus,
  appLoadFile,
  appButtonPress,
  appButtonRelease,
  subghzTransmit,
  nfcStartRead,
  nfcEmulate,
  rfidStartRead,
  rfidEmulate,
  irTransmit,
  badUsbExecute,
  // GPIO
  gpioSetPinMode,
  gpioWritePin,
  gpioReadPin,
  GpioPin,
  GpioPinMode,
  // GUI
  startScreenStream,
  type TransportState,
  type ScreenFrameCallback,
} from "@openflip/flipper-rpc";
import type {
  FlipperDeviceInfo,
  ToolCallRequest,
  ToolCallResult,
} from "@openflip/shared";
import { createBleAdapter } from "../ble/manager";

export class FlipperClient {
  private transport: BleTransport;
  private rpc: RpcClient | null = null;
  private deviceId: string | null = null;

  constructor() {
    const adapter = createBleAdapter();
    this.transport = new BleTransport(adapter);
  }

  get state(): TransportState {
    return this.transport.state;
  }

  onStateChange(handler: (state: TransportState) => void): () => void {
    this.transport.on("onStateChange", handler);
    return () => this.transport.off("onStateChange", handler);
  }

  // ──────────────────────────────────────────────
  // Connection
  // ──────────────────────────────────────────────

  async connect(deviceId: string): Promise<FlipperDeviceInfo> {
    this.deviceId = deviceId;

    // BLE connect + service discovery + MTU negotiation
    await this.transport.connect(deviceId);

    // Start RPC session (drain prompt, send start_rpc_session)
    await this.transport.startRpcSession();

    // Create RPC client and start listening
    this.rpc = new RpcClient(this.transport);
    this.rpc.start();

    // Verify connectivity and get device info
    const info = await getDeviceInfo(this.rpc);
    return info;
  }

  async disconnect(): Promise<void> {
    this.rpc?.stop();
    this.rpc = null;
    await this.transport.disconnect();
    this.deviceId = null;
  }

  private ensureRpc(): RpcClient {
    if (!this.rpc) throw new Error("Not connected to Flipper");
    return this.rpc;
  }

  // ──────────────────────────────────────────────
  // System commands
  // ──────────────────────────────────────────────

  async ping() {
    return ping(this.ensureRpc());
  }

  async getDeviceInfo() {
    return getDeviceInfo(this.ensureRpc());
  }

  async getPowerInfo() {
    return getPowerInfo(this.ensureRpc());
  }

  async getProtobufVersion() {
    return getProtobufVersion(this.ensureRpc());
  }

  async getDatetime() {
    return getDatetime(this.ensureRpc());
  }

  async reboot(mode?: "os" | "dfu" | "update") {
    return reboot(this.ensureRpc(), mode);
  }

  // ──────────────────────────────────────────────
  // Storage commands
  // ──────────────────────────────────────────────

  async storageInfo(path: string) {
    return storageInfo(this.ensureRpc(), path);
  }

  async storageList(path: string) {
    return storageList(this.ensureRpc(), path);
  }

  async storageRead(path: string) {
    return storageRead(this.ensureRpc(), path);
  }

  async storageReadText(path: string) {
    return storageReadText(this.ensureRpc(), path);
  }

  async storageWrite(path: string, data: Uint8Array) {
    return storageWrite(this.ensureRpc(), path, data);
  }

  async storageWriteText(path: string, text: string) {
    return storageWriteText(this.ensureRpc(), path, text);
  }

  async storageDelete(path: string, recursive?: boolean) {
    return storageDelete(this.ensureRpc(), path, recursive);
  }

  async storageMkdir(path: string) {
    return storageMkdir(this.ensureRpc(), path);
  }

  async storageStat(path: string) {
    return storageStat(this.ensureRpc(), path);
  }

  // ──────────────────────────────────────────────
  // App commands
  // ──────────────────────────────────────────────

  async appStart(name: string, args?: string) {
    return appStart(this.ensureRpc(), name, args);
  }

  async appExit() {
    return appExit(this.ensureRpc());
  }

  async appLockStatus() {
    return appLockStatus(this.ensureRpc());
  }

  async subghzTransmit(filePath: string, durationMs?: number) {
    return subghzTransmit(this.ensureRpc(), filePath, durationMs);
  }

  async nfcRead() {
    return nfcStartRead(this.ensureRpc());
  }

  async nfcEmulate(filePath: string) {
    return nfcEmulate(this.ensureRpc(), filePath);
  }

  async rfidRead() {
    return rfidStartRead(this.ensureRpc());
  }

  async rfidEmulate(filePath: string) {
    return rfidEmulate(this.ensureRpc(), filePath);
  }

  async irTransmit(filePath: string) {
    return irTransmit(this.ensureRpc(), filePath);
  }

  async badUsbExecute(scriptPath: string) {
    return badUsbExecute(this.ensureRpc(), scriptPath);
  }

  // ──────────────────────────────────────────────
  // GPIO
  // ──────────────────────────────────────────────

  async gpioSetPinMode(pin: GpioPin, mode: GpioPinMode) {
    return gpioSetPinMode(this.ensureRpc(), pin, mode);
  }

  async gpioWritePin(pin: GpioPin, value: 0 | 1) {
    return gpioWritePin(this.ensureRpc(), pin, value);
  }

  async gpioReadPin(pin: GpioPin) {
    return gpioReadPin(this.ensureRpc(), pin);
  }

  // ──────────────────────────────────────────────
  // GUI
  // ──────────────────────────────────────────────

  async startScreenStream(onFrame: ScreenFrameCallback) {
    return startScreenStream(this.ensureRpc(), onFrame);
  }

  // ──────────────────────────────────────────────
  // Agent tool execution
  // ──────────────────────────────────────────────

  /**
   * Execute a tool call from the backend agent.
   * Maps tool names to FlipperClient methods.
   */
  async executeToolCall(request: ToolCallRequest): Promise<ToolCallResult> {
    const { callId, toolName, parameters: params } = request;

    try {
      let data: unknown;

      switch (toolName) {
        case "flipper_ping":
          data = await this.ping();
          break;
        case "flipper_system_info":
          data = await this.getDeviceInfo();
          break;
        case "flipper_reboot":
          await this.reboot(params.mode as "os" | "dfu" | "update");
          data = { success: true };
          break;
        case "flipper_power_info":
          data = await this.getPowerInfo();
          break;
        case "flipper_storage_list":
          data = await this.storageList(params.path as string);
          break;
        case "flipper_storage_read":
          data = await this.storageReadText(params.path as string);
          break;
        case "flipper_storage_write":
          await this.storageWriteText(
            params.path as string,
            params.content as string,
          );
          data = { success: true };
          break;
        case "flipper_storage_delete":
          await this.storageDelete(
            params.path as string,
            params.recursive as boolean,
          );
          data = { success: true };
          break;
        case "flipper_storage_info":
          data = await this.storageInfo(params.path as string);
          break;
        case "flipper_storage_mkdir":
          await this.storageMkdir(params.path as string);
          data = { success: true };
          break;
        case "subghz_transmit":
          await this.subghzTransmit(
            params.file_path as string,
            (params.duration_ms as number) ?? 1000,
          );
          data = { success: true };
          break;
        case "nfc_read":
          await this.nfcRead();
          data = { success: true, message: "NFC read started" };
          break;
        case "nfc_emulate":
          await this.nfcEmulate(params.file_path as string);
          data = { success: true, message: "NFC emulation started" };
          break;
        case "rfid_read":
          await this.rfidRead();
          data = { success: true, message: "RFID read started" };
          break;
        case "rfid_emulate":
          await this.rfidEmulate(params.file_path as string);
          data = { success: true, message: "RFID emulation started" };
          break;
        case "ir_transmit":
          await this.irTransmit(params.file_path as string);
          data = { success: true };
          break;
        case "badusb_execute":
          if (!(params.confirm as boolean)) {
            return {
              callId,
              success: false,
              error: "BadUSB execution requires confirm=true",
            };
          }
          await this.badUsbExecute(params.script_path as string);
          data = { success: true };
          break;
        case "flipper_app_start":
          await this.appStart(
            params.name as string,
            params.args as string | undefined,
          );
          data = { success: true };
          break;
        case "flipper_app_stop":
          await this.appExit();
          data = { success: true };
          break;
        case "flipper_screenshot":
          // Capture a single frame
          data = { message: "Screen stream available via GUI" };
          break;
        case "install_module": {
          const binary = Uint8Array.from(
            atob(params.fap_base64 as string),
            (c) => c.charCodeAt(0),
          );
          await this.storageWrite(params.install_path as string, binary);
          data = { success: true };
          break;
        }
        case "gpio_set_mode": {
          const pinMap: Record<string, GpioPin> = {
            PC0: GpioPin.PC0, PC1: GpioPin.PC1, PC3: GpioPin.PC3,
            PB2: GpioPin.PB2, PB3: GpioPin.PB3, PA4: GpioPin.PA4,
            PA6: GpioPin.PA6, PA7: GpioPin.PA7,
          };
          const modeMap: Record<string, GpioPinMode> = {
            output_push_pull: GpioPinMode.OUTPUT_PUSH_PULL,
            output_open_drain: GpioPinMode.OUTPUT_OPEN_DRAIN,
            input: GpioPinMode.INPUT,
            analog: GpioPinMode.ANALOG,
          };
          await this.gpioSetPinMode(
            pinMap[params.pin as string],
            modeMap[params.mode as string],
          );
          data = { success: true };
          break;
        }
        case "gpio_write": {
          const pinMap2: Record<string, GpioPin> = {
            PC0: GpioPin.PC0, PC1: GpioPin.PC1, PC3: GpioPin.PC3,
            PB2: GpioPin.PB2, PB3: GpioPin.PB3, PA4: GpioPin.PA4,
            PA6: GpioPin.PA6, PA7: GpioPin.PA7,
          };
          await this.gpioWritePin(
            pinMap2[params.pin as string],
            params.value as 0 | 1,
          );
          data = { success: true };
          break;
        }
        case "gpio_read": {
          const pinMap3: Record<string, GpioPin> = {
            PC0: GpioPin.PC0, PC1: GpioPin.PC1, PC3: GpioPin.PC3,
            PB2: GpioPin.PB2, PB3: GpioPin.PB3, PA4: GpioPin.PA4,
            PA6: GpioPin.PA6, PA7: GpioPin.PA7,
          };
          const value = await this.gpioReadPin(pinMap3[params.pin as string]);
          data = { pin: params.pin, value };
          break;
        }
        default:
          return {
            callId,
            success: false,
            error: `Unknown tool: ${toolName}`,
          };
      }

      return { callId, success: true, data };
    } catch (error) {
      return {
        callId,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
