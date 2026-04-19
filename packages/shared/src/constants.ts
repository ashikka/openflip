/**
 * Flipper Zero BLE Service and Characteristic UUIDs.
 *
 * The Flipper exposes a custom serial service over BLE.
 * - Write commands to RX characteristic
 * - Subscribe to TX characteristic for responses
 * - Monitor Flow Control characteristic for buffer availability
 */
export const FLIPPER_BLE = {
  /** Primary serial service UUID */
  SERIAL_SERVICE_UUID: "8fe5b3d5-2e7f-4a98-2a48-7acc60fe0000",
  /** Write commands to this characteristic (phone → Flipper) */
  RX_CHARACTERISTIC_UUID: "19ed82ae-ed21-4c9d-4145-228e62fe0000",
  /** Subscribe for responses from this characteristic (Flipper → phone) */
  TX_CHARACTERISTIC_UUID: "19ed82ae-ed21-4c9d-4145-228e61fe0000",
  /** Flow control: read to get available buffer space before writing */
  FLOW_CONTROL_UUID: "19ed82ae-ed21-4c9d-4145-228e63fe0000",
  /** RPC status characteristic */
  RPC_STATUS_UUID: "19ed82ae-ed21-4c9d-4145-228e64fe0000",
} as const;

/**
 * Flipper Zero file system paths
 */
export const FLIPPER_PATHS = {
  /** External SD card root */
  EXT_ROOT: "/ext",
  /** Internal storage root */
  INT_ROOT: "/int",
  /** FAP applications directory */
  APPS_DIR: "/ext/apps",
  /** Sub-GHz signal files */
  SUBGHZ_DIR: "/ext/subghz",
  /** NFC data files */
  NFC_DIR: "/ext/nfc",
  /** RFID data files */
  RFID_DIR: "/ext/lfrfid",
  /** Infrared signal files */
  IR_DIR: "/ext/infrared",
  /** BadUSB script files */
  BADUSB_DIR: "/ext/badusb",
  /** iButton data files */
  IBUTTON_DIR: "/ext/ibutton",
} as const;

/**
 * Maximum BLE MTU the Flipper supports.
 * We request this during connection, actual negotiated value may differ.
 */
export const FLIPPER_MAX_MTU = 512;

/**
 * Flipper's actual usable MTU (from firmware logs: "Rx MTU size: 414")
 */
export const FLIPPER_EFFECTIVE_MTU = 414;

/**
 * RPC session start command sent as ASCII before entering protobuf mode
 */
export const RPC_SESSION_START_CMD = "start_rpc_session\r";

/**
 * CLI prompt the Flipper sends when connected (must be drained before RPC)
 */
export const FLIPPER_CLI_PROMPT = ">: ";

/**
 * Max chunk size for storage write operations
 */
export const STORAGE_WRITE_CHUNK_SIZE = 1024;
