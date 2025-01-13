import { newMockEvent } from "matchstick-as"
import { ethereum, Bytes, Address, BigInt } from "@graphprotocol/graph-ts"
import { NewOwner, Transfer, NewResolver, NewTTL } from "../generated/RNS/RNS"

export function createNewOwnerEvent(
  node: Bytes,
  label: Bytes,
  ownerAddress: Address
): NewOwner {
  let newOwnerEvent = changetype<NewOwner>(newMockEvent())

  newOwnerEvent.parameters = new Array()

  newOwnerEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  newOwnerEvent.parameters.push(
    new ethereum.EventParam("label", ethereum.Value.fromFixedBytes(label))
  )
  newOwnerEvent.parameters.push(
    new ethereum.EventParam(
      "ownerAddress",
      ethereum.Value.fromAddress(ownerAddress)
    )
  )

  return newOwnerEvent
}

export function createTransferEvent(
  node: Bytes,
  ownerAddress: Address
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "ownerAddress",
      ethereum.Value.fromAddress(ownerAddress)
    )
  )

  return transferEvent
}

export function createNewResolverEvent(
  node: Bytes,
  resolverAddress: Address
): NewResolver {
  let newResolverEvent = changetype<NewResolver>(newMockEvent())

  newResolverEvent.parameters = new Array()

  newResolverEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  newResolverEvent.parameters.push(
    new ethereum.EventParam(
      "resolverAddress",
      ethereum.Value.fromAddress(resolverAddress)
    )
  )

  return newResolverEvent
}

export function createNewTTLEvent(node: Bytes, ttlValue: BigInt): NewTTL {
  let newTtlEvent = changetype<NewTTL>(newMockEvent())

  newTtlEvent.parameters = new Array()

  newTtlEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  newTtlEvent.parameters.push(
    new ethereum.EventParam(
      "ttlValue",
      ethereum.Value.fromUnsignedBigInt(ttlValue)
    )
  )

  return newTtlEvent
}
