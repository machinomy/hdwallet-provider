import HookedWalletSubprovider from "web3-provider-engine/subproviders/hooked-wallet";
import HDKeyring from "eth-hd-keyring";
import { createPayload } from "./util";
import { normalizePath } from "./path.util";
import { buildTransaction } from "./util/transaction.util";

type Callback<A> = HookedWalletSubprovider.Callback<A>;

export class MnemonicSubprovider extends HookedWalletSubprovider {
  private readonly keyring: HDKeyring;

  constructor(hdPath: string | undefined, mnemonic: string, numberOfAccounts?: number) {
    const keyring = new HDKeyring({
      hdPath: normalizePath(hdPath),
      mnemonic: mnemonic,
      numberOfAccounts: numberOfAccounts || 1
    });

    const options = {
      getAccounts: (callback: Callback<Array<string>>) => {
        keyring
          .getAccounts()
          .then(accounts => {
            callback(null, accounts);
          })
          .catch(e => {
            callback(e);
          });
      },
      signMessage: (msgParams: HookedWalletSubprovider.MsgParams, callback: Callback<string>) => {
        let address = msgParams.from;
        keyring
          .signPersonalMessage(address, msgParams.data)
          .then(result => {
            callback(null, result);
          })
          .catch(e => {
            callback(e);
          });
      },
      signPersonalMessage: (msgParams: HookedWalletSubprovider.MsgParams, callback: Callback<string>) => {
        let address = msgParams.from;
        keyring
          .signPersonalMessage(address, msgParams.data)
          .then(result => {
            callback(null, result);
          })
          .catch(e => {
            callback(e);
          });
      },
      signTypedMessage: (msgParams: HookedWalletSubprovider.TypedMsgParams, callback: Callback<string>) => {
        let address = msgParams.from;
        keyring
          .signTypedData(address, msgParams.data)
          .then(result => {
            callback(null, result);
          })
          .catch(e => {
            callback(e);
          });
      },
      signTransaction: (txParams: any, callback: Callback<string>) => {
        this.engine.sendAsync(
          createPayload({
            method: "net_version"
          }),
          (err: any, result: any) => {
            if (err) {
              return callback(err);
            } else {
              const networkId = Number(result.result);
              const tx = buildTransaction(txParams, networkId)
              keyring
                .signTransaction(txParams.from, tx)
                .then(signedTx => {
                  const hexTx = "0x" + signedTx.serialize().toString("hex");
                  callback(null, hexTx);
                })
                .catch(e => {
                  callback(e);
                });
            }
          }
        );
      }
    };
    super(options);
    this.keyring = keyring;
  }
}
