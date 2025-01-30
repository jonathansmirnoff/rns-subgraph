import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
import { ABIChanged as ABIChangedEvent } from "../generated/ResolverV1/ResolverV1"
import { handleABIChanged } from "../src/resolver-v-1"
import { createABIChangedEvent } from "./resolver-v-1-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    //TODO: Implement beforeAll
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ABIChanged created and stored", () => {
   //TODO: Implement test
  })
})
