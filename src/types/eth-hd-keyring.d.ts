declare module 'eth-hd-keyring' {
  import * as Transaction from 'ethereumjs-tx'
  import * as Web3 from 'web3'

  type HexString = string
  type Address = string

  class HDKeyring {
    type: string
    constructor (opts: HDKeyring.Serialized)
    serialize (): Promise<HDKeyring.Serialized>
    deserialize (opts?: HDKeyring.Serialized): Promise<void>
    addAccounts (numberOfAccounts?: number): Promise<HexString>
    getAccounts (): Promise<Array<Address>>
    signTransaction (address: Address, tx: Transaction): Promise<Transaction>
    signMessage (withAccount: Address, data: Web3.TxData): Promise<HexString>
    signPersonalMessage (withAccount: Address, msgHex: HexString): Promise<HexString>
    signTypedData (withAccount: Address, typedData: object): Promise<HexString>
    newGethSignMessage (withAccount: Address, msgHex: HexString): Promise<HexString>
    exportAccount (address: Address): Promise<HexString>
  }

  namespace HDKeyring {
    export const type: string
    export interface Serialized {
      hdPath?: string
      mnemonic?: string
      numberOfAccounts?: number
    }
  }

  export = HDKeyring
}
