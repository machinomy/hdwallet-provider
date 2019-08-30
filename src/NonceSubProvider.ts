import { SubProvider } from "./SubProvider";
import { blockTagForPayload } from "./util";
import * as ethUtil from 'ethereumjs-util'
import { Transaction } from "ethereumjs-tx";

export class NonceSubProvider extends SubProvider {
  private nonceCache: Map<string, number> = new Map()

  updateNonce(address: string, nonce: number, cb: () => void) {
    const cached = this.nonceCache.get(address)
    const isNewerNonce = (typeof cached === 'number') && nonce > cached
    if (!cached || isNewerNonce) {
      console.log(`NONCE: for address ${address}: before=${cached}, after=${nonce}`)
      this.nonceCache.set(address, nonce)
    }
    cb()
  }

  handleRequest(payload: any, next: any, end: any): void {
    switch(payload.method) {
      case 'eth_getTransactionCount':
        const blockTag = blockTagForPayload(payload)
        const address = payload.params[0].toLowerCase()
        const cachedResult = this.nonceCache.get(address)
        // only handle requests against the 'pending' blockTag
        if (blockTag === 'pending') {
          // has a result
          if (cachedResult) {
            end(null, cachedResult)
            // fallthrough then populate cache
          } else {
            next((err: any, result: any, cb: any) => {
              if (err) return cb()
              this.updateNonce(address, ethUtil.bufferToInt(result), () => {
                cb()
              })
            })
          }
        } else {
          next()
        }
        return

      case 'eth_sendRawTransaction':
        // allow the request to continue normally
        next((err: any, result: any, cb: any) => {
          // only update local nonce if tx was submitted correctly
          if (err) return cb()
          // parse raw tx
          const rawTx = ethUtil.toBuffer(payload.params[0])
          const tx = new Transaction(rawTx)
          // extract address
          const address = ethUtil.bufferToHex(tx.getSenderAddress())
          // extract nonce and increment
          let nonce = ethUtil.bufferToInt(tx.nonce)
          nonce++
          // dont update our record on the nonce until the submit was successful
          // update cache
          this.updateNonce(address, nonce, () => {
            cb()
          })
        })
        return

      // Clear cache on a testrpc revert
      case 'evm_revert':
        this.nonceCache = new Map()
        next()
        return

      default:
        next()
        return

    }
  }
}
