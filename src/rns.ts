import { ens, crypto, BigInt } from "@graphprotocol/graph-ts"
import {
  NewOwner as NewOwnerEvent,
  Transfer as TransferEvent,
  NewResolver as NewResolverEvent,
  NewTTL as NewTTLEvent,
} from "./types/RNS/RNS"
import { NewOwner, Transfer, NewResolver, NewTTL, Domain, Account, Resolver } from "./types/schema"
import { BIG_INT_ZERO, checkValidLabel, createEventID, EMPTY_ADDRESS, EMPTY_ADDRESS_BYTEARRAY, ROOT_NODE } from "./utils";

function recurseDomainDelete(domain: Domain): string | null {
  if (
    (domain.resolver == null ||
      domain.resolver!.split("-")[0] == EMPTY_ADDRESS) &&
    domain.owner == EMPTY_ADDRESS &&
    domain.subdomainCount == 0
  ) {
    const parentDomain = Domain.load(domain.parent!);
    if (parentDomain != null) {
      parentDomain.subdomainCount = parentDomain.subdomainCount - 1;
      parentDomain.save();
      return recurseDomainDelete(parentDomain);
    }

    return null;
  }

  return domain.id;
}

function saveDomain(domain: Domain): void {  
  recurseDomainDelete(domain);
  domain.save();
}

function makeSubnode(event: NewOwnerEvent): string {
  return crypto
    .keccak256(event.params.node.concat(event.params.label))
    .toHexString();
}

function createDomain(node: string, timestamp: BigInt): Domain {
  let domain = new Domain(node);
  if (node == ROOT_NODE) {
    domain = new Domain(node);
    domain.owner = EMPTY_ADDRESS;    
    domain.createdAt = timestamp;
    domain.subdomainCount = 0;
  }
  return domain;
}

function getDomain(
  node: string,
  timestamp: BigInt = BIG_INT_ZERO
): Domain | null {
  let domain = Domain.load(node);
  if (domain == null && node == ROOT_NODE) {
    return createDomain(node, timestamp);
  } else {
    return domain;
  }
}

export function handleNewOwner(event: NewOwnerEvent): void {
  let account = new Account(event.params.ownerAddress.toHex())
  account.save();

  let subnode = makeSubnode(event);
  let domain = getDomain(subnode, event.block.timestamp);
  let parent = getDomain(event.params.node.toHexString());

  if (domain == null) {
    domain = new Domain(subnode);
    domain.createdAt = event.block.timestamp;    
    domain.subdomainCount = 0;
  }

  if (domain.parent == null && parent != null) {
    parent.subdomainCount = parent.subdomainCount + 1;
    parent.save();
  }

  if (domain.name == null) {
    // Get label and node names
    let label = ens.nameByHash(event.params.label.toHexString());
    if (checkValidLabel(label)) {
      domain.labelName = label;
    } else {
      label = "[" + event.params.label.toHexString().slice(2) + "]";
    }
    if (
      event.params.node.toHexString() ==
      "0x0000000000000000000000000000000000000000000000000000000000000000"
    ) {
      domain.name = label;
    } else {
      parent = parent!;
      let name = parent.name;
      if (label && name) {
        domain.name = label + "." + name;
      }
    }
  }

  domain.owner = account.id;
  domain.labelhash = event.params.label;
  saveDomain(domain);

  let domainEvent = new NewOwner(createEventID(event));
  domainEvent.blockNumber = event.block.number.toI32();
  domainEvent.transactionID = event.transaction.hash;
  domainEvent.parentDomain = event.params.node.toHexString();
  domainEvent.domain = subnode;
  domainEvent.owner = event.params.ownerAddress.toHexString();
  domainEvent.save(); 
}

export function handleTransfer(event: TransferEvent): void {
  let node = event.params.node.toHexString();
  
  let account = new Account(event.params.ownerAddress.toHexString());
  account.save();

  // Update the domain owner
  let domain = getDomain(node)!;

  domain.owner = event.params.ownerAddress.toHexString();
  saveDomain(domain);

  let domainEvent = new Transfer(createEventID(event));
  domainEvent.blockNumber = event.block.number.toI32();
  domainEvent.transactionID = event.transaction.hash;
  domainEvent.domain = node;
  domainEvent.owner = event.params.ownerAddress.toHexString();
  domainEvent.save();
}

export function handleNewResolver(event: NewResolverEvent): void {
  let id: string | null;

  // if resolver is set to 0x0, set id to null
  // we don't want to create a resolver entity for 0x0
  if (event.params.resolverAddress.equals(EMPTY_ADDRESS_BYTEARRAY)) {
    id = null;
  } else {
    id = event.params.resolverAddress
      .toHexString()
      .concat("-")
      .concat(event.params.node.toHexString());
  }

  let node = event.params.node.toHexString();
  let domain = getDomain(node)!;
  domain.resolver = id;

  if (id) {
    let resolver = Resolver.load(id);
    if (resolver == null) {
      resolver = new Resolver(id);
      resolver.domain = event.params.node.toHexString();
      resolver.address = event.params.resolverAddress;
      resolver.save();
      // since this is a new resolver entity, there can't be a resolved address yet so set to null
      domain.resolvedAddress = null;
    } else {
      domain.resolvedAddress = resolver.addr;
    }
  } else {
    domain.resolvedAddress = null;
  }
  saveDomain(domain);
 
  // Workaround for duplicate event issue
  let domainEvent = new NewResolver(createEventID(event).concat("R"));
  domainEvent.blockNumber = event.block.number.toI32();
  domainEvent.transactionID = event.transaction.hash;
  domainEvent.domain = node;
  domainEvent.resolver = id ? id : EMPTY_ADDRESS;
  domainEvent.save();
}

export function handleNewTTL(event: NewTTLEvent): void {
  let node = event.params.node.toHexString();
  let domain = getDomain(node);
  // For the edge case that a domain's owner and resolver are set to empty
  // in the same transaction as setting TTL
  if (domain) {
    domain.ttl = event.params.ttlValue;
    domain.save();
  }

  let domainEvent = new NewTTL(createEventID(event));
  domainEvent.blockNumber = event.block.number.toI32();
  domainEvent.transactionID = event.transaction.hash;
  domainEvent.domain = node;
  domainEvent.ttl = event.params.ttlValue;
  domainEvent.save();
}
