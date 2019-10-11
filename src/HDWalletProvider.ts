import FiltersSubprovider from "web3-provider-engine/subproviders/filters";
import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";
import { Provider } from "web3/providers";
import { baseProvider } from "./util";
import { NonceSubProvider } from "./NonceSubProvider";
import { IJsonRPCRequest } from "./IJsonRPCRequest";
import { IJsonRPCResponse } from "./IJsonRPCResponse";
import ProviderEngine from "web3-provider-engine";
import { MnemonicSubprovider } from "./mnemonic-subprovider";

type Callback<A> = HookedWalletSubprovider.Callback<A>;

export interface Options {
  keySubprovider: HookedWalletSubprovider;
  rpcUrl: string;
}

export interface MnemonicOptions {
  mnemonic: string;
  rpcUrl: string;
  hdPath?: string;
  numberOfAccounts?: number;
}

export interface LedgerOptions {
  numberOfAccounts?: number
  rpcUrl: string;
  path?: string
}

export default class HDWalletProvider implements Provider {
  readonly getAddresses: () => Promise<string[]>;
  public readonly engine: ProviderEngine;

  static mnemonic(options: MnemonicOptions): HDWalletProvider {
    const mnemonicSubprovider = new MnemonicSubprovider(options.hdPath, options.mnemonic, options.numberOfAccounts);
    return new HDWalletProvider({
      keySubprovider: mnemonicSubprovider,
      rpcUrl: options.rpcUrl
    });
  }

  static async ledgerHID(options: LedgerOptions) {
    require('babel-polyfill')
    const createLedgerSubprovider = (await import('@ledgerhq/web3-subprovider')).default
    const TransportHid = (await import("@ledgerhq/hw-transport-node-hid")).default
    const transport = await TransportHid.create()
    const getTransport = () => transport;
    const path = options.path ? options.path.replace(/^m\//, '') : options.path
    const ledgerSubprovider = createLedgerSubprovider(getTransport, {
      accountsLength: options.numberOfAccounts,
      path: path
    });
    return new HDWalletProvider({
      keySubprovider: ledgerSubprovider,
      rpcUrl: options.rpcUrl
    })
  }

  /**
   * Initialize HDWallet using some sort of provider.
   */
  constructor(options: Options) {
    const engine = new ProviderEngine();
    this.getAddresses = () => {
      return new Promise<string[]>((resolve, reject) => {
        options.keySubprovider.getAccounts((error, accounts) => {
          error ? reject(error) : resolve(accounts);
        });
      });
    };
    engine.addProvider(options.keySubprovider);
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
