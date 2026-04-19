/**
 * WebSocket handler for real-time phone app ↔ backend communication.
 *
 * Protocol:
 * - Phone connects and sends { type: "agent_message", sessionId, payload: { content, imageBase64? } }
 * - Server processes via AI agent
 * - If agent makes a tool call, server sends { type: "tool_call_request", sessionId, payload: { callId, toolName, parameters } }
 * - Phone executes the tool on the Flipper via BLE and responds { type: "tool_call_result", sessionId, payload: { callId, success, data?, error? } }
 * - Server feeds result back to agent and continues the loop
 * - When agent produces a text response, server sends { type: "agent_message", sessionId, payload: { content } }
 */

import type { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import type { WSMessage, ToolCallResult } from "@openflip/shared";
import { AgentOrchestrator } from "../agent/orchestrator.js";

interface Session {
  ws: WebSocket;
  sessionId: string;
  orchestrator: AgentOrchestrator;
}

const sessions = new Map<string, Session>();

export function setupWebSocket(wss: WebSocketServer): void {
  wss.on("connection", (ws: WebSocket) => {
    const sessionId = uuidv4();
    const orchestrator = new AgentOrchestrator(sessionId);

    const session: Session = { ws, sessionId, orchestrator };
    sessions.set(sessionId, session);

    console.log(`[WS] New session: ${sessionId}`);

    // Send session ID to client
    sendMessage(ws, {
      type: "flipper_status",
      sessionId,
      payload: { status: "connected", sessionId },
      timestamp: Date.now(),
    });

    ws.on("message", async (raw) => {
      try {
        const msg: WSMessage = JSON.parse(raw.toString());
        await handleMessage(session, msg);
      } catch (error) {
        console.error(`[WS] Error handling message:`, error);
        sendMessage(ws, {
          type: "error",
          sessionId,
          payload: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
          timestamp: Date.now(),
        });
      }
    });

    ws.on("close", () => {
      console.log(`[WS] Session closed: ${sessionId}`);
      sessions.delete(sessionId);
    });
  });
}

async function handleMessage(session: Session, msg: WSMessage): Promise<void> {
  const { ws, orchestrator } = session;

  switch (msg.type) {
    case "agent_message": {
      // User sent a message — run the agent loop
      const payload = msg.payload as {
        content: string;
        imageBase64?: string;
      };

      await orchestrator.processUserMessage(
        payload.content,
        payload.imageBase64,
        {
          // Called when agent wants to execute a tool on the Flipper
          onToolCall: async (callId, toolName, parameters) => {
            sendMessage(ws, {
              type: "tool_call_request",
              sessionId: session.sessionId,
              payload: { callId, toolName, parameters },
              timestamp: Date.now(),
            });
          },
          // Called when agent produces a text response
          onAgentResponse: (content) => {
            sendMessage(ws, {
              type: "agent_message",
              sessionId: session.sessionId,
              payload: { content },
              timestamp: Date.now(),
            });
          },
        },
      );
      break;
    }

    case "tool_call_result": {
      // Phone completed a tool call — feed result back to agent
      const result = msg.payload as ToolCallResult;
      orchestrator.resolveToolCall(result.callId, result);
      break;
    }

    default:
      console.warn(`[WS] Unknown message type: ${msg.type}`);
  }
}

function sendMessage(ws: WebSocket, msg: WSMessage): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}
