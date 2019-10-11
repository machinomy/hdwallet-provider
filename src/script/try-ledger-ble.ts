import { HDWalletProvider } from "../hdwallet.provider";
import Web3 from "web3";

async function main() {
  const provider = await HDWalletProvider.ledgerBLE({
    rpc: 'https://rinkeby.infura.io/v3/a98ee9d34cb245b8aa86cff6ca3ed30f',
    path: 'm/44\'/60\'/0\'/0/0'
  })
  const providerAccounts = await provider.getAddresses()
  console.log('Accounts from provider:', providerAccounts)
  const web3 = new Web3(provider)
  const web3Accounts = await web3.eth.getAccounts()
  console.log('Accounts from web3:', web3Accounts)
  const signature = await web3.eth.sign('0xdead', web3Accounts[0]);
  console.log(signature)
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
