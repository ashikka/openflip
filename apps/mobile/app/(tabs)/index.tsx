/**
 * Devices screen — BLE scanning and connection to Flipper Zero.
 */

import React, { useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useStore } from "../../src/hooks/useStore";
import { scanForFlippers } from "../../src/services/ble/manager";
import { FlipperClient } from "../../src/services/flipper/client";

// Singleton flipper client (shared across the app)
const flipperClient = new FlipperClient();

export { flipperClient };

export default function DevicesScreen() {
  const {
    scannedDevices,
    connectedDevice,
    deviceInfo,
    transportState,
    isScanning,
    addScannedDevice,
    clearScannedDevices,
    setConnectedDevice,
    setDeviceInfo,
    setTransportState,
    setIsScanning,
  } = useStore();

  const stopScanRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = flipperClient.onStateChange(setTransportState);
    return unsubscribe;
  }, [setTransportState]);

  const startScan = useCallback(() => {
    clearScannedDevices();
    setIsScanning(true);

    stopScanRef.current = scanForFlippers(
      (device) => {
        addScannedDevice({
          id: device.id,
          name: device.name,
          rssi: device.rssi,
          connected: false,
        });
      },
      (error) => {
        console.error("[Scan] Error:", error);
        setIsScanning(false);
      },
    );

    // Auto-stop after 10 seconds
    setTimeout(() => {
      stopScanRef.current?.();
      setIsScanning(false);
    }, 10_000);
  }, [addScannedDevice, clearScannedDevices, setIsScanning]);

  const connectToDevice = useCallback(
    async (deviceId: string, deviceName: string) => {
      try {
        setTransportState("connecting");
        const info = await flipperClient.connect(deviceId);

        setConnectedDevice({
          id: deviceId,
          name: deviceName,
          rssi: 0,
          connected: true,
        });
        setDeviceInfo(info);
      } catch (error) {
        console.error("[Connect] Error:", error);
        setTransportState("disconnected");
      }
    },
    [setConnectedDevice, setDeviceInfo, setTransportState],
  );

  const disconnect = useCallback(async () => {
    await flipperClient.disconnect();
    setConnectedDevice(null);
    setDeviceInfo(null);
  }, [setConnectedDevice, setDeviceInfo]);

  return (
    <View style={styles.container}>
      {/* Connection status */}
      <View style={styles.statusBar}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                transportState === "rpc_ready"
                  ? "#00ff88"
                  : transportState === "connecting"
                    ? "#ffaa00"
                    : "#ff4444",
            },
          ]}
        />
        <Text style={styles.statusText}>
          {transportState === "rpc_ready"
            ? `Connected: ${connectedDevice?.name}`
            : transportState === "connecting"
              ? "Connecting..."
              : "Disconnected"}
        </Text>
        {connectedDevice && (
          <TouchableOpacity onPress={disconnect} style={styles.disconnectBtn}>
            <Text style={styles.disconnectText}>Disconnect</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Device info */}
      {deviceInfo && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{deviceInfo.name}</Text>
          <Text style={styles.infoDetail}>
            FW: {deviceInfo.firmwareVersion} ({deviceInfo.firmwareBranch})
          </Text>
          <Text style={styles.infoDetail}>
            HW: {deviceInfo.hardwareModel} rev {deviceInfo.hardwareRevision}
          </Text>
          <Text style={styles.infoDetail}>
            Protobuf: v{deviceInfo.protobufMajor}.{deviceInfo.protobufMinor}
          </Text>
        </View>
      )}

      {/* Scan button */}
      {!connectedDevice && (
        <TouchableOpacity
          style={[styles.scanBtn, isScanning && styles.scanBtnActive]}
          onPress={startScan}
          disabled={isScanning}
        >
          {isScanning ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.scanBtnText}>Scan for Flipper Zero</Text>
          )}
        </TouchableOpacity>
      )}

      {/* Scanned devices list */}
      {!connectedDevice && (
        <FlatList
          data={scannedDevices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.deviceCard}
              onPress={() => connectToDevice(item.id, item.name)}
            >
              <Text style={styles.deviceName}>{item.name}</Text>
              <Text style={styles.deviceRssi}>
                {item.rssi} dBm
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {isScanning
                ? "Scanning for Flipper Zero devices..."
                : "Tap scan to find your Flipper Zero"}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a", padding: 16 },
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    marginBottom: 16,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { color: "#ccc", flex: 1, fontSize: 14 },
  disconnectBtn: { padding: 6 },
  disconnectText: { color: "#ff4444", fontSize: 12 },
  infoCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#ff6b35",
  },
  infoTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  infoDetail: { color: "#888", fontSize: 13, marginBottom: 2 },
  scanBtn: {
    backgroundColor: "#ff6b35",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  scanBtnActive: { opacity: 0.7 },
  scanBtnText: { color: "#000", fontWeight: "bold", fontSize: 16 },
  deviceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  deviceName: { color: "#fff", fontSize: 16 },
  deviceRssi: { color: "#666", fontSize: 14 },
  emptyText: { color: "#666", textAlign: "center", marginTop: 32, fontSize: 14 },
});
