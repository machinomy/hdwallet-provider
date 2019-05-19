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
  constructor (mnemonic: string, provider: Web3.Provider, hdPath?: string, numberOfAccounts: number = 1) {
    let keyring = new HDKeyring({
      hdPath,
      mnemonic,
      numberOfAccounts
    })
    this.keyring = keyring

    this.engine = new ProviderEngine()
    this.engine.addProvider(new HookedWalletSubprovider({
      getAccounts: (callback: Callback<Array<string>>) => {
        keyring.getAccounts().then(accounts => {
          callback(null, accounts)
        }).catch(e => {
          callback(e)
        })
      },
      signTransaction: (txParams: Web3.TxData, callback: Callback<string>) => {
        let tx = new Transaction(txParams)
        keyring.signTransaction(txParams.from, tx).then(signedTx => {
          let hexTx = '0x' + signedTx.serialize().toString('hex')
          callback(null, hexTx)
        }).catch(e => {
          callback(e)
        })
      },
      signMessage: (msgParams: HookedWalletSubprovider.MsgParams, callback: Callback<string>) => {
        let address = msgParams.from
        keyring.signPersonalMessage(address, msgParams.data).then(result => {
          callback(null, result)
        }).catch(e => {
          callback(e)
        })
      },
      signPersonalMessage: (msgParams: HookedWalletSubprovider.MsgParams, callback: Callback<string>) => {
        let address = msgParams.from
        keyring.signPersonalMessage(address, msgParams.data).then(result => {
          callback(null, result)
        }).catch(e => {
          callback(e)
        })
      },
      signTypedMessage: (msgParams: HookedWalletSubprovider.TypedMsgParams, callback: Callback<string>) => {
        let address = msgParams.from
        keyring.signTypedData(address, msgParams.data).then(result => {
          callback(null, result)
        }).catch(e => {
          callback(e)
        })
      }
    }))
    this.engine.addProvider(new FiltersSubprovider())
    this.engine.addProvider(new ProviderSubprovider(provider))
    this.engine.start()

    this.sendAsync = this.engine.sendAsync.bind(this.engine)
    this.send = this.engine.send.bind(this.engine)
  }

  static http (mnemonic: string, url: string, hdPath?: string, numberOfAccounts: number = 1): HDWalletProvider {
    let provider = new Web3.providers.HttpProvider(url)
    return new HDWalletProvider(mnemonic, provider, hdPath, numberOfAccounts)
  }

  async getAddress (n: number): Promise<string> {
    let accounts = await this.keyring.getAccounts()
    return accounts[n]
  }

  async getAddresses (): Promise<Array<string>> {
    return this.keyring.getAccounts()
  }
}
