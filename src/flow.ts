import Ganache from "ganache-core";
import HDWalletProvider from "./index";
import Web3 from 'web3'
import * as _ from 'lodash'

const MNEMONIC = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat';
const PORT = 8646;

async function buildServer(): Promise<{provider: HDWalletProvider, server: any}> {
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
      resolve({provider, server})
    });
  })
}

async function main() {
  // const { provider, server } = await buildServer()
  const provider = new HDWalletProvider({
    rpcUrl: 'http://localhost:8545',
    mnemonic: 'shoot lounge into embark method hedgehog omit crack stairs pyramid allow diagram',
    numberOfAccounts: 2
  })
  const web3 = new Web3(provider)
  const accounts = await web3.eth.getAccounts()
  const first = accounts[0]
  const second = accounts[1]
  console.log(first)
  console.log(second)

  const firstToSecond = _.times(100, async (i) => {
    console.log('f', i)
    await web3.eth.sendTransaction({
      from: first,
      to: second,
      value: 1
    })
    await web3.eth.sendTransaction({
      from: second,
      to: first,
      value: 1
    })
  })
  const secondToFirst = _.times(100, async (i) => {
    console.log('s', i)
    await web3.eth.sendTransaction({
      from: second,
      to: first,
      value: 1
    })
    await web3.eth.sendTransaction({
      from: first,
      to: second,
      value: 1
    })
  })
  await Promise.all(firstToSecond.concat(secondToFirst))

  provider.engine.stop()
  setTimeout(() => {
    // server.close()
  }, 200)
}

main().then(() => {
  console.log('foof')
}).catch(e => {
  console.error(e)
})
