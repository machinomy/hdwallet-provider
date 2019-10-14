declare module "@ledgerhq/hw-transport-node-hid" {
  import Transport from "@ledgerhq/hw-transport";
  export default class TransportNodeHid extends Transport<string> {
    static create(): Promise<Transport<string>>
  }
}
