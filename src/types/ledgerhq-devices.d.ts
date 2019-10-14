declare module "@ledgerhq/devices" {
  export type DeviceModel = {
    id: DeviceModelId;
    productName: string;
    productIdMM: number;
    legacyUsbProductId: number;
    usbOnly: boolean;
    bluetoothSpec?: Array<{
      serviceUuid: string;
      writeUuid: string;
      notifyUuid: string;
    }>;
  };
}
