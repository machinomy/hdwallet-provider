import { HDWalletProvider } from "../hdwallet.provider";

async function main() {
  const a = await HDWalletProvider.ledgerHID({
    numberOfAccounts: 5,
    rpc: 'https://rinkeby.infura.io/v3/a98ee9d34cb245b8aa86cff6ca3ed30f',
    path: 'm/44\'/60\'/0\'/0/0'
  })
  const accounts = await a.getAddresses()
  console.log(accounts)
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
