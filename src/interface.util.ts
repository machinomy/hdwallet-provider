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
