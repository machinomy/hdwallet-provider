declare module "@ledgerhq/hw-transport" {
  import { DeviceModel } from "@ledgerhq/devices";

  export interface Observer<Ev> {
    next: (event: Ev) => mixed;
    error: (e: any) => mixed;
    complete: () => mixed;
  }

  export type DescriptorEvent<Descriptor> = {
    type: "add" | "remove";
    descriptor: Descriptor;
    deviceModel?: DeviceModel;
    device?: Device;
  };

  export default class Transport<Descriptor> {
    exchangeTimeout: number;
    static isSupported: () => Promise<boolean>;
    static list: () => Promise<Array<Descriptor>>;
    static listen: (observer: Observer<DescriptorEvent<Descriptor>>) => Subscription;
    static open: (descriptor: Descriptor, timeout?: number) => Promise<Transport<Descriptor>>;
    exchange: (apdu: Buffer) => Promise<Buffer>;
    setScrambleKey: (key: string) => void;
    close: () => Promise<void>;

    on(eventName: string, cb: Function): void;

    off(eventName: string, cb: Function): void;

    emit(event: string, ...args: any[]): void;

    setDebugMode(): void;

    setExchangeTimeout(exchangeTimeout: number): void;

    send(cla: number, ins: number, p1: number, p2: number, data?: Buffer, statusList?: Array<number>): Promise<Buffer>;

    static create(openTimeout?: number = 3000, listenTimeout?: number): Promise<Transport<Descriptor>>;

    exchangeBusyPromise?: Promise<void>;

    static ErrorMessage_ListenTimeout = "No Ledger device found (timeout)";
    static ErrorMessage_NoDeviceFound = "No Ledger device found";
  }
}
