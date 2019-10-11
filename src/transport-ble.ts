import TransportNodeBle from "@ledgerhq/hw-transport-node-ble";

let instance: TransportBle

export class TransportBle extends TransportNodeBle {
  static async create(): Promise<TransportBle> {
    if (!instance) {
      instance = await TransportNodeBle.create()
    }
    return instance
  }

  close = async () => {
    // No Op
  }
}
