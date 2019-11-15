import { Provider as Web3Provider } from "web3/providers";
import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";

export interface IRPCError {
  message: string;
  code: number;
}

export interface IJsonRPCResponse {
  jsonrpc: string;
  id: number;
  result?: any;
  error?: string | IRPCError;
}

export interface IJsonRPCRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id: number;
}

export type Callback<A> = HookedWalletSubprovider.Callback<A>;

export interface Provider extends Web3Provider {
  sendAsync(payload: IJsonRPCRequest, callback: Callback<IJsonRPCResponse>): void;
}
