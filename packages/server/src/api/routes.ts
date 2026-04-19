/**
 * REST API routes.
 *
 * - POST /api/identify — Identify a device from an image
 * - POST /api/modules/search — Search module registry
 * - POST /api/modules/build — Generate and compile a custom module
 * - GET  /api/health — Health check
 */

import type { Express, Request, Response } from "express";
import { identifyDevice } from "../vision/identify.js";
import { searchModules } from "../modules/registry.js";

export function setupRoutes(app: Express): void {
  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", service: "openflip-server" });
  });

  // Device identification
  app.post("/api/identify", async (req: Request, res: Response) => {
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        res.status(400).json({ error: "imageBase64 is required" });
        return;
      }
      const result = await identifyDevice(imageBase64);
      res.json(result);
    } catch (error) {
      console.error("[API] Identification error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Module search
  app.post("/api/modules/search", async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      const results = searchModules(query ?? "");
      res.json({ modules: results });
    } catch (error) {
      console.error("[API] Module search error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}
