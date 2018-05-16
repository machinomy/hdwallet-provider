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
    server.listen(PORT, done)
  })

  after(done => {
    provider.engine.stop()
    setTimeout(() => server.close(done), 1000) // :/
  })

  it('provides', function(done){
    provider = new HDWalletProvider(MNEMONIC, `http://localhost:${PORT}`)
    web3.setProvider(provider)

    web3.eth.getBlockNumber((err, number) => {
      assert(number === 0)
      done()
    })
  })
})

