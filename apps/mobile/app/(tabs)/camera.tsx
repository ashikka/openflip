/**
 * Camera / Identify screen — take a photo of a device to identify it.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useStore } from "../../src/hooks/useStore";

export default function CameraScreen() {
  const { serverUrl, transportState, addMessage } = useStore();
  const [image, setImage] = useState<string | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [result, setResult] = useState<{
    deviceName: string;
    manufacturer: string;
    protocols: string[];
    suggestedActions: string[];
    confidence: number;
  } | null>(null);

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      if (result.assets[0].base64) {
        await identifyDevice(result.assets[0].base64);
      }
    }
  };

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      if (result.assets[0].base64) {
        await identifyDevice(result.assets[0].base64);
      }
    }
  };

  const identifyDevice = async (base64: string) => {
    setIdentifying(true);
    setResult(null);

    try {
      const response = await fetch(`${serverUrl}/api/identify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      if (!response.ok) throw new Error("Identification failed");

      const data = await response.json();
      setResult(data);

      // Add to agent chat
      addMessage({
        id: `identify-${Date.now()}`,
        role: "system",
        content: `Device identified: ${data.deviceName} (${data.manufacturer}). Protocols: ${data.protocols.join(", ")}. Confidence: ${Math.round(data.confidence * 100)}%`,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("[Identify] Error:", error);
    } finally {
      setIdentifying(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Capture buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.captureBtn} onPress={takePhoto}>
          <Text style={styles.captureBtnText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.captureBtn} onPress={pickFromLibrary}>
          <Text style={styles.captureBtnText}>From Library</Text>
        </TouchableOpacity>
      </View>

      {/* Image preview */}
      {image && (
        <Image source={{ uri: image }} style={styles.preview} resizeMode="contain" />
      )}

      {/* Loading */}
      {identifying && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#ff6b35" size="large" />
          <Text style={styles.loadingText}>Identifying device...</Text>
        </View>
      )}

      {/* Results */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>{result.deviceName}</Text>
          <Text style={styles.resultManufacturer}>{result.manufacturer}</Text>

          <Text style={styles.resultLabel}>Protocols</Text>
          <View style={styles.chipRow}>
            {result.protocols.map((p) => (
              <View key={p} style={styles.chip}>
                <Text style={styles.chipText}>{p}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.resultLabel}>Confidence</Text>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceFill,
                { width: `${result.confidence * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.confidenceText}>
            {Math.round(result.confidence * 100)}%
          </Text>

          <Text style={styles.resultLabel}>Suggested Actions</Text>
          {result.suggestedActions.map((action, i) => (
            <Text key={i} style={styles.actionText}>
              {action}
            </Text>
          ))}

          {/* Action button */}
          {transportState === "rpc_ready" && (
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>
                Execute Best Action
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {!image && !identifying && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Device Identification</Text>
          <Text style={styles.emptyText}>
            Point your camera at any hardware device. OpenFlip will identify
            it and tell you what your Flipper Zero can do with it.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  content: { padding: 16 },
  buttonRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  captureBtn: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  captureBtnText: { color: "#ff6b35", fontWeight: "bold", fontSize: 14 },
  preview: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#111",
  },
  loadingContainer: { alignItems: "center", padding: 32 },
  loadingText: { color: "#888", marginTop: 12, fontSize: 14 },
  resultCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#ff6b35",
  },
  resultTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  resultManufacturer: { color: "#888", fontSize: 14, marginBottom: 16 },
  resultLabel: {
    color: "#666",
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 6,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    backgroundColor: "#0a0a0a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  chipText: { color: "#ff6b35", fontSize: 12 },
  confidenceBar: {
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
    overflow: "hidden",
  },
  confidenceFill: { height: "100%", backgroundColor: "#00ff88", borderRadius: 2 },
  confidenceText: { color: "#00ff88", fontSize: 12, marginTop: 4 },
  actionText: { color: "#ccc", fontSize: 13, marginBottom: 4, lineHeight: 18 },
  actionBtn: {
    backgroundColor: "#ff6b35",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  actionBtnText: { color: "#000", fontWeight: "bold", fontSize: 15 },
  emptyContainer: { alignItems: "center", paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: {
    color: "#ff6b35",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  emptyText: { color: "#666", fontSize: 14, textAlign: "center", lineHeight: 22 },
});
