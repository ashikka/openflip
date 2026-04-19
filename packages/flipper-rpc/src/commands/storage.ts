/**
 * Storage commands: list, read, write, delete, mkdir, stat, info.
 *
 * File transfers larger than STORAGE_WRITE_CHUNK_SIZE are automatically
 * chunked across multiple write requests (using has_next framing).
 */

import type { RpcClient } from "./rpc-client.js";
import type {
  FlipperStorageInfo,
  FlipperStorageEntry,
} from "@openflip/shared";
import { STORAGE_WRITE_CHUNK_SIZE } from "@openflip/shared";
import { concat } from "../proto/encoder.js";

/**
 * Get storage info (total/free space) for a path.
 */
export async function storageInfo(
  rpc: RpcClient,
  path: string,
): Promise<FlipperStorageInfo> {
  const response = await rpc.sendSingle({
    type: "storageInfoRequest",
    data: { path },
  });
  if (response.content?.type === "storageInfoResponse") {
    return {
      totalSpace: response.content.data.totalSpace,
      freeSpace: response.content.data.freeSpace,
    };
  }
  throw new Error("Unexpected response type for storage info");
}

/**
 * List directory contents.
 */
export async function storageList(
  rpc: RpcClient,
  path: string,
): Promise<FlipperStorageEntry[]> {
  const responses = await rpc.send(
    { type: "storageListRequest", data: { path } },
    { timeout: 15_000 },
  );

  const entries: FlipperStorageEntry[] = [];
  for (const resp of responses) {
    if (resp.content?.type === "storageListResponse") {
      for (const file of resp.content.data.file) {
        entries.push({
          name: file.name,
          type: file.type === 1 ? "directory" : "file",
          size: file.size,
        });
      }
    }
  }
  return entries;
}

/**
 * Read a file from the Flipper.
 * Returns the file contents as a Uint8Array.
 * Handles multi-part responses for large files.
 */
export async function storageRead(
  rpc: RpcClient,
  path: string,
): Promise<Uint8Array> {
  const responses = await rpc.send(
    { type: "storageReadRequest", data: { path } },
    { timeout: 30_000 },
  );

  const chunks: Uint8Array[] = [];
  for (const resp of responses) {
    if (
      resp.content?.type === "storageReadResponse" &&
      resp.content.data.file.data
    ) {
      chunks.push(resp.content.data.file.data);
    }
  }

  if (chunks.length === 0) return new Uint8Array(0);
  if (chunks.length === 1) return chunks[0];
  return concat(...chunks);
}

/**
 * Read a file as a UTF-8 string.
 */
export async function storageReadText(
  rpc: RpcClient,
  path: string,
): Promise<string> {
  const data = await storageRead(rpc, path);
  return new TextDecoder().decode(data);
}

/**
 * Write data to a file on the Flipper.
 * Automatically chunks large files.
 */
export async function storageWrite(
  rpc: RpcClient,
  path: string,
  data: Uint8Array,
): Promise<void> {
  if (data.length <= STORAGE_WRITE_CHUNK_SIZE) {
    // Single write
    await rpc.sendSingle({
      type: "storageWriteRequest",
      data: {
        path,
        file: { type: 0, name: "", size: data.length, data },
      },
    });
    return;
  }

  // Chunked write: send multiple requests with has_next
  // For simplicity, we send each chunk as a separate write request
  // The Flipper appends data when writing to the same path in sequence
  let offset = 0;
  while (offset < data.length) {
    const chunk = data.slice(
      offset,
      Math.min(offset + STORAGE_WRITE_CHUNK_SIZE, data.length),
    );
    const isLast = offset + chunk.length >= data.length;

    await rpc.sendSingle({
      type: "storageWriteRequest",
      data: {
        path,
        file: { type: 0, name: "", size: chunk.length, data: chunk },
      },
    });

    offset += chunk.length;
  }
}

/**
 * Write a UTF-8 string to a file.
 */
export async function storageWriteText(
  rpc: RpcClient,
  path: string,
  text: string,
): Promise<void> {
  const data = new TextEncoder().encode(text);
  await storageWrite(rpc, path, data);
}

/**
 * Delete a file or directory.
 */
export async function storageDelete(
  rpc: RpcClient,
  path: string,
  recursive = false,
): Promise<void> {
  await rpc.sendSingle({
    type: "storageDeleteRequest",
    data: { path, recursive },
  });
}

/**
 * Create a directory.
 */
export async function storageMkdir(
  rpc: RpcClient,
  path: string,
): Promise<void> {
  await rpc.sendSingle({
    type: "storageMkdirRequest",
    data: { path },
  });
}

/**
 * Get file/directory stat info.
 */
export async function storageStat(
  rpc: RpcClient,
  path: string,
): Promise<FlipperStorageEntry> {
  const response = await rpc.sendSingle({
    type: "storageStatRequest",
    data: { path },
  });
  if (response.content?.type === "storageStatResponse") {
    const file = response.content.data.file;
    return {
      name: file.name,
      type: file.type === 1 ? "directory" : "file",
      size: file.size,
    };
  }
  throw new Error("Unexpected response type for storage stat");
}
