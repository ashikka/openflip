/**
 * GUI commands: screen streaming.
 *
 * The Flipper's 128x64 monochrome display can be streamed over RPC.
 * Each frame is a 1024-byte buffer (128*64/8 = 1024 bits packed into bytes).
 */

import type { RpcClient } from "./rpc-client.js";
import type { PBMain } from "../proto/types.js";

export type ScreenFrameCallback = (frame: {
  data: Uint8Array;
  orientation: number;
}) => void;

/**
 * Start streaming the Flipper's screen.
 * Returns a stop function to end the stream.
 *
 * @param onFrame - Called with each screen frame (1024 bytes, 128x64 monochrome)
 */
export async function startScreenStream(
  rpc: RpcClient,
  onFrame: ScreenFrameCallback,
): Promise<() => Promise<void>> {
  // Register handler for screen frame events (unsolicited, command_id = 0)
  const unsubscribe = rpc.onUnsolicited((msg: PBMain) => {
    if (msg.content?.type === "guiScreenFrame") {
      onFrame({
        data: msg.content.data.data,
        orientation: msg.content.data.orientation,
      });
    }
  });

  // Send the start request
  await rpc.sendSingle({ type: "guiStartScreenStreamRequest" });

  // Return stop function
  return async () => {
    unsubscribe();
    try {
      await rpc.sendSingle({ type: "guiStopScreenStreamRequest" });
    } catch {
      // May fail if already disconnected
    }
  };
}
