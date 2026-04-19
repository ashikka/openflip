/**
 * Protobuf encoder for Flipper Zero RPC protocol.
 *
 * Implements manual protobuf encoding matching the PB.Main schema.
 * Uses varint length-delimited framing as per the Flipper serial protocol:
 *   [varint length][protobuf payload]
 *
 * Protobuf wire format reference:
 * - Varint: field_number << 3 | wire_type
 * - Wire type 0: varint (int32, bool, enum)
 * - Wire type 2: length-delimited (string, bytes, embedded message)
 *
 * PB.Main field numbers (from flipper.proto):
 *   1: command_id (uint32)
 *   2: command_status (enum)
 *   3: has_next (bool)
 *   content: oneof with various field numbers (4-75)
 */

import type { PBMain, PBContent } from "./types.js";

// ──────────────────────────────────────────────
// Varint encoding
// ──────────────────────────────────────────────

/** Encode a number as a protobuf varint */
export function encodeVarint(value: number): Uint8Array {
  const bytes: number[] = [];
  let v = value >>> 0; // Ensure unsigned
  while (v > 0x7f) {
    bytes.push((v & 0x7f) | 0x80);
    v >>>= 7;
  }
  bytes.push(v & 0x7f);
  return new Uint8Array(bytes);
}

/** Decode a varint from a buffer at the given offset. Returns [value, bytesRead] */
export function decodeVarint(buf: Uint8Array, offset: number): [number, number] {
  let result = 0;
  let shift = 0;
  let bytesRead = 0;

  while (offset + bytesRead < buf.length) {
    const byte = buf[offset + bytesRead];
    result |= (byte & 0x7f) << shift;
    bytesRead++;
    if ((byte & 0x80) === 0) {
      return [result >>> 0, bytesRead];
    }
    shift += 7;
    if (shift >= 35) {
      throw new Error("Varint too long");
    }
  }
  throw new Error("Varint: unexpected end of buffer");
}

// ──────────────────────────────────────────────
// Protobuf field encoding helpers
// ──────────────────────────────────────────────

/** Encode a protobuf tag (field number + wire type) */
function encodeTag(fieldNumber: number, wireType: number): Uint8Array {
  return encodeVarint((fieldNumber << 3) | wireType);
}

/** Encode a uint32 field */
function encodeUint32Field(fieldNumber: number, value: number): Uint8Array {
  if (value === 0) return new Uint8Array(0); // Default value, omit
  return concat(encodeTag(fieldNumber, 0), encodeVarint(value));
}

/** Encode a bool field */
function encodeBoolField(fieldNumber: number, value: boolean): Uint8Array {
  if (!value) return new Uint8Array(0); // Default false, omit
  return concat(encodeTag(fieldNumber, 0), encodeVarint(1));
}

/** Encode a string field */
function encodeStringField(fieldNumber: number, value: string): Uint8Array {
  if (!value) return new Uint8Array(0);
  const encoded = new TextEncoder().encode(value);
  return concat(
    encodeTag(fieldNumber, 2),
    encodeVarint(encoded.length),
    encoded,
  );
}

/** Encode a bytes field */
function encodeBytesField(fieldNumber: number, value: Uint8Array): Uint8Array {
  if (!value || value.length === 0) return new Uint8Array(0);
  return concat(
    encodeTag(fieldNumber, 2),
    encodeVarint(value.length),
    value,
  );
}

/** Encode an embedded message field */
function encodeMessageField(fieldNumber: number, payload: Uint8Array): Uint8Array {
  if (payload.length === 0) return new Uint8Array(0);
  return concat(
    encodeTag(fieldNumber, 2),
    encodeVarint(payload.length),
    payload,
  );
}

