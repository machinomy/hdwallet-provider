import ProviderEngine from 'web3-provider-engine'
import * as util from "./util";

export abstract class SubProvider {
  engine?: ProviderEngine
  currentBlock?: any

  setEngine (engine: ProviderEngine) {
    if (this.engine) {
      return
    }
    this.engine = engine
    engine.on('block', (block) => {
      this.currentBlock = block
    })
    engine.on('start', () => {
      this.start()
    })

    engine.on('stop', () => {
      this.stop()
    })
  }

  abstract handleRequest (payload: any, next: any, end: any): void

  emitPayload (payload: any, cb: any) {
    this.engine!.sendAsync(util.createPayload(payload), cb)
  }

  start () {
    // Noop
  }

  stop () {
    // Noop
  }
}
