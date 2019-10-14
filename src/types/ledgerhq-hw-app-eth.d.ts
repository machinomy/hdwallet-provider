declare module "@ledgerhq/hw-app-eth" {
  import Transport from "@ledgerhq/hw-transport";

  export class AppEth<A> {
    constructor(transport: Transport<A>);
    getAddress(
      path: string,
      boolDisplay?: boolean,
      boolChaincode?: boolean
    ): Promise<{
      publicKey: string;
      address: string;
      chainCode?: string;
    }>;
    signPersonalMessage(
      path: string,
      messageHex: string
    ): Promise<{
      v: number;
      s: string;
      r: string;
    }>;
    signTransaction(
      path: string,
      rawTxHex: string
    ): Promise<{
      s: string,
      v: string,
      r: string
    }>
  }

  export default AppEth;
}
