import { BaseBlockTracker, Block, SECOND } from "./base";
import {AbstractProvider} from 'web3-core'

import { timeout } from "../util";

export interface Options {
  provider: AbstractProvider;
  pollingInterval?: number;
  retryTimeout?: number;
  keepEventLoopActive?: boolean;
  setSkipCacheFlag?: boolean;
}

export class PollingBlockTracker extends BaseBlockTracker {
  private readonly _provider: AbstractProvider;
  private readonly _pollingInterval: number;
  private readonly _retryTimeout: number;
  private readonly _keepEventLoopActive: boolean;
  private readonly _setSkipCacheFlag: boolean;

  constructor(opts: Options) {
    // parse + validate args
    if (!opts.provider) throw new Error("PollingBlockTracker - no provider specified.");
    const pollingInterval = opts.pollingInterval || 20 * SECOND;
    const retryTimeout = opts.retryTimeout || pollingInterval / 10;
    const keepEventLoopActive = opts.keepEventLoopActive !== undefined ? opts.keepEventLoopActive : true;
    const setSkipCacheFlag = opts.setSkipCacheFlag || false;
    // BaseBlockTracker constructor
    super(
      Object.assign(
        {
          blockResetDuration: pollingInterval
        },
        opts
      )
    );
    // config
    this._provider = opts.provider;
    this._pollingInterval = pollingInterval;
    this._retryTimeout = retryTimeout;
    this._keepEventLoopActive = keepEventLoopActive;
    this._setSkipCacheFlag = setSkipCacheFlag;
  }

  // trigger block polling
  async checkForLatestBlock(): Promise<Block> {
    await this._updateLatestBlock();
    return await this.getLatestBlock();
  }

  _start(): void {
    this._performSync().catch(err => this.emit("error", err));
  }

  _end(): void {
    // Noop
  }

  async _performSync(): Promise<void> {
    while (this.isRunning()) {
      try {
        await this._updateLatestBlock();
        await timeout(this._pollingInterval, !this._keepEventLoopActive);
      } catch (err) {
        const newErr = new Error(
          `PollingBlockTracker - encountered an error while attempting to update latest block:\n${err.stack}`
        );
        try {
          this.emit("error", newErr);
        } catch (emitErr) {
          console.error(newErr);
        }
        await timeout(this._retryTimeout, !this._keepEventLoopActive);
      }
    }
  }

  async _updateLatestBlock(): Promise<void> {
    // fetch + set latest block
    const latestBlock = await this._fetchLatestBlock();
    this._newPotentialLatest(latestBlock);
  }

  async _fetchLatestBlock(): Promise<Block> {
    const req = { jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [], skipCache: false };
    if (this._setSkipCacheFlag) req.skipCache = true;
    const res = await new Promise<any>(((resolve, reject) => {
      this._provider.sendAsync(req, (err: any, result: any) => {
        return err ? reject(err) : resolve(result)
      })
    }))
    if (res.error) throw new Error(`PollingBlockTracker - encountered error fetching block:\n${res.error}`);
    return res.result;
  }
}
