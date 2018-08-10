# hdwallet-provider

HD Wallet-enabled Web3 provider. Use it to sign transactions,
and messages for addresses derived from a 12-word mnemonic.

Fork of [truffle-hdwallet-provider](https://github.com/trufflesuite/truffle-hdwallet-provider).

## Install

    $ yarn install @machinomy/hdwallet-provider

## Usage

You can use this provider wherever a Web3 provider is needed.

```typescript
import HDWalletProvider from '@machinomy/hdwallet-provider'
import * as Web3 from 'web3'
    
const mnemonic = "opinion destroy betray ..." // 12 word mnemonic

// simple http
var justProvider = HDWalletProvider.http(mnemonic, 'http://localhost:8545')

// or something more complex
var customDumbProvider = new Web3.providers.HttpProvider('http://localhost:8545')
var provider = new HDWalletProvider(mnemonic, customDumbProvider, 5)
```

By default, the HDWalletProvider will use the address of the first address that's generated from the mnemonic. If you pass in a specific index, it'll use that address instead. Currently, the HDWalletProvider manages only one address at a time, but it can be easily upgraded to manage (i.e., "unlock") multiple addresses.

Parameters:

| Argument        | Type     | Description                                                  |
| --------------- | -------- | ------------------------------------------------------------ |
| `mnemonic`      | `string` | 12 word mnemonic which addresses are created from            |
| `provider_uri`  | `string` | URI of Ethereum client to send all other non-transaction-related Web3 requests |
| `address_index` | `number` | Optional. If specified, will tell the provider to manage the address at the index specified. Defaults to the first address (index 0). |
