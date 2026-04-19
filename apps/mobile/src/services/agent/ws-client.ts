/**
 * WebSocket client for communicating with the OpenFlip backend agent.
 *
 * Handles the message loop:
 * 1. Send user messages to the agent
 * 2. Receive tool call requests from the agent
 * 3. Execute tool calls on the Flipper (via FlipperClient)
 * 4. Send results back to the agent
 * 5. Receive and display agent text responses
 */

import type {
  WSMessage,
  ToolCallRequest,
  ToolCallResult,
  AgentMessage,
} from "@openflip/shared";
import type { FlipperClient } from "../flipper/client.js";

export interface AgentWSClientOptions {
  serverUrl: string;
  flipperClient: FlipperClient;
  onAgentMessage: (message: AgentMessage) => void;
  onToolCallStarted: (request: ToolCallRequest) => void;
  onToolCallCompleted: (result: ToolCallResult) => void;
  onError: (error: Error) => void;
  onSessionId: (sessionId: string) => void;
}

export class AgentWSClient {
  private ws: WebSocket | null = null;
  private options: AgentWSClientOptions;
  private sessionId: string | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: AgentWSClientOptions) {
    this.options = options;
  }

  connect(): void {
    const url = this.options.serverUrl.replace(/^http/, "ws") + "/ws";

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log("[WS] Connected to agent server");
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data as string);
        this.handleMessage(msg);
      } catch (error) {
        console.error("[WS] Failed to parse message:", error);
      }
    };

    this.ws.onclose = () => {
      console.log("[WS] Disconnected from agent server");
      // Auto-reconnect after 3 seconds
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = (event) => {
      this.options.onError(new Error("WebSocket error"));
    };
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  /**
   * Send a user message to the agent.
   */
  sendMessage(content: string, imageBase64?: string): void {
    if (!this.ws || !this.sessionId) {
      this.options.onError(new Error("Not connected to agent server"));
      return;
    }

    const msg: WSMessage = {
      type: "agent_message",
      sessionId: this.sessionId,
      payload: { content, imageBase64 },
      timestamp: Date.now(),
    };

    this.ws.send(JSON.stringify(msg));
  }

  private async handleMessage(msg: WSMessage): Promise<void> {
    switch (msg.type) {
      case "flipper_status": {
        // Session established
        const payload = msg.payload as { sessionId: string };
        this.sessionId = payload.sessionId;
        this.options.onSessionId(payload.sessionId);
        break;
      }

      case "agent_message": {
        // Agent text response
        const payload = msg.payload as { content: string };
        this.options.onAgentMessage({
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: payload.content,
          timestamp: Date.now(),
        });
        break;
      }

      case "tool_call_request": {
        // Agent wants to execute a tool on the Flipper
        const request = msg.payload as ToolCallRequest;
        this.options.onToolCallStarted(request);

        // Execute the tool call on the Flipper
        const result = await this.options.flipperClient.executeToolCall(request);
        this.options.onToolCallCompleted(result);

        // Send result back to agent
        const resultMsg: WSMessage<ToolCallResult> = {
          type: "tool_call_result",
          sessionId: this.sessionId!,
          payload: result,
          timestamp: Date.now(),
        };
        this.ws?.send(JSON.stringify(resultMsg));
        break;
      }

      case "error": {
        const payload = msg.payload as { error: string };
        this.options.onError(new Error(payload.error));
        break;
      }
    }
  }
}
