import FiltersSubprovider from 'web3-provider-engine/subproviders/filters';
import HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet';
import HDKeyring from 'eth-hd-keyring';
import { Provider } from 'web3/providers';
import { baseProvider, createPayload } from './util';
import { Transaction } from 'ethereumjs-tx';
import { NonceSubProvider } from './NonceSubProvider';
import { IJsonRPCRequest } from './IJsonRPCRequest';
import { IJsonRPCResponse } from './IJsonRPCResponse';
import ProviderEngine from 'web3-provider-engine';

type Callback<A> = HookedWalletSubprovider.Callback<A>;

export interface Options {
  mnemonic: string;
  rpcUrl: string;
  hdPath?: string;
  numberOfAccounts?: number;
}

const DEFAULT_HD_PATH = "m/44'/60'/0'/0";

function connectionType(rpcUrl: string) {
  const protocol = rpcUrl.split(':')[0].toLowerCase();
  switch (protocol) {
    case 'http':
      return 'http';
    case 'https':
      return 'http';
    case 'ws':
      return 'ws';
    case 'wss':
      return 'ws';
    default:
      throw new Error(`ProviderEngine - unrecognized protocol in "${rpcUrl}"`);
  }
}

export default class HDWalletProvider implements Provider {
  keyring: HDKeyring;
  public readonly engine: ProviderEngine;

  /**
   * Initialize HDWallet using some sort of provider.
   */
  constructor(options: Options) {
    const hdPath = options.hdPath || DEFAULT_HD_PATH;
    const numberOfAccounts = options.numberOfAccounts || 1;

    const keyring = new HDKeyring({
      hdPath,
      mnemonic: options.mnemonic,
      numberOfAccounts,
    });
    this.keyring = keyring;

    const engine = new ProviderEngine();
    engine.addProvider(
      new HookedWalletSubprovider({
        getAccounts: (callback: Callback<Array<string>>) => {
          keyring
            .getAccounts()
            .then(accounts => {
              callback(null, accounts);
            })
            .catch(e => {
              callback(e);
            });
        },
        signMessage: (msgParams: HookedWalletSubprovider.MsgParams, callback: Callback<string>) => {
          let address = msgParams.from;
          keyring
            .signPersonalMessage(address, msgParams.data)
            .then(result => {
              callback(null, result);
            })
            .catch(e => {
              callback(e);
            });
        },
        signPersonalMessage: (msgParams: HookedWalletSubprovider.MsgParams, callback: Callback<string>) => {
          let address = msgParams.from;
          keyring
            .signPersonalMessage(address, msgParams.data)
            .then(result => {
              callback(null, result);
            })
            .catch(e => {
              callback(e);
            });
        },
        signTypedMessage: (msgParams: HookedWalletSubprovider.TypedMsgParams, callback: Callback<string>) => {
          let address = msgParams.from;
          keyring
            .signTypedData(address, msgParams.data)
            .then(result => {
              callback(null, result);
            })
            .catch(e => {
              callback(e);
            });
        },
        signTransaction: (txParams: any, callback: Callback<string>) => {
          engine.sendAsync(
            createPayload({
              method: 'net_version',
            }),
            (err: any, result: any) => {
              if (err) {
                return callback(err);
              } else {
                const chainId = Number(result.result);
                const tx = new Transaction(txParams, { chain: chainId });
                keyring
                  .signTransaction(txParams.from, tx)
                  .then(signedTx => {
                    const hexTx = '0x' + signedTx.serialize().toString('hex');
                    callback(null, hexTx);
                  })
                  .catch(e => {
                    callback(e);
                  });
              }
            },
          );
        },
      }),
    );
    engine.addProvider(new NonceSubProvider());
    engine.addProvider(new FiltersSubprovider());
    engine.addProvider(baseProvider(options.rpcUrl));
    engine.start();
    this.engine = engine;
  }

  async getAddresses(): Promise<Array<string>> {
    return this.keyring.getAccounts();
  }

  send(payload: IJsonRPCRequest, callback: Callback<IJsonRPCResponse>): void {
    this.engine.sendAsync(payload, callback);
  }

  sendAsync(payload: IJsonRPCRequest, callback: Callback<IJsonRPCResponse>): void {
    this.engine.sendAsync(payload, callback);
  }
}
