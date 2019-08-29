import ProviderEngine from 'web3-provider-engine'
import FiltersSubprovider from 'web3-provider-engine/subproviders/filters'
import HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet'
import HDKeyring from 'eth-hd-keyring'
import { Provider } from "web3/providers";
import { baseProvider } from "./util";
import { Transaction } from 'ethereumjs-tx'
import { NonceSubProvider } from "./NonceSubProvider";

type Callback<A> = HookedWalletSubprovider.Callback<A>

export interface Options {
  mnemonic: string,
  rpcUrl: string,
  hdPath?: string,
  numberOfAccounts?: number
}

interface JsonRPCRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id: number;
}

interface JsonRPCResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: string;
}

const DEFAULT_HD_PATH = "m/44'/60'/0'/0"

function connectionType(rpcUrl: string) {
  const protocol = rpcUrl.split(':')[0].toLowerCase()
  switch (protocol) {
    case 'http':
      return 'http'
    case 'https':
      return 'http'
    case 'ws':
      return 'ws'
    case 'wss':
      return 'ws'
    default:
      throw new Error(`ProviderEngine - unrecognized protocol in "${rpcUrl}"`)
  }
}

export default class HDWalletProvider implements Provider {
  keyring: HDKeyring
  public readonly engine: ProviderEngine

  /**
   * Initialize HDWallet using some sort of provider.
   */
  constructor (options: Options) {
    const hdPath = options.hdPath || DEFAULT_HD_PATH
    const numberOfAccounts = options.numberOfAccounts || 1

    const keyring = new HDKeyring({
      hdPath,
      mnemonic: options.mnemonic,
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
      },
      signTransaction: (txParams: any, callback: Callback<string>) => {
        let tx
        if (options.rpcUrl.includes('rinkeby')) {
          tx = new Transaction(txParams, { chain: 'rinkeby' })
        } else {
          tx = new Transaction(txParams)
        }
        keyring.signTransaction(txParams.from, tx).then(signedTx => {
          let hexTx = '0x' + signedTx.serialize().toString('hex')
          callback(null, hexTx)
        }).catch(e => {
          callback(e)
        })
      },
    }))
    this.engine.addProvider(new NonceSubProvider())
    this.engine.addProvider(new FiltersSubprovider())
    this.engine.addProvider(baseProvider(options.rpcUrl))
    this.engine.start()
  }

  async getAddresses (): Promise<Array<string>> {
    return this.keyring.getAccounts()
  }

  send(payload: JsonRPCRequest, callback: Callback<JsonRPCResponse>): void {
    this.engine.sendAsync(payload, callback)
  }
}
