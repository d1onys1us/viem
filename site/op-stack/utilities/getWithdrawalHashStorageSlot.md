---
head:
  - - meta
    - property: og:title
      content: getWithdrawalHashStorageSlot
  - - meta
    - name: description
      content: Computes the withdrawal hash storage slot to be used when proving a withdrawal.
  - - meta
    - property: og:description
      content: Computes the withdrawal hash storage slot to be used when proving a withdrawal.

---

# getWithdrawalHashStorageSlot

Computes the withdrawal hash storage slot to be used when proving a withdrawal.

## Import

```ts
import { getWithdrawalHashStorageSlot } from 'viem/op-stack'
```

## Usage

```ts
import { getWithdrawalHashStorageSlot } from 'viem/op-stack'

const slot = getWithdrawalHashStorageSlot({ // [!code hl]
  withdrawalHash: '0xB1C3824DEF40047847145E069BF467AA67E906611B9F5EF31515338DB0AABFA2' // [!code hl]
}) // [!code hl]
```

## Returns

`Hex`

The storage slot.

## Parameters

### withdrawalHash

- **Type:** `Hash`

Hash emitted from the L2 withdrawal `MessagePassed` event.

```ts
const slot = getWithdrawalHashStorageSlot({ 
  withdrawalHash: '0xB1C3824DEF40047847145E069BF467AA67E906611B9F5EF31515338DB0AABFA2' // [!code focus]
})
```
