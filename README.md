# RNS Subgraph

This Subgraph sources events from the RNS contracts. It indexes on-chain events of second-level .rsk names. It allows us to build a reasonable approximation of the RNS names an address owns.

Check the subgraph [here](https://thegraph.com/explorer/subgraphs/DhBgWdhFsujyqFmYqaTwUyyYm5QWBEhqVnBHek9JYPkn?view=About&chain=arbitrum-one)

## Example Queries

Retrieve the list of active domains

```graphql
{
  domains(where: {resolvedAddress_not: "null", expiryDate_not: "0"}) {
    name
    resolvedAddress {
      id
    }
    expiryDate
  }
}
```

```
{
  "data": {
    "domains": [
      {
        "name": "compound.rsk",
        "resolvedAddress": {
          "id": "0x0cfc4f6070819148c82087ec9fc1872f0455d7c2"
        },
        "expiryDate": "1842291486"
      },
      {
        "name": "crypto.rsk",
        "resolvedAddress": {
          "id": "0x135601c736ddb4c58a4b8fd3cd9f66df244d28aa"
        },
        "expiryDate": "1813542715"
      },
      {
        "name": "liverpoolfc.rsk",
        "resolvedAddress": {
          "id": "0xb0553199188d4696b1dedf008d906a6d02955d88"
        },
        "expiryDate": "2024956688"
      },
    ...
    ]
  }
}
```

Filter domians by account

```
{
 
    domains(where: {resolvedAddress: "ADD_ADDRESS_HERE"}) {
      resolvedAddress {
        id
      }
      name
      expiryDate
  }
}
```

Retrive domain information

```
{
  domains(where: {name: "ADD_HERE_DOMAIN"}) {
    resolvedAddress {
      id
    }
    name
    expiryDate
    labelName
    labelhash
    resolver {
      address
      coinTypes
      events {
        id
      }
    }
  }
}
```

## General considerations
The subgraph uses a mapping function from label hash to string. It has a dictionary of known values. If a hash is not found in the dictionary, the hash itself is returned. This is why unresolved hashes may appear instead of names.
When searching by address, it must be in lowercase.

## Tests
This subgraph uses the Matchstick framework to test mapping logic. In this project, we run Matchstick in a Docker container. For more details on creating unit tests in a subgraph project, refer to [this guide](https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/).

## RNS
RNS provides an architecture which enables the identification of blockchain addresses by human-readable names.
For more information go [here](https://dev.rootstock.io/concepts/rif-suite/rns/)

