/**
 * OpenFlip Backend Server
 *
 * Hosts the AI agent (GPT-5.4), WebSocket relay for phone app communication,
 * device identification via vision, and module compilation pipeline.
 *
 * NOTE: In ESM, all static imports are hoisted and resolved before module body
 * code runs. That means dotenv config() here runs AFTER imports. All OpenAI
 * clients therefore use lazy initialization (created on first API call, not at
 * import time) to ensure process.env is populated.
 */

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { setupWebSocket } from "./ws/handler.js";
import { setupRoutes } from "./api/routes.js";

const PORT = parseInt(process.env.PORT ?? "3001", 10);
const app = express();

app.use(express.json({ limit: "50mb" }));

// REST API routes
setupRoutes(app);

// Create HTTP server and attach WebSocket
const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

setupWebSocket(wss);

server.listen(PORT, () => {
  console.log(`[OpenFlip] Server running on port ${PORT}`);
  console.log(`[OpenFlip] WebSocket at ws://localhost:${PORT}/ws`);
  console.log(`[OpenFlip] REST API at http://localhost:${PORT}/api`);
});
