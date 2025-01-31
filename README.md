# RNS Subgraph

This Subgraph sources events from the RNS contracts.

# Example Quiery

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