/**
 * BLE Manager — bridges react-native-ble-plx to @openflip/flipper-rpc's BleAdapter.
 *
 * Handles scanning for Flipper Zero devices, connecting, and providing
 * the BleAdapter interface that the BleTransport requires.
 */

import { BleManager, Device, type Subscription } from "react-native-ble-plx";
import { Buffer } from "buffer";
import type { BleAdapter } from "@openflip/flipper-rpc";
import { FLIPPER_BLE } from "@openflip/shared";

// Singleton BLE manager (react-native-ble-plx requires single instance)
let bleManager: BleManager | null = null;

export function getBleManager(): BleManager {
  if (!bleManager) {
    bleManager = new BleManager();
  }
  return bleManager;
}

/**
 * Scan for Flipper Zero devices.
 * Flippers advertise the serial service UUID.
 */
export function scanForFlippers(
  onDeviceFound: (device: { id: string; name: string; rssi: number }) => void,
  onError: (error: Error) => void,
): () => void {
  const manager = getBleManager();

  manager.startDeviceScan(
    [FLIPPER_BLE.SERIAL_SERVICE_UUID],
    { allowDuplicates: false },
    (error, device) => {
      if (error) {
        onError(error);
        return;
      }
      if (device?.name && device.name.startsWith("Flipper")) {
        onDeviceFound({
          id: device.id,
          name: device.name,
          rssi: device.rssi ?? -100,
        });
      }
    },
  );

  return () => manager.stopDeviceScan();
}

/**
 * Creates a BleAdapter that wraps react-native-ble-plx for use with
 * @openflip/flipper-rpc's BleTransport.
 */
export function createBleAdapter(): BleAdapter {
  const manager = getBleManager();

  return {
    async connect(deviceId: string): Promise<void> {
      await manager.connectToDevice(deviceId, {
        autoConnect: false,
        requestMTU: 512,
      });
    },

    async disconnect(deviceId: string): Promise<void> {
      await manager.cancelDeviceConnection(deviceId);
    },

    async discoverServicesAndCharacteristics(deviceId: string): Promise<void> {
      const device = await manager.discoverAllServicesAndCharacteristicsForDevice(deviceId);
      if (!device) {
        throw new Error("Failed to discover services");
      }
    },

    async requestMtu(deviceId: string, mtu: number): Promise<number> {
      const device = await manager.requestMTUForDevice(deviceId, mtu);
      return device.mtu ?? 23;
    },

    async writeCharacteristic(
      deviceId: string,
      serviceUuid: string,
      charUuid: string,
      data: Uint8Array,
      withResponse: boolean,
    ): Promise<void> {
      const base64 = Buffer.from(data).toString("base64");
      if (withResponse) {
        await manager.writeCharacteristicWithResponseForDevice(
          deviceId,
          serviceUuid,
          charUuid,
          base64,
        );
      } else {
        await manager.writeCharacteristicWithoutResponseForDevice(
          deviceId,
          serviceUuid,
          charUuid,
          base64,
        );
      }
    },

    async readCharacteristic(
      deviceId: string,
      serviceUuid: string,
      charUuid: string,
    ): Promise<Uint8Array> {
      const char = await manager.readCharacteristicForDevice(
        deviceId,
        serviceUuid,
        charUuid,
      );
      if (char.value) {
        return new Uint8Array(Buffer.from(char.value, "base64"));
      }
      return new Uint8Array(0);
    },

    monitorCharacteristic(
      deviceId: string,
      serviceUuid: string,
      charUuid: string,
      callback: (data: Uint8Array) => void,
    ): { remove: () => void } {
      const subscription: Subscription =
        manager.monitorCharacteristicForDevice(
          deviceId,
          serviceUuid,
          charUuid,
          (error, char) => {
            if (error) {
              console.warn("[BLE] Monitor error:", error.message);
              return;
            }
            if (char?.value) {
              const data = new Uint8Array(Buffer.from(char.value, "base64"));
              callback(data);
            }
          },
        );

      return { remove: () => subscription.remove() };
    },

    onDisconnected(
      deviceId: string,
      callback: (error: Error | null) => void,
    ): { remove: () => void } {
      const subscription = manager.onDeviceDisconnected(
        deviceId,
        (error, _device) => {
          callback(error ?? null);
        },
      );
      return { remove: () => subscription.remove() };
    },
  };
}
