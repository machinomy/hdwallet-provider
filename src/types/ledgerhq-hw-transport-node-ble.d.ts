declare module "@ledgerhq/hw-transport-node-ble" {
  import Transport from "@ledgerhq/hw-transport";
  export default class TransportNodeBle extends Transport<string> {
    static create(): Promise<Transport<string>>
  }
}
