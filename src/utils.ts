import { BigInt, ByteArray, ethereum, log } from "@graphprotocol/graph-ts";

export const RSK_NODE =
  "0x0cd5c10192478cd220936e91293afc15e3f6de4d419de5de7506b679cbdd8ec4";
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

export function byteArrayFromHex(s: string): ByteArray {
    if (s.length % 2 !== 0) {
      throw new TypeError("Hex string must have an even number of characters");
    }
    let out = new Uint8Array(s.length / 2);
    for (var i = 0; i < s.length; i += 2) {
      out[i / 2] = parseInt(s.substring(i, i + 2), 16) as u32;
    }
    return changetype<ByteArray>(out);
  }
  
export function uint256ToByteArray(i: BigInt): ByteArray {
let hex = i.toHex().slice(2).padStart(64, "0");
return byteArrayFromHex(hex);
}

  // Helper for concatenating two byte arrays
export function concat(a: ByteArray, b: ByteArray): ByteArray {
    let out = new Uint8Array(a.length + b.length);
    for (let i = 0; i < a.length; i++) {
      out[i] = a[i];
    }
    for (let j = 0; j < b.length; j++) {
      out[a.length + j] = b[j];
    }
    // return out as ByteArray
    return changetype<ByteArray>(out);
}
