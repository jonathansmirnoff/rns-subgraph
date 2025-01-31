import { ByteArray, crypto, ens, log } from "@graphprotocol/graph-ts";
import {
  Approval as ApprovalEvent,
  ApprovalForAll as ApprovalForAllEvent,
  ExpirationChanged as ExpirationChangedEvent,
  OwnershipTransferred as OwnershipTransferredEvent,
  Transfer as TransferEvent,
} from "./types/RSKOwner/RSKOwner"
import {  
  Account,
  Domain,  
  NameRegistered,  
  NameTransferred,  
  Registration,  
  Transfer,
} from "./types/schema"
import { checkValidLabel, concat, createEventID, RSK_NODE, uint256ToByteArray } from "./utils";

var rootNode: ByteArray = ByteArray.fromHexString(RSK_NODE);

export function handleExpirationChanged(event: ExpirationChangedEvent): void {
  let label = uint256ToByteArray(event.params.tokenId);  
  let domain = Domain.load(crypto.keccak256(concat(rootNode, label)).toHex());
  
  // Workaround for the case when the domain is not found
  if (domain == null) return ;

  let registration = new Registration(label.toHex());

  registration.domain = domain.id;
  registration.registrationDate = event.block.timestamp;
  registration.expiryDate = event.params.expirationTime;
  registration.registrant = domain.owner;
  
  domain.expiryDate = event.params.expirationTime;

  
  let labelName = ens.nameByHash(label.toHexString());
  if (checkValidLabel(labelName)) {
    domain.labelName = labelName;
    domain.name = labelName! + ".rsk";
    registration.labelName = labelName;
  }
  domain.save();
  registration.save();

  //log.info("Expiration changed for domain: {}", []);

  let registrationEvent = new NameRegistered(createEventID(event));
  registrationEvent.registration = registration.id;
  registrationEvent.blockNumber = event.block.number.toI32();
  registrationEvent.transactionID = event.transaction.hash;  
  registrationEvent.expiryDate = event.params.expirationTime;
  registrationEvent.registrant = domain.owner;
  registrationEvent.save();
}

export function handleTransfer(event: TransferEvent): void {
  let account = new Account(event.params.to.toHex());
  account.save();

  let label = uint256ToByteArray(event.params.tokenId);
  let registration = Registration.load(label.toHex());
  if (registration == null) return;

  let domain = Domain.load(crypto.keccak256(concat(rootNode, label)).toHex())!;

  registration.registrant = account.id;
  domain.registrant = account.id;

  domain.save();
  registration.save();

  let transferEvent = new NameTransferred(createEventID(event));
  transferEvent.registration = label.toHex();
  transferEvent.blockNumber = event.block.number.toI32();
  transferEvent.transactionID = event.transaction.hash;
  transferEvent.newOwner = account.id;
  transferEvent.save();
}
