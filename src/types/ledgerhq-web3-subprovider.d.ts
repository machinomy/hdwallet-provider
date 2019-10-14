declare module "@ledgerhq/web3-subprovider" {
  import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";
  import Transport from "@ledgerhq/hw-transport";
  export interface SubproviderOptions {
    networkId?: number
    path?: string
    askConfirm?: boolean
    accountsLength?: number
    accountsOffset?: number
  }

  export type GetTransportFunctionSimple = () => Transport<A>
  export type GetTransportFunctionPromise = () => Promise<Transport<A>>
  export type GetTransportFunction = GetTransportFunctionPromise | GetTransportFunctionSimple

  export default function createLedgerSubprovider<A>(
    getTransport: GetTransportFunction,
    options?: SubproviderOptions
  ): HookedWalletSubprovider;
}
