import { BigInt, ByteArray, ethereum, log } from "@graphprotocol/graph-ts";

export const ROOT_NODE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";
export const EMPTY_ADDRESS_BYTEARRAY = new ByteArray(20);

export const BIG_INT_ZERO = BigInt.fromI32(0);

export function createEventID(event: ethereum.Event): string {
    return event.block.number
      .toString()
      .concat("-")
      .concat(event.logIndex.toString());
}

export function checkValidLabel(name: string | null): boolean {
    if (name == null) {
      return false;
    }
    // for compiler
    name = name!;
    for (let i = 0; i < name.length; i++) {
      let charCode = name.charCodeAt(i);
      if (charCode === 0) {
        // 0 = null byte
        log.warning("Invalid label '{}' contained null byte. Skipping.", [name]);
        return false;
      } else if (charCode === 46) {
        // 46 = .
        log.warning(
          "Invalid label '{}' contained separator char '.'. Skipping.",
          [name]
        );
        return false;
      } else if (charCode === 91) {
        // 91 = [
        log.warning("Invalid label '{}' contained char '['. Skipping.", [name]);
        return false;
      } else if (charCode === 93) {
        // 93 = ]
        log.warning("Invalid label '{}' contained char ']'. Skipping.", [name]);
        return false;
      }
    }
  
    return true;
  }
