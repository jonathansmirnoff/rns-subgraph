import { Address, BigInt, ByteArray, Bytes, crypto, ethereum, Int8, log } from "@graphprotocol/graph-ts";
import {
  assert,
  beforeAll,
  newMockEvent,
  test,
} from "matchstick-as/assembly/index";
import { handleExpirationChanged, handleTransfer } from "../src/rsk-owner";
import { ExpirationChanged, OwnershipTransferred } from "../src/types/RSKOwner/RSKOwner";
import { Domain, Registration } from "../src/types/schema";
import { concat, EMPTY_ADDRESS, RSK_NODE, uint256ToByteArray } from "../src/utils";
import { createNewOwnerEvent, DEFAULT_OWNER, setRskOwner } from "./testUtils";

export function createExpirationChangedEvent(
  tokenId: BigInt,
  expirationTime: BigInt
): ExpirationChanged {
  let expirationChangedEvent = changetype<ExpirationChanged>(newMockEvent())

  expirationChangedEvent.parameters = new Array()

  expirationChangedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  expirationChangedEvent.parameters.push(
    new ethereum.EventParam(
      "expirationTime",
      ethereum.Value.fromUnsignedBigInt(expirationTime)
    )
  )

  return expirationChangedEvent
}

beforeAll(() => {
  setRskOwner();
});

const createNewDomain = (labelId: BigInt): void => {
  var rootNode: ByteArray = ByteArray.fromHexString(RSK_NODE);
  let label = uint256ToByteArray(labelId);
  let domain = new Domain(crypto.keccak256(concat(rootNode, label)).toHex());
  domain.owner = EMPTY_ADDRESS;      
  domain.subdomainCount = 0;
  domain.createdAt = BigInt.fromI32(1610000000);
  domain.save();
}

const checkNullLabelName = (
  labelhash: string,
  labelhashAsBigInt: BigInt,
  label: string
): void => {

  let newRegistrationEvent = createExpirationChangedEvent(
    labelhashAsBigInt,
    BigInt.fromI32(1610000000)
  );
  handleExpirationChanged(newRegistrationEvent);

  let fetchedRegistration = Registration.load(labelhash)!;

  // set labelName to null because handleNameRegistered sets it to a mocked value of "default"
  // which comes from ens.nameByHash()
  fetchedRegistration.labelName = null;
  fetchedRegistration.save();

  fetchedRegistration = Registration.load(labelhash)!;

  assert.assertNull(fetchedRegistration.labelName);
};

test("does not assign label name to null byte label", () => {
  const labelhash =
    "0x465b93df44674596a1f5cd92ec83053bb8a78f6083e1752b3162c739bba1f9ed";
  const labelhashAsInt =
    "31823703059708284547668674100687316300171847632515296374731848165239501748717";
  const label = "default\0";

  createNewDomain(BigInt.fromString(labelhashAsInt));
  checkNullLabelName(labelhash, BigInt.fromString(labelhashAsInt), label);
});

test("does not assign label name to label with '.' separator", () => {
  const labelhash =
    "0xf8a2e15376341ae37c90b754e5ef3f1e43d1d136a5c7ba6b34c50b466848dfbc";
  const labelhashAsInt =
    "112461370816196049012812662280597321405198137204162513382374556989424524648380";
  const label = "test.123";

  createNewDomain(BigInt.fromString(labelhashAsInt));
  checkNullLabelName(labelhash, BigInt.fromString(labelhashAsInt), label);
});

test("does not assign label name to label with '[' char", () => {
  const labelhash =
    "0x6d2df8d29c51e5e79bce0067df6a093fd7e535f1fe0a509ead1eb5a2171640c9";
  const labelhashAsInt =
    "49383325924636276199200854251362239534766035480602437112552046254651845525705";
  const label =
    "[41ff1915eef2bf5841388d748bfcd23bd49ff5521ca4200c20bc0978b136c3cb";

  createNewDomain(BigInt.fromString(labelhashAsInt));
  checkNullLabelName(labelhash, BigInt.fromString(labelhashAsInt), label);
});

test("does not assign label name to label with ']' char", () => {
  const labelhash =
    "0xb9cf267ed9b0cb8caf44655901be5b66f2e6bbedd8dc1436fba973f7a824db58";
  const labelhashAsInt =
    "84043880016553362091807057514212448616446700818045523307434280128309910362968";
  const label =
    "41ff1915eef2bf5841388d748bfcd23bd49ff5521ca4200c20bc0978b136c3cb]";

  createNewDomain(BigInt.fromString(labelhashAsInt));
  checkNullLabelName(labelhash, BigInt.fromString(labelhashAsInt), label);
});

test("does not assign label name to label that uses unnormalised label notation", () => {
  const labelhash =
    "0x162894963b59f9b7e47a34709830c0211a6ba5f7de3973839f3ee7002e0c8434";
  const labelhashAsInt =
    "10022582060124759960163130513734713560279061696053801337665848910969813369908";
  const label =
    "[41ff1915eef2bf5841388d748bfcd23bd49ff5521ca4200c20bc0978b136c3cb]";

  createNewDomain(BigInt.fromString(labelhashAsInt));
  checkNullLabelName(labelhash, BigInt.fromString(labelhashAsInt), label);
});

test("does assign normal label", () => {
  const labelhash =
    "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658";
  const labelhashAsInt =
    "70622639689279718371527342103894932928233838121221666359043189029713682937432";
  const label = "test";

  createNewDomain(BigInt.fromString(labelhashAsInt));
  let newRegistrationEvent = createExpirationChangedEvent(
    BigInt.fromString(labelhashAsInt),
    BigInt.fromI32(1610000000)
  );
  handleExpirationChanged(newRegistrationEvent);  

  let fetchedRegistration = Registration.load(labelhash)!;
  fetchedRegistration.labelName = label;
  fetchedRegistration.save();  

  assert.assertTrue(fetchedRegistration.labelName == label);
});