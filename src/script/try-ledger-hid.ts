import { HDWalletProvider } from "../hdwallet.provider";
import Web3 from "web3";

async function main() {
  const provider = await HDWalletProvider.ledgerHID({
    rpc: 'wss://rinkeby.infura.io/ws/v3/a98ee9d34cb245b8aa86cff6ca3ed30f',
    path: 'm/44\'/60\'/0\'/0/0'
  })
  const accounts = await provider.getAddresses()
  console.log('Accounts:', accounts)
  const web3 = new Web3(provider)
  const signature = await web3.eth.sign('0xdead', accounts[0]);
  console.log(signature)

  console.log(await web3.eth.getBlock('latest'))
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
