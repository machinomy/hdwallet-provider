import Ganache from "ganache-core";
import HDWalletProvider from "./index";
import Web3 from "web3";
import * as _ from "lodash";

const MNEMONIC = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";
const PORT = 8646;

async function buildServer(): Promise<{ provider: HDWalletProvider; server: any }> {
  const server = Ganache.server({
    port: PORT,
    mnemonic: MNEMONIC
  });
  return new Promise(resolve => {
    server.listen(PORT, async () => {
      const provider = new HDWalletProvider({
        mnemonic: MNEMONIC,
        rpcUrl: `http://localhost:${PORT}`,
        numberOfAccounts: 2
      });
      resolve({ provider, server });
    });
  });
}

async function main() {
  const provider = new HDWalletProvider({
    rpcUrl: "https://rinkeby.infura.io/v3/5cd2eb52bfce484995e6e5b422f0e7f1",
    mnemonic: "shoot lounge into embark method hedgehog omit crack stairs pyramid allow diagram",
    numberOfAccounts: 2
  });
  const web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();
  const first = accounts[0];
  const second = accounts[1];
  console.log(first);
  console.log(second);

  const block = await web3.eth.getBlockNumber();
  console.log(block);

  const balance = await web3.eth.getBalance(first);
  console.log(balance);

  const firstToSecond = _.times(100, async i => {
    console.log("f", i);
    const a = await web3.eth.sendTransaction({
      from: first,
      to: second,
      value: 10
    });
    console.log(a);
    const b = await web3.eth.sendTransaction({
      from: second,
      to: first,
      value: 1
    });
    console.log(b);
  });
  const secondToFirst = _.times(100, async i => {
    console.log("s", i);
    const a = await web3.eth.sendTransaction({
      from: second,
      to: first,
      value: 1
    });
    console.log(a);
    const b = await web3.eth.sendTransaction({
      from: first,
      to: second,
      value: 1
    });
    console.log(b);
  });
  await Promise.all(firstToSecond.concat(secondToFirst));
  //
  // provider.engine.stop()
  // setTimeout(() => {
  //   // server.close()
  // }, 200)
}

main()
  .then(() => {
    console.log("foof");
  })
  .catch(e => {
    console.error(e);
  });