/** Concatenate multiple Uint8Arrays */
function concat(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// ──────────────────────────────────────────────
// Content field numbers mapping (from flipper.proto oneof)
// ──────────────────────────────────────────────

const CONTENT_FIELD_NUMBERS: Record<string, number> = {
  empty: 4,
  stopSession: 19,
  // System
  systemPingRequest: 5,
  systemPingResponse: 6,
  systemRebootRequest: 31,
  systemDeviceInfoRequest: 7,
  systemDeviceInfoResponse: 8,
  systemGetDatetimeRequest: 35,
  systemGetDatetimeResponse: 36,
  systemPowerInfoRequest: 9,
  systemPowerInfoResponse: 10,
  systemProtobufVersionRequest: 39,
  systemProtobufVersionResponse: 40,
  // Storage
  storageInfoRequest: 28,
  storageInfoResponse: 29,
  storageListRequest: 24,
  storageListResponse: 25,
  storageReadRequest: 26,
  storageReadResponse: 27,
  storageWriteRequest: 30,
  storageDeleteRequest: 32,
  storageMkdirRequest: 33,
  storageStatRequest: 34,
  storageStatResponse: 37,
  // App
  appStartRequest: 16,
  appLockStatusRequest: 17,
  appLockStatusResponse: 18,
  appExitRequest: 47,
  appLoadFileRequest: 48,
  appButtonPressRequest: 49,
  appButtonReleaseRequest: 50,
  appButtonPressReleaseRequest: 75,
  appGetErrorRequest: 63,
  appGetErrorResponse: 64,
  appDataExchangeRequest: 65,
  // GUI
  guiStartScreenStreamRequest: 20,
  guiStopScreenStreamRequest: 22,
  guiScreenFrame: 23,
  // GPIO
  gpioSetPinModeRequest: 51,
  gpioWritePinRequest: 55,
  gpioReadPinRequest: 56,
  gpioReadPinResponse: 57,
};

// ──────────────────────────────────────────────
// Content message encoders
// ──────────────────────────────────────────────

function encodeContentPayload(content: PBContent): Uint8Array {
  switch (content.type) {
    case "empty":
    case "stopSession":
    case "systemDeviceInfoRequest":
    case "systemGetDatetimeRequest":
    case "systemPowerInfoRequest":
    case "systemProtobufVersionRequest":
    case "appLockStatusRequest":
    case "appExitRequest":
    case "appButtonReleaseRequest":
    case "appGetErrorRequest":
    case "guiStartScreenStreamRequest":
    case "guiStopScreenStreamRequest":
      // Empty message body
      return new Uint8Array(0);

    case "systemPingRequest":
    case "systemPingResponse":
      return content.data.data
        ? encodeBytesField(1, content.data.data)
        : new Uint8Array(0);

    case "systemRebootRequest": {
      const modeMap = { os: 0, dfu: 1, update: 2 };
      return encodeUint32Field(1, modeMap[content.data.mode]);
    }

    case "storageInfoRequest":
    case "storageStatRequest":
    case "storageReadRequest":
    case "storageMkdirRequest":
      return encodeStringField(1, content.data.path);

    case "storageListRequest":
      return encodeStringField(1, content.data.path);

    case "storageDeleteRequest":
      return concat(
        encodeStringField(1, content.data.path),
        encodeBoolField(2, content.data.recursive),
      );

    case "storageWriteRequest": {
      const filePayload = concat(
        encodeUint32Field(1, content.data.file.type),
        encodeStringField(2, content.data.file.name),
        encodeUint32Field(3, content.data.file.size),
        content.data.file.data
          ? encodeBytesField(4, content.data.file.data)
          : new Uint8Array(0),
      );
      return concat(
        encodeStringField(1, content.data.path),
        encodeMessageField(2, filePayload),
      );
    }

    case "appStartRequest":
      return concat(
        encodeStringField(1, content.data.name),
        content.data.args ? encodeStringField(2, content.data.args) : new Uint8Array(0),
      );

    case "appLoadFileRequest":
      return encodeStringField(1, content.data.path);

    case "appButtonPressRequest":
      return content.data.args
        ? encodeStringField(1, content.data.args)
        : new Uint8Array(0);

    case "appButtonPressReleaseRequest":
      return content.data.args
        ? encodeStringField(1, content.data.args)
        : new Uint8Array(0);

    case "appDataExchangeRequest":
      return encodeBytesField(1, content.data.data);

    case "gpioSetPinModeRequest":
      return concat(
        encodeUint32Field(1, content.data.pin),
        encodeUint32Field(2, content.data.mode),
      );

    case "gpioWritePinRequest":
      return concat(
        encodeUint32Field(1, content.data.pin),
        encodeUint32Field(2, content.data.value),
      );

    case "gpioReadPinRequest":
      return encodeUint32Field(1, content.data.pin);

    default:
      throw new Error(`Unknown content type: ${(content as PBContent).type}`);
  }
}

// ──────────────────────────────────────────────
// Main encoder
// ──────────────────────────────────────────────

/**
 * Encode a PB.Main message to a length-delimited protobuf buffer.
 * Output format: [varint length][protobuf payload]
 */
export function encodePBMain(msg: PBMain): Uint8Array {
  // Encode PB.Main fields
  const parts: Uint8Array[] = [];

  // Field 1: command_id (uint32)
  parts.push(encodeUint32Field(1, msg.commandId));

  // Field 2: command_status (enum / uint32)
  parts.push(encodeUint32Field(2, msg.commandStatus));

  // Field 3: has_next (bool)
  parts.push(encodeBoolField(3, msg.hasNext));

  // Content (oneof) — encoded as embedded message at the appropriate field number
  if (msg.content) {
    const fieldNumber = CONTENT_FIELD_NUMBERS[msg.content.type];
    if (fieldNumber === undefined) {
      throw new Error(`Unknown content type: ${msg.content.type}`);
    }
    const contentPayload = encodeContentPayload(msg.content);
    // Oneof content is an embedded message
    parts.push(encodeMessageField(fieldNumber, contentPayload));
  }

  // Concatenate all fields into the protobuf payload
  const payload = concat(...parts);

  // Prepend varint length (length-delimited framing)
  return concat(encodeVarint(payload.length), payload);
}

export { concat };
