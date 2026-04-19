/**
 * Protobuf decoder for Flipper Zero RPC protocol.
 *
 * Decodes length-delimited PB.Main messages from the Flipper.
 * Handles fragmented BLE data (messages may arrive across multiple
 * BLE notifications) via the DecoderBuffer class.
 */

import { decodeVarint } from "./encoder.js";
import type {
  PBMain,
  PBContent,
  PBStorageFile,
  PBStorageListResponse,
  PBSystemDeviceInfoResponse,
  PBSystemPowerInfoResponse,
  PBGuiScreenFrame,
} from "./types.js";

// ──────────────────────────────────────────────
// Low-level protobuf field decoding
// ──────────────────────────────────────────────

interface ProtoField {
  fieldNumber: number;
  wireType: number;
  value: number | Uint8Array;
}

/** Parse all protobuf fields from a message payload */
function parseFields(buf: Uint8Array): ProtoField[] {
  const fields: ProtoField[] = [];
  let offset = 0;

  while (offset < buf.length) {
    const [tag, tagBytes] = decodeVarint(buf, offset);
    offset += tagBytes;

    const fieldNumber = tag >>> 3;
    const wireType = tag & 0x07;

    if (wireType === 0) {
      // Varint
      const [value, valueBytes] = decodeVarint(buf, offset);
      offset += valueBytes;
      fields.push({ fieldNumber, wireType, value });
    } else if (wireType === 2) {
      // Length-delimited
      const [length, lengthBytes] = decodeVarint(buf, offset);
      offset += lengthBytes;
      const value = buf.slice(offset, offset + length);
      offset += length;
      fields.push({ fieldNumber, wireType, value });
    } else if (wireType === 5) {
      // 32-bit fixed
      const value =
        buf[offset] |
        (buf[offset + 1] << 8) |
        (buf[offset + 2] << 16) |
        (buf[offset + 3] << 24);
      offset += 4;
      fields.push({ fieldNumber, wireType, value: value >>> 0 });
    } else {
      // Skip unknown wire types
      break;
    }
  }

  return fields;
}

/** Get a varint field value, defaulting to 0 */
function getVarint(fields: ProtoField[], fieldNumber: number): number {
  const field = fields.find(
    (f) => f.fieldNumber === fieldNumber && f.wireType === 0,
  );
  return typeof field?.value === "number" ? field.value : 0;
}

/** Get a length-delimited field as bytes */
function getBytes(
  fields: ProtoField[],
  fieldNumber: number,
): Uint8Array | undefined {
  const field = fields.find(
    (f) => f.fieldNumber === fieldNumber && f.wireType === 2,
  );
  return field?.value instanceof Uint8Array ? field.value : undefined;
}

/** Get a length-delimited field as string */
function getString(fields: ProtoField[], fieldNumber: number): string {
  const bytes = getBytes(fields, fieldNumber);
  return bytes ? new TextDecoder().decode(bytes) : "";
}

/** Get a bool field */
function getBool(fields: ProtoField[], fieldNumber: number): boolean {
  return getVarint(fields, fieldNumber) !== 0;
}

// ──────────────────────────────────────────────
// Content field number → type mapping (reverse of encoder)
// ──────────────────────────────────────────────

const FIELD_TO_CONTENT_TYPE: Record<number, string> = {
  4: "empty",
  19: "stopSession",
  5: "systemPingRequest",
  6: "systemPingResponse",
  7: "systemDeviceInfoRequest",
  8: "systemDeviceInfoResponse",
  9: "systemPowerInfoRequest",
  10: "systemPowerInfoResponse",
  16: "appStartRequest",
  17: "appLockStatusRequest",
  18: "appLockStatusResponse",
  20: "guiStartScreenStreamRequest",
  22: "guiStopScreenStreamRequest",
  23: "guiScreenFrame",
  24: "storageListRequest",
  25: "storageListResponse",
  26: "storageReadRequest",
  27: "storageReadResponse",
  28: "storageInfoRequest",
  29: "storageInfoResponse",
  30: "storageWriteRequest",
  31: "systemRebootRequest",
  32: "storageDeleteRequest",
  33: "storageMkdirRequest",
  34: "storageStatRequest",
  35: "systemGetDatetimeRequest",
  36: "systemGetDatetimeResponse",
  37: "storageStatResponse",
  39: "systemProtobufVersionRequest",
  40: "systemProtobufVersionResponse",
  47: "appExitRequest",
  48: "appLoadFileRequest",
  49: "appButtonPressRequest",
  50: "appButtonReleaseRequest",
  51: "gpioSetPinModeRequest",
  55: "gpioWritePinRequest",
  56: "gpioReadPinRequest",
  57: "gpioReadPinResponse",
  63: "appGetErrorRequest",
  64: "appGetErrorResponse",
  65: "appDataExchangeRequest",
  75: "appButtonPressReleaseRequest",
};

// ──────────────────────────────────────────────
// Content decoders
// ──────────────────────────────────────────────

function decodeStorageFile(buf: Uint8Array): PBStorageFile {
  const fields = parseFields(buf);
  return {
    type: getVarint(fields, 1),
    name: getString(fields, 2),
    size: getVarint(fields, 3),
    data: getBytes(fields, 4),
  };
}

