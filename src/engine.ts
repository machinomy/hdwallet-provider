import ProviderEngine from "web3-provider-engine";
import { createPayload, timeout } from "./util";

export class Engine extends ProviderEngine {
  async _getBlockByNumberRepeat(blockNumber: string | number): Promise<any> {
    const attempts = 5;
    const interval = 1000;
    const req = createPayload({ method: "eth_getBlockByNumber", params: [blockNumber, false], skipCache: true });
    for (let attempt = 0; attempt < attempts; attempt++) {
      const response = await this._handlePromise(req);
      if (response.error || response.result) {
        return response;
      } else {
        await timeout(interval);
      }
    }
  }

  _handlePromise(req: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this._handleAsync(req, (err, res) => {
        err ? reject(err) : resolve(res);
      });
    });
  }

  _getBlockByNumber(blockNumber: string | number, callback: (error: any, result?: any) => void) {
    this._getBlockByNumberRepeat(blockNumber)
      .then(result => {
        callback(null, result);
      })
      .catch(error => {
        callback(error);
      });
  }
}
