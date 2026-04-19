/**
 * GPIO commands: set pin mode, read, write.
 */

import type { RpcClient } from "./rpc-client.js";
import { GpioPin, GpioPinMode } from "../proto/types.js";

export { GpioPin, GpioPinMode };

/**
 * Set a GPIO pin's mode (input, output push-pull, output open-drain, analog).
 */
export async function gpioSetPinMode(
  rpc: RpcClient,
  pin: GpioPin,
  mode: GpioPinMode,
): Promise<void> {
  await rpc.sendSingle({
    type: "gpioSetPinModeRequest",
    data: { pin, mode },
  });
}

/**
 * Write a digital value to a GPIO pin.
 * Pin must be configured as output first.
 */
export async function gpioWritePin(
  rpc: RpcClient,
  pin: GpioPin,
  value: 0 | 1,
): Promise<void> {
  await rpc.sendSingle({
    type: "gpioWritePinRequest",
    data: { pin, value },
  });
}

/**
 * Read the current value of a GPIO pin.
 */
export async function gpioReadPin(
  rpc: RpcClient,
  pin: GpioPin,
): Promise<number> {
  const response = await rpc.sendSingle({
    type: "gpioReadPinRequest",
    data: { pin },
  });
  if (response.content?.type === "gpioReadPinResponse") {
    return response.content.data.value;
  }
  throw new Error("Unexpected response type for GPIO read");
}
