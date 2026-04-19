/**
 * Agent screen — chat interface for the AI agent.
 *
 * Users type messages, the agent processes them, executes Flipper tool calls,
 * and responds with results. Tool executions are shown as inline cards.
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useStore } from "../../src/hooks/useStore";
import type { AgentMessage, ToolCall } from "@openflip/shared";

export default function AgentScreen() {
  const { messages, activeToolCalls, transportState, isAgentThinking, addMessage } =
    useStore();
  const [input, setInput] = useState("");
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const sendMessage = () => {
    if (!input.trim()) return;
    if (transportState !== "rpc_ready") return;

    addMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    });

    // The WebSocket client will pick this up from the store
    // In a real implementation, this would call agentWSClient.sendMessage()
    setInput("");
  };

  const renderMessage = ({ item }: { item: AgentMessage }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === "user" ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      <Text style={styles.messageRole}>
        {item.role === "user" ? "You" : "OpenFlip"}
      </Text>
      <Text style={styles.messageText}>{item.content}</Text>

      {/* Tool call cards */}
      {item.toolCalls?.map((tc) => (
        <ToolCallCard key={tc.id} toolCall={tc} />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={88}
    >
      {/* Connection warning */}
      {transportState !== "rpc_ready" && (
        <View style={styles.warningBar}>
          <Text style={styles.warningText}>
            Connect to a Flipper Zero first (Devices tab)
          </Text>
        </View>
      )}

      {/* Active tool calls */}
      {activeToolCalls.filter((tc) => tc.status === "running").length > 0 && (
        <View style={styles.activeTools}>
          {activeToolCalls
            .filter((tc) => tc.status === "running")
            .map((tc) => (
              <View key={tc.id} style={styles.activeToolChip}>
                <Text style={styles.activeToolText}>{tc.name}</Text>
              </View>
            ))}
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>OpenFlip Agent</Text>
            <Text style={styles.emptySubtitle}>
              Connect your Flipper Zero, then ask me anything.
            </Text>
            <Text style={styles.emptyHint}>
              Try: "What signals can you capture?" or "Read the NFC card on my
              desk" or send a photo to identify a device.
            </Text>
          </View>
        }
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder={
            transportState === "rpc_ready"
              ? "Ask the agent..."
              : "Connect to Flipper first"
          }
          placeholderTextColor="#666"
          editable={transportState === "rpc_ready"}
          multiline
          maxLength={2000}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!input.trim() || transportState !== "rpc_ready") &&
              styles.sendBtnDisabled,
          ]}
          onPress={sendMessage}
          disabled={!input.trim() || transportState !== "rpc_ready"}
        >
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function ToolCallCard({ toolCall }: { toolCall: ToolCall }) {
  const statusColors = {
    pending: "#666",
    running: "#ffaa00",
    success: "#00ff88",
    error: "#ff4444",
  };

  return (
    <View style={styles.toolCard}>
      <View style={styles.toolCardHeader}>
        <View
          style={[
            styles.toolDot,
            { backgroundColor: statusColors[toolCall.status] },
          ]}
        />
        <Text style={styles.toolName}>{toolCall.name}</Text>
        <Text style={styles.toolStatus}>{toolCall.status}</Text>
      </View>
      {toolCall.error && (
        <Text style={styles.toolError}>{toolCall.error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  warningBar: {
    backgroundColor: "#332200",
    padding: 8,
    alignItems: "center",
  },
  warningText: { color: "#ffaa00", fontSize: 12 },
  activeTools: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#111",
    flexWrap: "wrap",
    gap: 4,
  },
  activeToolChip: {
    backgroundColor: "#332200",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeToolText: { color: "#ffaa00", fontSize: 11 },
  messageList: { padding: 16, paddingBottom: 8 },
  messageBubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#ff6b35",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#1a1a1a",
  },
  messageRole: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 4,
    fontWeight: "bold",
  },
  messageText: { color: "#fff", fontSize: 14, lineHeight: 20 },
  toolCard: {
    backgroundColor: "#0a0a0a",
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#333",
  },
  toolCardHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  toolDot: { width: 6, height: 6, borderRadius: 3 },
  toolName: { color: "#aaa", fontSize: 11, flex: 1, fontFamily: "monospace" },
  toolStatus: { color: "#666", fontSize: 10 },
  toolError: { color: "#ff4444", fontSize: 11, marginTop: 4 },
  emptyContainer: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { color: "#ff6b35", fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  emptySubtitle: { color: "#888", fontSize: 16, textAlign: "center", marginBottom: 16 },
  emptyHint: { color: "#555", fontSize: 13, textAlign: "center", lineHeight: 20 },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: "#ff6b35",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 8,
  },
  sendBtnDisabled: { opacity: 0.3 },
  sendBtnText: { color: "#000", fontWeight: "bold", fontSize: 14 },
});
