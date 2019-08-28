import Ganache from 'ganache-core';
import assert from 'assert';
import Web3 from 'web3';
import HDWalletProvider from './';
import BigNumber from 'bignumber.js'

const MNEMONIC = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat';
const PORT = 8646;

const web3 = new Web3();

describe('HD Wallet Provider', () => {
  let server: any;
  let provider: HDWalletProvider;
  let second: string;

  before(done => {
    server = Ganache.server({
      port: PORT,
      mnemonic: MNEMONIC
    });
    server.listen(PORT, async () => {
      provider = new HDWalletProvider({
        mnemonic: MNEMONIC,
        rpcUrl: `http://localhost:${PORT}`,
        numberOfAccounts: 2
      });
      second = (await provider.getAddresses())[1]
      web3.setProvider(provider);
      done();
    });
  });

  after(async () => {
    provider.engine.stop();
    setTimeout(() => {
      server.close();
    }, 100);
  });

  it('provide block number', async () => {
    const blockNumber = await web3.eth.getBlockNumber()
    assert(blockNumber === 0)
  })

  it('sign message', async () => {
    const account = (await web3.eth.getAccounts())[0]
    const signature = await web3.eth.sign('0xdeadbeaf', account)
    assert.strictEqual(signature, '0x3625102379ad3db8521240fa82e1f8829b41acc6e826f92f082476e60432510351d88072116c2e1304130871e8bd1a6ef9d5f8751d6a6d030e0e390a65e28b061c')
  })

  it('sign transaction', async () => {
    const account = (await web3.eth.getAccounts())[0]
    const balance = new BigNumber(await web3.eth.getBalance(account))
    await web3.eth.sendTransaction({
      from: account,
      to: second,
      value: 10
    })
    const balanceAfter = new BigNumber(await web3.eth.getBalance(account))
    assert.strictEqual(balanceAfter.minus(balance).toNumber(), -42000000000010)
    // const signature = await web3.eth.sendTransaction({
    //   value
    // })
    // assert.strictEqual(signature, '0x3625102379ad3db8521240fa82e1f8829b41acc6e826f92f082476e60432510351d88072116c2e1304130871e8bd1a6ef9d5f8751d6a6d030e0e390a65e28b061c')
  })

  it('provide accounts', async () => {
    const expected = await provider.getAddresses()
    const actual = await web3.eth.getAccounts()
    assert.deepStrictEqual(expected, actual.map(a => a.toLowerCase()))
  });
});
