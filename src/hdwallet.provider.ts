import FiltersSubprovider from "web3-provider-engine/subproviders/filters";
import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";
import SanitizingSubprovider from "web3-provider-engine/subproviders/sanitizer";
import CacheSubprovider from "web3-provider-engine/subproviders/cache";
import SubscriptionSubprovider from "web3-provider-engine/subproviders/subscriptions";
import InflightCacheSubprovider from "web3-provider-engine/subproviders/inflight-cache";
import { Provider } from "web3/providers";
import { baseProvider, Remote } from "./util";
import { NonceSubprovider } from "./nonce.subprovider";
import ProviderEngine from "web3-provider-engine";
import { MnemonicSubprovider } from "./mnemonic.subprovider";
import { DEFAULT_PATH } from "./path.util";
import { IJsonRPCRequest, IJsonRPCResponse } from "./interface.util";
import { GetTransportFunction, LedgerSubprovider } from "./ledger.subprovider";
import FetchSubprovider = require("web3-provider-engine/subproviders/fetch");

type Callback<A> = HookedWalletSubprovider.Callback<A>;

export interface MnemonicOptions {
  mnemonic: string;
  rpc: string;
  path?: string;
  numberOfAccounts?: number;
}

export interface LedgerOptions {
  rpc: string;
  path?: string;
  numberOfAccounts?: number;
  accountsOffset?: number;
  askConfirm?: boolean;
}

async function ledgerProvider<A>(
  getTransport: GetTransportFunction<A>,
  options: LedgerOptions
): Promise<HDWalletProvider> {
  const remote = baseProvider(options.rpc);
  const signer = new LedgerSubprovider(getTransport, options);
  return new HDWalletProvider(signer, remote);
}

export class HDWalletProvider implements Provider {
  readonly getAddresses: () => Promise<string[]>;
  public readonly engine: ProviderEngine;

  static mnemonic(options: MnemonicOptions): HDWalletProvider {
    const path = options.path || DEFAULT_PATH;
    const remote = baseProvider(options.rpc);
    const signer = new MnemonicSubprovider(path, options.mnemonic, options.numberOfAccounts);
    return new HDWalletProvider(signer, remote);
  }

  static async ledgerHID(options: LedgerOptions) {
    require("babel-polyfill");
    const TransportHid = (await import("@ledgerhq/hw-transport-node-hid")).default;
    const getTransport = () => TransportHid.create();
    return ledgerProvider(getTransport, options);
  }

  static async ledgerBLE(options: LedgerOptions) {
    require("babel-polyfill");
    const TransportBLE = (await import("./transport-ble")).TransportBle;
    const getTransport = () => TransportBLE.create();
    return ledgerProvider(getTransport, options);
  }

  /**
   * Initialize HDWallet using some sort of provider.
   */
  constructor(signer: HookedWalletSubprovider, remote: Remote) {
    const engine = new ProviderEngine();
    this.getAddresses = () => {
      return new Promise<string[]>((resolve, reject) => {
        signer.getAccounts((error, accounts) => {
          error ? reject(error) : resolve(accounts);
        });
      });
    };
    engine.addProvider(signer);
    engine.addProvider(new NonceSubprovider());
    engine.addProvider(new SanitizingSubprovider())
    engine.addProvider(new CacheSubprovider())
    if (remote instanceof FetchSubprovider) {
      engine.addProvider(new SubscriptionSubprovider())
      engine.addProvider(new FiltersSubprovider());
    }
    engine.addProvider(new InflightCacheSubprovider())
    engine.addProvider(remote);
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
