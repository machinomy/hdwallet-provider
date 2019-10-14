# hdwallet-provider

HD Wallet-enabled Web3 provider. Use it to sign transactions,
and messages for addresses derived from a 12-word mnemonic, or Ledger.

For Ledger it supports both USB and BLE (Ledger Nano X) transports.

## Install

    $ yarn install @machinomy/hdwallet-provider

## Usage

You can use this provider wherever a Web3 provider is needed.

### Mnemonic

```typescript
import HDWalletProvider from '@machinomy/hdwallet-provider'
import * as Web3 from 'web3'
    
const mnemonic = "opinion destroy betray ..." // 12 word mnemonic

const provider = HDWalletProvider.mnemonic({
  mnemonic: mnemonic, // mandatory
  rpc: 'http://localhost:8545', // mandatory
  path: "m/44'/60'/0'/0", // optional
  numberOfAccounts: 1 // optional
})
const web3 = new Web3(provider)
```

Parameters:

| Argument              | Type     | Description                                                    |
| --------------------- | -------- | -------------------------------------------------------------- |
| `mnemonic`            | `string` | 12 word mnemonic which addresses are created from              |
| `rpc`                 | `string` | URI of Ethereum client to send all other non-transaction-related Web3 requests |
| `path`                | `string` | Optional. HD derivation path, default is `m/44'/60'/0'/0`      |
| `numberOfAccounts`    | `string` | Optional. Number of accounts to manage, default is 1           |

### Ledger via USB HID

In addition to a mnemonic, you might use Ledger to manage a private key. We support connecting to Ledger
in Node setting only. _You can not use the provider to connect to Ledger on a web browser._ The following
enables connecting to Ledger via USB HID transport.

As Ledger connection is optional, Ledger-related providers are built via Promise-based interface.
Factory `HDWalletProvider.ledgerHID` returns a `Promise<HDWalletProvider>`.
It makes requiring USB-related packages on demand.

```typescript
import HDWalletProvider from '@machinomy/hdwallet-provider'
import * as Web3 from 'web3'
// ...
const provider = await HDWalletProvider.ledgerHID({
  rpc: 'http://localhost:8545', // mandatory
  path: "m/44'/60'/0'/0", // optional
  numberOfAccounts: 1, // optional
  accountsOffset: 0, // optional
  askConfirm: false // optional
})
const web3 = new Web3(provider)
```

Parameters:

| Argument              | Type     | Description                                                    |
| --------------------- | -------- | -------------------------------------------------------------- |
| `rpc`                 | `string` | URI of Ethereum client to send all other non-transaction-related Web3 requests |
| `path`                | `string` | Optional. HD derivation path, default is `m/44'/60'/0'/0`      |
| `numberOfAccounts`    | `string` | Optional. Number of accounts to manage, default is `1`         |
| `accountsOffset`      | `string` | Optional. Offset of derivation path index, defaults to `0`     |
| `askConfirm`          | `string` | Optional. Ask for confirmation on Ledger, default is `false`   |

### Ledger via BLE (for Ledger Nano X)

In addition to a mnemonic, you might use Ledger to manage a private key. We support connecting to Ledger
in Node setting only. _You can not use the provider to connect to Ledger on a web browser._ The following
enables connecting to Ledger via BLE transport. You might then use your Ledger Nano X wirelessly.

As Ledger connection is optional, Ledger-related providers are built via Promise-based interface.
Factory `HDWalletProvider.ledgerBLE` returns a `Promise<HDWalletProvider>`.
It makes requiring BLE-related packages on demand.

```typescript
import HDWalletProvider from '@machinomy/hdwallet-provider'
import * as Web3 from 'web3'
// ...
const provider = await HDWalletProvider.ledgerBLE({
  rpc: 'http://localhost:8545', // mandatory
  path: "m/44'/60'/0'/0", // optional
  numberOfAccounts: 1, // optional
  accountsOffset: 0, // optional
  askConfirm: false // optional
})
const web3 = new Web3(provider)
```

Parameters:

| Argument              | Type     | Description                                                    |
| --------------------- | -------- | -------------------------------------------------------------- |
| `rpc`                 | `string` | URI of Ethereum client to send all other non-transaction-related Web3 requests |
| `path`                | `string` | Optional. HD derivation path, default is `m/44'/60'/0'/0`      |
| `numberOfAccounts`    | `string` | Optional. Number of accounts to manage, default is `1`         |
| `accountsOffset`      | `string` | Optional. Offset of derivation path index, defaults to `0`     |
| `askConfirm`          | `string` | Optional. Ask for confirmation on Ledger, default is `false`   |

## Development

First, install dependencies:

```bash
yarn install --pure-lockfile
```

Then pass some tests:

```bash
yarn test
```

It tests only basic things for mnemonic providers. To test against USB or BLE Ledger use `src/script/try-ledger-hid.ts`
and `src/script/try-ledger-ble.ts` scripts correspondingly.