function decodeContent(
  contentType: string,
  payload: Uint8Array,
): PBContent | undefined {
  const fields = parseFields(payload);

  switch (contentType) {
    case "empty":
      return { type: "empty" };

    case "stopSession":
      return { type: "stopSession" };

    case "systemPingResponse":
      return {
        type: "systemPingResponse",
        data: { data: getBytes(fields, 1) },
      };

    case "systemDeviceInfoResponse":
      return {
        type: "systemDeviceInfoResponse",
        data: {
          key: getString(fields, 1),
          value: getString(fields, 2),
        } as PBSystemDeviceInfoResponse,
      };

    case "systemGetDatetimeResponse":
      return {
        type: "systemGetDatetimeResponse",
        data: {
          hour: getVarint(fields, 1),
          minute: getVarint(fields, 2),
          second: getVarint(fields, 3),
          day: getVarint(fields, 4),
          month: getVarint(fields, 5),
          year: getVarint(fields, 6),
          weekday: getVarint(fields, 7),
        },
      };

    case "systemPowerInfoResponse":
      return {
        type: "systemPowerInfoResponse",
        data: {
          key: getString(fields, 1),
          value: getString(fields, 2),
        } as PBSystemPowerInfoResponse,
      };

    case "systemProtobufVersionResponse":
      return {
        type: "systemProtobufVersionResponse",
        data: {
          major: getVarint(fields, 1),
          minor: getVarint(fields, 2),
        },
      };

    case "storageInfoResponse":
      return {
        type: "storageInfoResponse",
        data: {
          totalSpace: getVarint(fields, 1),
          freeSpace: getVarint(fields, 2),
        },
      };

    case "storageListResponse": {
      // Multiple file entries can appear as repeated field 1
      const files: PBStorageFile[] = [];
      for (const f of fields) {
        if (f.fieldNumber === 1 && f.value instanceof Uint8Array) {
          files.push(decodeStorageFile(f.value));
        }
      }
      return {
        type: "storageListResponse",
        data: { file: files } as PBStorageListResponse,
      };
    }

    case "storageReadResponse": {
      const fileBytes = getBytes(fields, 1);
      return {
        type: "storageReadResponse",
        data: {
          file: fileBytes
            ? decodeStorageFile(fileBytes)
            : { type: 0, name: "", size: 0 },
        },
      };
    }

    case "storageStatResponse": {
      const statFileBytes = getBytes(fields, 1);
      return {
        type: "storageStatResponse",
        data: {
          file: statFileBytes
            ? decodeStorageFile(statFileBytes)
            : { type: 0, name: "", size: 0 },
        },
      };
    }

    case "appLockStatusResponse":
      return {
        type: "appLockStatusResponse",
        data: { locked: getBool(fields, 1) },
      };

    case "appGetErrorResponse":
      return {
        type: "appGetErrorResponse",
        data: {
          code: getVarint(fields, 1),
          text: getString(fields, 2),
        },
      };

    case "guiScreenFrame":
      return {
        type: "guiScreenFrame",
        data: {
          data: getBytes(fields, 1) ?? new Uint8Array(0),
          orientation: getVarint(fields, 2),
        } as PBGuiScreenFrame,
      };

    case "gpioReadPinResponse":
      return {
        type: "gpioReadPinResponse",
        data: { value: getVarint(fields, 1) },
      };

    default:
      // For request-type messages we receive back, just return the type
      return { type: contentType } as PBContent;
  }
}

// ──────────────────────────────────────────────
// Main decoder
// ──────────────────────────────────────────────

/**
 * Decode a single PB.Main protobuf payload (without the length prefix).
 */
export function decodePBMain(payload: Uint8Array): PBMain {
  const fields = parseFields(payload);

  const commandId = getVarint(fields, 1);
  const commandStatus = getVarint(fields, 2);
  const hasNext = getBool(fields, 3);

  // Find the content field (any field number >= 4 that is length-delimited)
  let content: PBContent | undefined;
  for (const field of fields) {
    if (field.fieldNumber >= 4) {
      const contentType = FIELD_TO_CONTENT_TYPE[field.fieldNumber];
      if (contentType) {
        const contentPayload =
          field.value instanceof Uint8Array
            ? field.value
            : new Uint8Array(0);
        content = decodeContent(contentType, contentPayload);
        break;
      }
    }
  }

  return { commandId, commandStatus, hasNext, content };
}

// ──────────────────────────────────────────────
// Decoder buffer for fragmented BLE data
// ──────────────────────────────────────────────

/**
 * Accumulates BLE notification chunks and yields complete PB.Main messages.
 *
 * BLE notifications are limited in size (MTU - 3 bytes for ATT header).
 * A single protobuf message may span multiple notifications. This buffer
 * accumulates data and extracts complete messages as they become available.
 */
export class DecoderBuffer {
  private buffer = new Uint8Array(0);

  /** Append incoming BLE data */
  push(data: Uint8Array): void {
    const newBuf = new Uint8Array(this.buffer.length + data.length);
    newBuf.set(this.buffer);
    newBuf.set(data, this.buffer.length);
    this.buffer = newBuf;
  }

  /**
   * Try to extract complete PB.Main messages from the buffer.
   * Returns all complete messages found, leaving any partial data in the buffer.
   */
  drain(): PBMain[] {
    const messages: PBMain[] = [];

    while (this.buffer.length > 0) {
      try {
        // Try to read the length varint
        const [msgLength, lengthBytes] = decodeVarint(this.buffer, 0);

        // Check if we have the complete message
        if (this.buffer.length < lengthBytes + msgLength) {
          break; // Need more data
        }

        // Extract and decode the message
        const payload = this.buffer.slice(
          lengthBytes,
          lengthBytes + msgLength,
        );
        const message = decodePBMain(payload);
        messages.push(message);

        // Remove the consumed bytes from the buffer
        this.buffer = this.buffer.slice(lengthBytes + msgLength);
      } catch {
        // If we can't parse the varint, we need more data
        break;
      }
    }

    return messages;
  }

  /** Reset the buffer */
  clear(): void {
    this.buffer = new Uint8Array(0);
  }

  /** Current buffer size */
  get size(): number {
    return this.buffer.length;
  }
}
