/**
 * System commands: ping, device info, reboot, datetime, power info, protobuf version.
 */

import type { RpcClient } from "./rpc-client.js";
import type { FlipperDeviceInfo } from "@openflip/shared";

/**
 * Ping the Flipper. Returns the round-trip time in milliseconds.
 */
export async function ping(
  rpc: RpcClient,
  data?: Uint8Array,
): Promise<{ rttMs: number; responseData?: Uint8Array }> {
  const start = Date.now();
  const response = await rpc.sendSingle({
    type: "systemPingRequest",
    data: { data: data ?? new Uint8Array([1, 2, 3, 4]) },
  });
  const rttMs = Date.now() - start;

  let responseData: Uint8Array | undefined;
  if (response.content?.type === "systemPingResponse") {
    responseData = response.content.data.data;
  }

  return { rttMs, responseData };
}

/**
 * Get comprehensive device information.
 * The Flipper sends multiple has_next responses, each with a key-value pair.
 */
export async function getDeviceInfo(rpc: RpcClient): Promise<FlipperDeviceInfo> {
  const responses = await rpc.send(
    { type: "systemDeviceInfoRequest" },
    { timeout: 15_000 },
  );

  const info: Record<string, string> = {};
  for (const resp of responses) {
    if (resp.content?.type === "systemDeviceInfoResponse") {
      info[resp.content.data.key] = resp.content.data.value;
    }
  }

  return {
    name: info["hardware_name"] ?? info["device_name"] ?? "Unknown",
    hardwareModel: info["hardware_model"] ?? "Unknown",
    hardwareRevision: info["hardware_ver"] ?? "Unknown",
    firmwareVersion: info["firmware_version"] ?? "Unknown",
    firmwareBranch: info["firmware_branch"] ?? "Unknown",
    firmwareBuildDate: info["firmware_build_date"] ?? "Unknown",
    protobufMajor: parseInt(info["protobuf_version_major"] ?? "0", 10),
    protobufMinor: parseInt(info["protobuf_version_minor"] ?? "0", 10),
  };
}

/**
 * Get the protobuf protocol version supported by the Flipper.
 */
export async function getProtobufVersion(
  rpc: RpcClient,
): Promise<{ major: number; minor: number }> {
  const response = await rpc.sendSingle({
    type: "systemProtobufVersionRequest",
  });
  if (response.content?.type === "systemProtobufVersionResponse") {
    return response.content.data;
  }
  return { major: 0, minor: 0 };
}

/**
 * Get the current date and time from the Flipper.
 */
export async function getDatetime(rpc: RpcClient): Promise<{
  hour: number;
  minute: number;
  second: number;
  day: number;
  month: number;
  year: number;
}> {
  const response = await rpc.sendSingle({
    type: "systemGetDatetimeRequest",
  });
  if (response.content?.type === "systemGetDatetimeResponse") {
    return response.content.data;
  }
  throw new Error("Unexpected response type");
}

/**
 * Get power/battery information from the Flipper.
 */
export async function getPowerInfo(
  rpc: RpcClient,
): Promise<Record<string, string>> {
  const responses = await rpc.send(
    { type: "systemPowerInfoRequest" },
    { timeout: 5_000 },
  );

  const info: Record<string, string> = {};
  for (const resp of responses) {
    if (resp.content?.type === "systemPowerInfoResponse") {
      info[resp.content.data.key] = resp.content.data.value;
    }
  }
  return info;
}

/**
 * Reboot the Flipper Zero.
 */
export async function reboot(
  rpc: RpcClient,
  mode: "os" | "dfu" | "update" = "os",
): Promise<void> {
  // Reboot doesn't send a proper response — the device just reboots
  try {
    await rpc.send(
      { type: "systemRebootRequest", data: { mode } },
      { timeout: 2_000 },
    );
  } catch {
    // Expected: the Flipper disconnects during reboot
  }
}
