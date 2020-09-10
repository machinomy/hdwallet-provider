import * as util from "./util";
import ProviderEngine from "web3-provider-engine";
import type { EventEmitter } from "events";

export abstract class SubProvider {
  engine?: ProviderEngine;
  currentBlock?: any;

  setEngine(engine: ProviderEngine) {
    if (this.engine) {
      return;
    }
    this.engine = engine;
    const asEventEmitter = engine as unknown as EventEmitter
    asEventEmitter.on("block", block => {
      this.currentBlock = block;
    });
    asEventEmitter.on("start", () => {
      this.start();
    });

    asEventEmitter.on("stop", () => {
      this.stop();
    });
  }

  abstract handleRequest(payload: any, next: any, end: any): void;

  emitPayload(payload: any, cb: any) {
    this.engine!.sendAsync(util.createPayload(payload), cb);
  }

  start() {
    // Noop
  }

  stop() {
    // Noop
  }
}
