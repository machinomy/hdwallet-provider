declare module 'ethereumjs-tx' {
  import BigNumber from 'bignumber.js'

  export class Transaction {
    constructor (raw: Buffer | Transaction.TransactionProperties, options?: object)
    sign(privateKey: Buffer): void
    serialize(): Buffer
    getSenderAddress(): Buffer
    nonce: Buffer
  }

  export namespace Transaction {
    export interface TransactionProperties {
      nonce?: Buffer | number | string
      gasPrice?: Buffer | BigNumber.BigNumber | number | string
      gasLimit?: Buffer | BigNumber.BigNumber | number | string
      gas?: Buffer | BigNumber.BigNumber | number | string
      to?: Buffer | string
      value?: Buffer | string | number | BigNumber.BigNumber
      data?: Buffer | string
      v?: Buffer | number | string
      r?: Buffer | number | string
      s?: Buffer | number | string
      chainId?: number
    }
  }
}
