import * as Ganache from 'ganache-core'
import * as assert from 'assert'
import * as Web3 from 'web3'
import HDWalletProvider from './'

const MNEMONIC = 'candy maple cake sugar pudding cream honey rich smooth crumble sweet treat'
const PORT = 8646

const web3 = new Web3()

describe('HD Wallet Provider', () => {
  let server: Ganache.Server
  let provider: HDWalletProvider

  before(done => {
    server = Ganache.server()
    server.listen(PORT, () => {
      provider = new HDWalletProvider(MNEMONIC, new Web3.providers.HttpProvider(`http://localhost:${PORT}`))
      web3.setProvider(provider)
      done()
    })
  })

  after(done => {
    provider.engine.stop()
    setTimeout(() => server.close(done), 1000) // :/
  })

  it('provide block number', done => {
    web3.eth.getBlockNumber((err, n) => {
      if (err) {
        done(err)
      } else {
        assert(n === 0)
        done()
      }
    })
  })

  it('provide accounts', async () => {
    let expected = await provider.getAddresses()
    return new Promise((resolve, reject) => {
      web3.eth.getAccounts((error, actual) => {
        if (error) {
          reject(error)
        } else {
          assert.deepStrictEqual(expected, actual)
          resolve()
        }
      })
    })
  })
})
