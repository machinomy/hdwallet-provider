import FiltersSubprovider from 'web3-provider-engine/subproviders/filters';
import HookedWalletSubprovider from 'web3-provider-engine/subproviders/hooked-wallet';
import { Provider } from 'web3/providers';
import { baseProvider } from './util';
import { NonceSubProvider } from './NonceSubProvider';
import { IJsonRPCRequest } from './IJsonRPCRequest';
import { IJsonRPCResponse } from './IJsonRPCResponse';
import ProviderEngine from 'web3-provider-engine';
import { MnemonicSubprovider } from "./mnemonic-subprovider";

type Callback<A> = HookedWalletSubprovider.Callback<A>;

export interface Options {
  mnemonic: string;
  rpcUrl: string;
  hdPath?: string;
  numberOfAccounts?: number;
}

const DEFAULT_HD_PATH = "m/44'/60'/0'/0";

export default class HDWalletProvider implements Provider {
  readonly getAddresses: () => Promise<string[]>
  public readonly engine: ProviderEngine;

  /**
   * Initialize HDWallet using some sort of provider.
   */
  constructor(options: Options) {
    const hdPath = options.hdPath || DEFAULT_HD_PATH;
    const numberOfAccounts = options.numberOfAccounts || 1;

    const engine = new ProviderEngine();
    const mnemonicSubprovider = new MnemonicSubprovider(engine, hdPath, options.mnemonic, numberOfAccounts)
    this.getAddresses = () => {
      return new Promise<string[]>((resolve, reject) => {
        mnemonicSubprovider.getAccounts((error, accounts) => {
          error ? reject(error) : resolve(accounts)
        })
      })
    }
    engine.addProvider(mnemonicSubprovider);
    engine.addProvider(new NonceSubProvider());
    engine.addProvider(new FiltersSubprovider());
    engine.addProvider(baseProvider(options.rpcUrl));
    engine.start();
    this.engine = engine;
  }

  send(payload: IJsonRPCRequest, callback: Callback<IJsonRPCResponse>): void {
    this.engine.sendAsync(payload, callback);
  }

  sendAsync(payload: IJsonRPCRequest, callback: Callback<IJsonRPCResponse>): void {
    this.engine.sendAsync(payload, callback);
  }
}
