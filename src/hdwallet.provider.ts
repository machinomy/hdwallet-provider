import FiltersSubprovider from "web3-provider-engine/subproviders/filters";
import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";
import { Provider } from "web3/providers";
import { baseProvider } from "./util";
import { NonceSubprovider } from "./nonce.subprovider";
import ProviderEngine from "web3-provider-engine";
import { MnemonicSubprovider } from "./mnemonic.subprovider";
import { normalizePath } from "./path.util";
import { IJsonRPCRequest, IJsonRPCResponse } from "./interface.util";

type Callback<A> = HookedWalletSubprovider.Callback<A>;

export interface Options {
  walletSubprovider: HookedWalletSubprovider;
  rpc: string;
}

export interface MnemonicOptions {
  mnemonic: string;
  rpc: string;
  path?: string;
  numberOfAccounts?: number;
}

export interface LedgerOptions {
  rpc: string;
  numberOfAccounts?: number;
  path?: string;
  askConfirm?: boolean;
  accountsOffset?: number;
}

export class HDWalletProvider implements Provider {
  readonly getAddresses: () => Promise<string[]>;
  public readonly engine: ProviderEngine;

  static mnemonic(options: MnemonicOptions): HDWalletProvider {
    const path = normalizePath(options.path);
    const mnemonicSubprovider = new MnemonicSubprovider(path, options.mnemonic, options.numberOfAccounts);
    return new HDWalletProvider({
      walletSubprovider: mnemonicSubprovider,
      rpc: options.rpc
    });
  }

  static async ledgerHID(options: LedgerOptions) {
    require("babel-polyfill");
    const createLedgerSubprovider = (await import("@ledgerhq/web3-subprovider")).default;
    const TransportHid = (await import("@ledgerhq/hw-transport-node-hid")).default;
    const transport = await TransportHid.create();
    const getTransport = () => transport;
    const path = normalizePath(options.path);
    const ledgerSubprovider = createLedgerSubprovider(getTransport, {
      path: path,
      accountsLength: options.numberOfAccounts,
      askConfirm: options.askConfirm,
      accountsOffset: options.accountsOffset
    });
    return new HDWalletProvider({
      walletSubprovider: ledgerSubprovider,
      rpc: options.rpc
    });
  }

  /**
   * Initialize HDWallet using some sort of provider.
   */
  constructor(options: Options) {
    const engine = new ProviderEngine();
    this.getAddresses = () => {
      return new Promise<string[]>((resolve, reject) => {
        options.walletSubprovider.getAccounts((error, accounts) => {
          console.log('wa', error, accounts)
          error ? reject(error) : resolve(accounts);
        });
      });
    };
    engine.addProvider(options.walletSubprovider);
    engine.addProvider(new NonceSubprovider());
    engine.addProvider(new FiltersSubprovider());
    engine.addProvider(baseProvider(options.rpc));
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
