/**
 * Flipper Status screen — shows device details, storage info, and
 * quick action buttons for common Flipper operations.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useStore } from "../../src/hooks/useStore";
import { flipperClient } from "./index";

export default function StatusScreen() {
  const { connectedDevice, deviceInfo, transportState } = useStore();
  const [storageInfo, setStorageInfo] = useState<{
    totalSpace: number;
    freeSpace: number;
  } | null>(null);
  const [powerInfo, setPowerInfo] = useState<Record<string, string> | null>(
    null,
  );

  const refreshInfo = useCallback(async () => {
    if (transportState !== "rpc_ready") return;

    try {
      const [storage, power] = await Promise.all([
        flipperClient.storageInfo("/ext"),
        flipperClient.getPowerInfo(),
      ]);
      setStorageInfo(storage);
      setPowerInfo(power);
    } catch (error) {
      console.error("[Status] Refresh error:", error);
    }
  }, [transportState]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  if (transportState !== "rpc_ready") {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Flipper Connected</Text>
          <Text style={styles.emptyText}>
            Go to the Devices tab to connect your Flipper Zero.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Device card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Device</Text>
        <Text style={styles.deviceName}>{deviceInfo?.name ?? "Unknown"}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Firmware</Text>
          <Text style={styles.detailValue}>{deviceInfo?.firmwareVersion}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Branch</Text>
          <Text style={styles.detailValue}>{deviceInfo?.firmwareBranch}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Hardware</Text>
          <Text style={styles.detailValue}>
            {deviceInfo?.hardwareModel} rev {deviceInfo?.hardwareRevision}
          </Text>
        </View>
      </View>

      {/* Storage card */}
      {storageInfo && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SD Card Storage</Text>
          <View style={styles.storageBar}>
            <View
              style={[
                styles.storageFill,
                {
                  width: `${((storageInfo.totalSpace - storageInfo.freeSpace) / storageInfo.totalSpace) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.storageText}>
            {formatBytes(storageInfo.totalSpace - storageInfo.freeSpace)} used of{" "}
            {formatBytes(storageInfo.totalSpace)} ({formatBytes(storageInfo.freeSpace)} free)
          </Text>
        </View>
      )}

      {/* Power card */}
      {powerInfo && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Power</Text>
          {Object.entries(powerInfo).map(([key, value]) => (
            <View key={key} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{key}</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionBtn} onPress={refreshInfo}>
            <Text style={styles.actionBtnText}>Refresh Info</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => flipperClient.ping().then((r) => Alert.alert("Ping", `RTT: ${r.rttMs}ms`))}
          >
            <Text style={styles.actionBtnText}>Ping</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.dangerBtn]}
            onPress={() =>
              Alert.alert("Reboot", "Reboot Flipper Zero?", [
                { text: "Cancel" },
                {
                  text: "Reboot",
                  style: "destructive",
                  onPress: () => flipperClient.reboot(),
                },
              ])
            }
          >
            <Text style={styles.actionBtnText}>Reboot</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { padding: 16 },
  card: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#666",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  deviceName: { color: "#ff6b35", fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  detailLabel: { color: "#888", fontSize: 13 },
  detailValue: { color: "#ccc", fontSize: 13 },
  storageBar: {
    height: 6,
    backgroundColor: "#333",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  storageFill: { height: "100%", backgroundColor: "#ff6b35", borderRadius: 3 },
  storageText: { color: "#888", fontSize: 12 },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  actionBtn: {
    backgroundColor: "#0a0a0a",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  dangerBtn: { borderColor: "#ff4444" },
  actionBtnText: { color: "#ccc", fontSize: 13 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 120 },
  emptyTitle: { color: "#ff6b35", fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  emptyText: { color: "#666", fontSize: 14, textAlign: "center" },
});
