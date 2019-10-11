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
