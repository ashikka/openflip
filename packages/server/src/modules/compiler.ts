/**
 * Module compiler — wraps uFBT to compile Flipper Zero FAP applications.
 *
 * Compilation runs in a temp directory. In production, this should
 * run inside a Docker container for sandboxing (since we're compiling
 * AI-generated C code).
 */

import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, writeFile, readFile, rm } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { existsSync } from "fs";
import type { ModuleBuildResult } from "@openflip/shared";
import { glob } from "fs/promises";

const execFileAsync = promisify(execFile);

/**
 * Compile a Flipper module from source files using uFBT.
 *
 * @param appId - Application ID (used for temp directory naming)
 * @param files - Map of filename → content (must include application.fam and at least one .c file)
 */
export async function compileModule(
  appId: string,
  files: Record<string, string>,
): Promise<ModuleBuildResult> {
  // Validate required files
  if (!files["application.fam"]) {
    return {
      moduleId: appId,
      status: "failed",
      error: "Missing application.fam manifest",
    };
  }

  const hasCFile = Object.keys(files).some((f) => f.endsWith(".c"));
  if (!hasCFile) {
    return {
      moduleId: appId,
      status: "failed",
      error: "No .c source file provided",
    };
  }

  // Create temp directory for compilation
  const tempDir = await mkdtemp(join(tmpdir(), `openflip-${appId}-`));

  try {
    // Write all source files
    for (const [filename, content] of Object.entries(files)) {
      const filePath = join(tempDir, filename);
      await writeFile(filePath, content, "utf-8");
    }

    // Run uFBT
    const { stdout, stderr } = await execFileAsync("ufbt", [], {
      cwd: tempDir,
      timeout: 60_000, // 60 second timeout
      env: {
        ...process.env,
        // Ensure ufbt uses the correct SDK
        UFBT_HOME: process.env.UFBT_HOME ?? join(process.env.HOME ?? "", ".ufbt"),
      },
    });

    const buildLog = `${stdout}\n${stderr}`;

    // Find the compiled .fap file in dist/
    const distDir = join(tempDir, "dist");
    if (!existsSync(distDir)) {
      return {
        moduleId: appId,
        status: "failed",
        buildLog,
        error: "Build succeeded but no dist/ directory found",
      };
    }

    // Find .fap file
    const entries = await readdir(distDir);
    const fapFile = entries.find((f) => f.endsWith(".fap"));

    if (!fapFile) {
      return {
        moduleId: appId,
        status: "failed",
        buildLog,
        error: "Build succeeded but no .fap file found in dist/",
      };
    }

    // Read the compiled binary
    const fapBinary = await readFile(join(distDir, fapFile));

    return {
      moduleId: appId,
      status: "compiled",
      fapBinary: new Uint8Array(fapBinary),
      buildLog,
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return {
      moduleId: appId,
      status: "failed",
      error: `Compilation failed: ${errMsg}`,
      buildLog: errMsg,
    };
  } finally {
    // Clean up temp directory
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

/** Read directory entries */
async function readdir(path: string): Promise<string[]> {
  const { readdir: rd } = await import("fs/promises");
  return rd(path);
}
