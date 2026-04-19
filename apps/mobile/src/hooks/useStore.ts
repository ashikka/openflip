/**
 * Global state store using Zustand.
 *
 * Manages:
 * - Flipper connection state
 * - Scanned devices list
 * - Agent conversation messages
 * - Active tool calls
 */

import { create } from "zustand";
import type {
  FlipperDevice,
  FlipperDeviceInfo,
  AgentMessage,
  ToolCall,
  ToolCallRequest,
  ToolCallResult,
} from "@openflip/shared";
import type { TransportState } from "@openflip/flipper-rpc";

interface OpenFlipState {
  // ── BLE / Flipper ──────────────────────────
  scannedDevices: FlipperDevice[];
  connectedDevice: FlipperDevice | null;
  deviceInfo: FlipperDeviceInfo | null;
  transportState: TransportState;
  isScanning: boolean;

  // ── Agent / Chat ───────────────────────────
  messages: AgentMessage[];
  activeToolCalls: ToolCall[];
  sessionId: string | null;
  isAgentThinking: boolean;
  serverUrl: string;

  // ── Actions ────────────────────────────────
  addScannedDevice: (device: FlipperDevice) => void;
  clearScannedDevices: () => void;
  setConnectedDevice: (device: FlipperDevice | null) => void;
  setDeviceInfo: (info: FlipperDeviceInfo | null) => void;
  setTransportState: (state: TransportState) => void;
  setIsScanning: (scanning: boolean) => void;

  addMessage: (message: AgentMessage) => void;
  addToolCall: (request: ToolCallRequest) => void;
  updateToolCall: (result: ToolCallResult) => void;
  setSessionId: (id: string | null) => void;
  setIsAgentThinking: (thinking: boolean) => void;
  setServerUrl: (url: string) => void;
}

export const useStore = create<OpenFlipState>((set) => ({
  // Initial state
  scannedDevices: [],
  connectedDevice: null,
  deviceInfo: null,
  transportState: "disconnected",
  isScanning: false,

  messages: [],
  activeToolCalls: [],
  sessionId: null,
  isAgentThinking: false,
  serverUrl: "http://localhost:3001",

  // BLE actions
  addScannedDevice: (device) =>
    set((state) => {
      const exists = state.scannedDevices.some((d) => d.id === device.id);
      if (exists) {
        return {
          scannedDevices: state.scannedDevices.map((d) =>
            d.id === device.id ? { ...d, rssi: device.rssi } : d,
          ),
        };
      }
      return { scannedDevices: [...state.scannedDevices, device] };
    }),

  clearScannedDevices: () => set({ scannedDevices: [] }),

  setConnectedDevice: (device) => set({ connectedDevice: device }),
  setDeviceInfo: (info) => set({ deviceInfo: info }),
  setTransportState: (state) => set({ transportState: state }),
  setIsScanning: (scanning) => set({ isScanning: scanning }),

  // Agent actions
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  addToolCall: (request) =>
    set((state) => ({
      activeToolCalls: [
        ...state.activeToolCalls,
        {
          id: request.callId,
          name: request.toolName,
          parameters: request.parameters,
          status: "running" as const,
          startedAt: Date.now(),
        },
      ],
    })),

  updateToolCall: (result) =>
    set((state) => ({
      activeToolCalls: state.activeToolCalls.map((tc) =>
        tc.id === result.callId
          ? {
              ...tc,
              status: result.success ? ("success" as const) : ("error" as const),
              result: result.data,
              error: result.error,
              completedAt: Date.now(),
            }
          : tc,
      ),
    })),

  setSessionId: (id) => set({ sessionId: id }),
  setIsAgentThinking: (thinking) => set({ isAgentThinking: thinking }),
  setServerUrl: (url) => set({ serverUrl: url }),
}));
