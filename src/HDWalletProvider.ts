import * as Web3 from 'web3'
import * as Transaction from 'ethereumjs-tx'
import * as ProviderEngine from 'web3-provider-engine'
import * as FiltersSubprovider from 'web3-provider-engine/subproviders/filters'
import * as HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet'
import * as ProviderSubprovider from 'web3-provider-engine/subproviders/provider'
import * as HDKeyring from 'eth-hd-keyring'

export default class HDWalletProvider implements Web3.Provider {
  send: (payload: any) => any
  sendAsync: (payload: any, callback: (error: any, response: any) => void) => void
  keyring: HDKeyring
  engine: ProviderEngine

  constructor (mnemonic: string, providerUrl: string, numberOfAccounts: number = 1) {
    let keyring = new HDKeyring({
      mnemonic: mnemonic,
      numberOfAccounts: numberOfAccounts
    })
    this.keyring = keyring

    this.engine = new ProviderEngine()
    this.engine.addProvider(new HookedWalletSubprovider({
      getAccounts: (callback: HookedWalletSubprovider.Callback<Array<string>>) => {
        keyring.getAccounts().then(accounts => {
          callback(null, accounts)
        }).catch(error => {
          callback(error)
        })
      },
      signTransaction: (txParams: Web3.TxData, callback: HookedWalletSubprovider.Callback<string>) => {
        let tx = new Transaction(txParams)
        keyring.signTransaction(txParams.from, tx).then(signedTx => {
          let hexTx = '0x' + signedTx.serialize().toString('hex')
          callback(null, hexTx)
        }).catch(error => {
          callback(error)
        })
      },
      signMessage: (msgParams: HookedWalletSubprovider.MsgParams, callback: HookedWalletSubprovider.Callback<string>) => {
        let address = msgParams.from
        keyring.signPersonalMessage(address, msgParams.data).then(result => {
          callback(null, result)
        }).catch(callback)
      },
      signPersonalMessage: (msgParams: HookedWalletSubprovider.MsgParams, callback: HookedWalletSubprovider.Callback<string>) => {
        let address = msgParams.from
        keyring.signPersonalMessage(address, msgParams.data).then(result => {
          callback(null, result)
        }).catch(callback)
      },
      signTypedMessage: (msgParams: HookedWalletSubprovider.TypedMsgParams, callback: HookedWalletSubprovider.Callback<string>) => {
        let address = msgParams.from
        keyring.signTypedData(address, msgParams.data).then(result => {
          callback(null, result)
        }).catch(callback)
      }
    }))
    this.engine.addProvider(new FiltersSubprovider())
    this.engine.addProvider(new ProviderSubprovider(new Web3.providers.HttpProvider(providerUrl)))
    this.engine.start()

    this.sendAsync = this.engine.sendAsync.bind(this.engine)
    this.send = this.engine.send.bind(this.engine)
  }

  async getAddress (n: number): Promise<string> {
    let accounts = await this.keyring.getAccounts()
    return accounts[n]
  }

  async getAddresses (): Promise<Array<string>> {
    return this.keyring.getAccounts()
  }

  isConnected (): boolean {
    try {
      this.send({
        id: 9999999999,
        jsonrpc: '2.0',
        method: 'net_listening',
        params: []
      })
      return true
    } catch (e) {
      return false
    }
  }
}
