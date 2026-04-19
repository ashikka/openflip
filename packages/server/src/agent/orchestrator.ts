/**
 * Agent Orchestrator
 *
 * Manages the GPT-5.4 conversation loop with tool calling.
 * The orchestrator:
 * 1. Receives user messages (text and/or images)
 * 2. Sends them to GPT-5.4 with the Flipper tool definitions
 * 3. When GPT requests a tool call, relays it to the phone app via callback
 * 4. Waits for the tool result, feeds it back to GPT
 * 5. Repeats until GPT produces a text response
 */

import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionContentPart,
} from "openai/resources/chat/completions";
import { FLIPPER_TOOLS } from "./tools/definitions.js";
import { SYSTEM_PROMPT } from "./system-prompt.js";
import type { ToolCallResult } from "@openflip/shared";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface AgentCallbacks {
  onToolCall: (
    callId: string,
    toolName: string,
    parameters: Record<string, unknown>,
  ) => Promise<void>;
  onAgentResponse: (content: string) => void;
}

interface PendingToolCall {
  resolve: (result: ToolCallResult) => void;
}

// ──────────────────────────────────────────────
// Orchestrator
// ──────────────────────────────────────────────

export class AgentOrchestrator {
  private openai: OpenAI;
  private sessionId: string;
  private conversationHistory: ChatCompletionMessageParam[] = [];
  private pendingToolCalls = new Map<string, PendingToolCall>();

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize with system prompt
    this.conversationHistory.push({
      role: "system",
      content: SYSTEM_PROMPT,
    });
  }

  /**
   * Process a user message through the agent loop.
   * May result in multiple tool calls before a final text response.
   */
  async processUserMessage(
    content: string,
    imageBase64: string | undefined,
    callbacks: AgentCallbacks,
  ): Promise<void> {
    // Build the user message
    const userContent: ChatCompletionContentPart[] = [];

    if (content) {
      userContent.push({ type: "text", text: content });
    }

    if (imageBase64) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`,
          detail: "high",
        },
      });
    }

    this.conversationHistory.push({
      role: "user",
      content: userContent.length === 1 ? content : userContent,
    });

    // Run the agent loop
    await this.runAgentLoop(callbacks);
  }

  /**
   * Resolve a pending tool call with its result.
   * Called when the phone app completes a Flipper operation.
   */
  resolveToolCall(callId: string, result: ToolCallResult): void {
    const pending = this.pendingToolCalls.get(callId);
    if (pending) {
      this.pendingToolCalls.delete(callId);
      pending.resolve(result);
    } else {
      console.warn(`[Agent] No pending tool call for ${callId}`);
    }
  }

  // ──────────────────────────────────────────────
  // Agent loop
  // ──────────────────────────────────────────────

  private async runAgentLoop(callbacks: AgentCallbacks): Promise<void> {
    const MAX_ITERATIONS = 20; // Safety limit

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1",
        messages: this.conversationHistory,
        tools: FLIPPER_TOOLS,
        tool_choice: "auto",
        max_tokens: 4096,
      });

      const choice = response.choices[0];
      if (!choice) {
        callbacks.onAgentResponse("No response from AI agent.");
        return;
      }

      const message = choice.message;

      // Add assistant message to history
      this.conversationHistory.push(message);

      // Check if agent wants to call tools
      if (message.tool_calls && message.tool_calls.length > 0) {
        // Execute all tool calls
        const toolResults = await Promise.all(
          message.tool_calls.map(async (toolCall) => {
            const parameters = JSON.parse(toolCall.function.arguments);

            // Special handling for tools that run server-side
            if (
              toolCall.function.name === "identify_device" ||
              toolCall.function.name === "search_modules"
            ) {
              return this.executeServerTool(
                toolCall.id,
                toolCall.function.name,
                parameters,
              );
            }

            // For Flipper tools, relay to phone app and wait for result
            const result = await this.executeFlipperTool(
              toolCall.id,
              toolCall.function.name,
              parameters,
              callbacks,
            );

            return {
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            };
          }),
        );

        // Add tool results to conversation history
        for (const result of toolResults) {
          this.conversationHistory.push({
            role: "tool" as const,
            tool_call_id: result.tool_call_id,
            content: result.content,
          });
        }

        // Continue the loop — GPT will process the tool results
        continue;
      }

      // No tool calls — this is the final text response
      if (message.content) {
        callbacks.onAgentResponse(message.content);
      }
      return;
    }

    callbacks.onAgentResponse(
      "Agent reached maximum iteration limit. Please try again with a simpler request.",
    );
  }

  /**
   * Execute a tool that runs on the Flipper via the phone app.
   * Sends the tool call to the phone and waits for the result.
   */
  private async executeFlipperTool(
    callId: string,
    toolName: string,
    parameters: Record<string, unknown>,
    callbacks: AgentCallbacks,
  ): Promise<ToolCallResult> {
    return new Promise<ToolCallResult>((resolve) => {
      // Register the pending call
      this.pendingToolCalls.set(callId, { resolve });

      // Send to phone app
      callbacks.onToolCall(callId, toolName, parameters).catch((err) => {
        this.pendingToolCalls.delete(callId);
        resolve({
          callId,
          success: false,
          error: `Failed to send tool call: ${err}`,
        });
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingToolCalls.has(callId)) {
          this.pendingToolCalls.delete(callId);
          resolve({
            callId,
            success: false,
            error: "Tool call timed out after 30 seconds",
          });
        }
      }, 30_000);
    });
  }

  /**
   * Execute tools that run server-side (device identification, module search).
   */
  private async executeServerTool(
    callId: string,
    toolName: string,
    parameters: Record<string, unknown>,
  ): Promise<{ tool_call_id: string; content: string }> {
    try {
      let result: unknown;

      switch (toolName) {
        case "identify_device": {
          const { identifyDevice } = await import("../vision/identify.js");
          result = await identifyDevice(
            parameters.image_base64 as string,
          );
          break;
        }
        case "search_modules": {
          const { searchModules } = await import("../modules/registry.js");
          result = searchModules(parameters.query as string);
          break;
        }
        default:
          result = { error: `Unknown server tool: ${toolName}` };
      }

      return {
        tool_call_id: callId,
        content: JSON.stringify(result),
      };
    } catch (error) {
      return {
        tool_call_id: callId,
        content: JSON.stringify({
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      };
    }
  }
}
