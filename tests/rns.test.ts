import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, Address, BigInt } from "@graphprotocol/graph-ts"
import { NewOwner } from "../generated/schema"
import { NewOwner as NewOwnerEvent } from "../generated/RNS/RNS"
import { handleNewOwner } from "../src/rns"
import { createNewOwnerEvent } from "./rns-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("NewOwner created and stored", () => {
    //TODO: Implement test
  })
})
