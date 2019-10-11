export interface IJsonRPCRequest {
  jsonrpc: string;
  method: string;
  params: any[];
  id: number;
}
