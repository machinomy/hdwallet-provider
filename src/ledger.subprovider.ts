import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";
import Transport from "@ledgerhq/hw-transport";
import { componentsFromPath, DEFAULT_PATH, normalizePath } from "./path.util";
import AppEth from "@ledgerhq/hw-app-eth";
import { createPayload, stripHexPrefix } from "./util";
import { TxData } from "ethereumjs-tx";
import { buildTransaction } from "./util/transaction.util";

export type GetTransportFunctionSimple<A> = () => Transport<A>;
export type GetTransportFunctionPromise<A> = () => Promise<Transport<A>>;
export type GetTransportFunction<A> = GetTransportFunctionPromise<A> | GetTransportFunctionSimple<A>;

export interface SubproviderOptions {
  // derivation path
  path?: string;
  // should use actively validate on the device
  askConfirm?: boolean;
  // number of accounts to derivate
  accountsLength?: number;
  // offset index to use to start derivating the accounts
  accountsOffset?: number;
}

export class InvalidNetworkIdError extends Error {}

export class LedgerSubprovider extends HookedWalletSubprovider {
  constructor(getTransport: GetTransportFunction<any>, options: SubproviderOptions) {
    const path = normalizePath(options.path || DEFAULT_PATH);
    const askConfirm = options.askConfirm || false;
    const accountsLength = options.accountsLength || 1;
    const accountsOffset = options.accountsOffset || 0;

    const pathComponents = componentsFromPath(path);

    const _addressToPath = new Map<string, string>();

    /**
     * @return address => path mapping
     */
    async function getAccounts(): Promise<Map<string, string>> {
      const transport = await getTransport();
      try {
        const eth = new AppEth(transport);
        const addresses = new Map<string, string>();
        for (let i = accountsOffset; i < accountsOffset + accountsLength; i++) {
          const path = pathComponents.basePath + (pathComponents.index + i).toString();
          const address = await eth.getAddress(path, askConfirm, false);
          addresses.set(path, address.address);
          _addressToPath.set(address.address.toLowerCase(), path);
        }
        return addresses;
      } finally {
        transport.close();
      }
    }

    /**
     * @return path => address mapping
     */
    async function getAddressToPath(): Promise<Map<string, string>> {
      if (_addressToPath.size == 0) {
        await getAccounts();
      }
      return _addressToPath;
    }

    async function signPersonalMessage(msgData: { from: string; data: string }) {
      const addressToPath = await getAddressToPath();
      const path = addressToPath.get(msgData.from.toLowerCase());
      if (!path) throw new Error(`address unknown '${msgData.from}'`);
      const transport = await getTransport();
      try {
        const eth = new AppEth(transport);
        const result = await eth.signPersonalMessage(path, stripHexPrefix(msgData.data));
        const v = parseInt(result.v.toString(), 10) - 27;
        let vHex = v.toString(16);
        if (vHex.length < 2) {
          vHex = `0${v}`;
        }
        return `0x${result.r}${result.s}${vHex}`;
      } finally {
        transport.close();
      }
    }

    async function signTransaction(networkId: number, txData: TxData & { from: string }) {
      const addressToPath = await getAddressToPath();
      const path = addressToPath.get(txData.from.toLowerCase());
      if (!path) throw new Error("address unknown '" + txData.from + "'");
      const transport = await getTransport();
      try {
        const eth = new AppEth(transport);
        const tx = buildTransaction(txData, networkId)

        // Set the EIP155 bits
        tx.raw[6] = Buffer.from([networkId]); // v
        tx.raw[7] = Buffer.from([]); // r
        tx.raw[8] = Buffer.from([]); // s

        // Pass hex-rlp to ledger for signing
        const result = await eth.signTransaction(path, tx.serialize().toString("hex"));

        // Store signature in transaction
        tx.v = Buffer.from(result.v, "hex");
        tx.r = Buffer.from(result.r, "hex");
        tx.s = Buffer.from(result.s, "hex");

        // EIP155: v should be chain_id * 2 + {35, 36}
        const signedChainId = Math.floor((tx.v[0] - 35) / 2);
        const validChainId = networkId & 0xff; // FIXME this is to fixed a current workaround that app don't support > 0xff
        if (signedChainId !== validChainId) {
          throw new InvalidNetworkIdError(
            `Invalid networkId signature returned. Expected: ${networkId}, Got: ${signedChainId}`
          );
        }

        return `0x${tx.serialize().toString("hex")}`;
      } finally {
        transport.close();
      }
    }

    super({
      getAccounts: callback => {
        getAccounts()
          .then(res => callback(null, Array.from(res.values())))
          .catch(err => callback(err, undefined));
      },
      signPersonalMessage: (txData, callback) => {
        signPersonalMessage(txData)
          .then(res => callback(null, res))
          .catch(err => callback(err, undefined));
      },
      signMessage: (txData, callback) => {
        signPersonalMessage(txData)
          .then(res => callback(null, res))
          .catch(err => callback(err, undefined));
      },
      signTransaction: (txData, callback) => {
        this.engine.sendAsync(createPayload({ method: "net_version" }), (err: any, result: any) => {
          if (err) {
            return callback(err);
          } else {
            const networkId = Number(result.result);
            signTransaction(networkId, txData)
              .then(res => callback(null, res))
              .catch(err => callback(err, undefined));
          }
        });
      }
    });
  }
}
