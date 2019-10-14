import { Transaction, TxData } from "ethereumjs-tx";

export function buildTransaction(rawTx: Buffer | TxData, networkId: number) {
  return new Transaction(rawTx, { chain: networkId, hardfork: 'spuriousDragon' });
}
