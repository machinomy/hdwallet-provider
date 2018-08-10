import * as Web3 from 'web3'
import * as Transaction from 'ethereumjs-tx'
import * as ProviderEngine from 'web3-provider-engine'
import * as FiltersSubprovider from 'web3-provider-engine/subproviders/filters'
import * as HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet'
import * as ProviderSubprovider from 'web3-provider-engine/subproviders/provider'
import * as HDKeyring from 'eth-hd-keyring'

type Callback<A> = HookedWalletSubprovider.Callback<A>

export default class HDWalletProvider implements Web3.Provider {
  send: (payload: any) => any
  sendAsync: (payload: any, callback: (error: any, response: any) => void) => void
  keyring: HDKeyring
  engine: ProviderEngine

  /**
   * Initialize HDWallet using some sort of provider.
   */
  constructor (mnemonic: string, provider: Web3.Provider, numberOfAccounts: number = 1) {
    let keyring = new HDKeyring({
      mnemonic: mnemonic,
      numberOfAccounts: numberOfAccounts
    })
    this.keyring = keyring

    this.engine = new ProviderEngine()
    this.engine.addProvider(new HookedWalletSubprovider({
      getAccounts: async (callback: Callback<Array<string>>) => {
        try {
          let accounts = await keyring.getAccounts()
          callback(null, accounts)
        } catch (e) {
          callback(e)
        }
      },
      signTransaction: async (txParams: Web3.TxData, callback: Callback<string>) => {
        try {
          let tx = new Transaction(txParams)
          let signedTx = await keyring.signTransaction(txParams.from, tx)
          let hexTx = '0x' + signedTx.serialize().toString('hex')
          callback(null, hexTx)
        } catch (e) {
          callback(e)
        }
      },
      signMessage: async (msgParams: HookedWalletSubprovider.MsgParams, callback: Callback<string>) => {
        try {
          let address = msgParams.from
          let result = await keyring.signPersonalMessage(address, msgParams.data)
          callback(null, result)
        } catch (e) {
          callback(e)
        }
      },
      signPersonalMessage: async (msgParams: HookedWalletSubprovider.MsgParams, callback: Callback<string>) => {
        try {
          let address = msgParams.from
          let result = await keyring.signPersonalMessage(address, msgParams.data)
          callback(null, result)
        } catch (e) {
          callback(e)
        }
      },
      signTypedMessage: async (msgParams: HookedWalletSubprovider.TypedMsgParams, callback: Callback<string>) => {
        try {
          let address = msgParams.from
          let result = await keyring.signTypedData(address, msgParams.data)
          callback(null, result)
        } catch (e) {
          callback(e)
        }
      }
    }))
    this.engine.addProvider(new FiltersSubprovider())
    this.engine.addProvider(new ProviderSubprovider(provider))
    this.engine.start()

    this.sendAsync = this.engine.sendAsync.bind(this.engine)
    this.send = this.engine.send.bind(this.engine)
  }

  static http (mnemonic: string, url: string, numberOfAccounts: number = 1): HDWalletProvider {
    let provider = new Web3.providers.HttpProvider(url)
    return new HDWalletProvider(mnemonic, provider, numberOfAccounts)
  }

  async getAddress (n: number): Promise<string> {
    let accounts = await this.keyring.getAccounts()
    return accounts[n]
  }

  async getAddresses (): Promise<Array<string>> {
    return this.keyring.getAccounts()
  }
}
