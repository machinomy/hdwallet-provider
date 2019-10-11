import * as ethUtil from "ethereumjs-util";
import FetchSubprovider from "web3-provider-engine/subproviders/fetch";

const EXTRA_DIGITS = 3;

export function randomId() {
  // 13 time digits
  const datePart = new Date().getTime() * Math.pow(10, EXTRA_DIGITS);
  // 3 random digits
  const extraPart = Math.floor(Math.random() * Math.pow(10, EXTRA_DIGITS));
  // 16 digits
  return datePart + extraPart;
}

export function createPayload(data: any) {
  const empty = {
    id: randomId(),
    jsonrpc: "2.0",
    params: []
  };
  return Object.assign(empty, data);
}

export function baseProvider(rpcUrl: string) {
  const protocol = rpcUrl.split(":")[0].toLowerCase();
  switch (protocol) {
    case "http":
      return new FetchSubprovider({ rpcUrl });
    case "https":
      return new FetchSubprovider({ rpcUrl });
    case "ws":
      throw new Error(`ProviderEngine - unrecognized protocol in "${rpcUrl}"`);
    case "wss":
      throw new Error(`ProviderEngine - unrecognized protocol in "${rpcUrl}"`);
    default:
      throw new Error(`ProviderEngine - unrecognized protocol in "${rpcUrl}"`);
  }
}

export function blockTagForPayload(payload: any) {
  const index = blockTagParamIndex(payload);

  // Block tag param not passed.
  if (!index || index >= payload.params.length) {
    return null;
  }

  return payload.params[index];
}

export function blockTagParamIndex(payload: any): number | undefined {
  switch (payload.method) {
    // blockTag is third param
    case "eth_getStorageAt":
      return 2;
    // blockTag is second param
    case "eth_getBalance":
    case "eth_getCode":
    case "eth_getTransactionCount":
    case "eth_call":
    case "eth_estimateGas":
      return 1;
    // blockTag is first param
    case "eth_getBlockByNumber":
      return 0;
    // there is no blockTag
    default:
      return undefined;
  }
}

export function toBufferBlock(jsonBlock: any) {
  return {
    number: ethUtil.toBuffer(jsonBlock.number),
    hash: ethUtil.toBuffer(jsonBlock.hash),
    parentHash: ethUtil.toBuffer(jsonBlock.parentHash),
    nonce: ethUtil.toBuffer(jsonBlock.nonce),
    mixHash: ethUtil.toBuffer(jsonBlock.mixHash),
    sha3Uncles: ethUtil.toBuffer(jsonBlock.sha3Uncles),
    logsBloom: ethUtil.toBuffer(jsonBlock.logsBloom),
    transactionsRoot: ethUtil.toBuffer(jsonBlock.transactionsRoot),
    stateRoot: ethUtil.toBuffer(jsonBlock.stateRoot),
    receiptsRoot: ethUtil.toBuffer(jsonBlock.receiptRoot || jsonBlock.receiptsRoot),
    miner: ethUtil.toBuffer(jsonBlock.miner),
    difficulty: ethUtil.toBuffer(jsonBlock.difficulty),
    totalDifficulty: ethUtil.toBuffer(jsonBlock.totalDifficulty),
    size: ethUtil.toBuffer(jsonBlock.size),
    extraData: ethUtil.toBuffer(jsonBlock.extraData),
    gasLimit: ethUtil.toBuffer(jsonBlock.gasLimit),
    gasUsed: ethUtil.toBuffer(jsonBlock.gasUsed),
    timestamp: ethUtil.toBuffer(jsonBlock.timestamp),
    transactions: jsonBlock.transactions
  };
}

export function isFn(input: any): boolean {
  const type = Object.prototype.toString.call(input);
  return type === "[object Function]" || type === "[object GeneratorFunction]" || type === "[object AsyncFunction]";
}

export function promiseToCallback(promise: Promise<any>) {
  if (!isFn(promise.then)) {
    throw new TypeError("Expected a promise");
  }

  return function(cb: any) {
    promise.then(
      function(data) {
        setImmediate(cb, null, data);
      },
      function(err) {
        setImmediate(cb, err);
      }
    );
  };
}

export interface RetryOptions {
  times: number;
  interval: number;
  errorFilter: (err: any) => boolean;
}

export async function delay(n: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, n);
  });
}

export async function retry<A>(options: RetryOptions, task: () => Promise<A>): Promise<A> {
  try {
    return task();
  } catch (e) {
    if (options.errorFilter(e) && options.times > 0) {
      await delay(options.interval);
      const nextOptions = { ...options, times: options.times - 1 };
      return await retry(nextOptions, task);
    } else {
      throw e;
    }
  }
}
