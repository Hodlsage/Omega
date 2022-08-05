require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')
const TruffleContract = require('truffle-contract')
// const owner = '0xf2D61557575e87D695F9f29ddD5B7Fe9BcaF6805' // owner testnet
// const owner = '0x09998C5E17Af4e5EE208633E6466d0c7890Ce8a8' // owner localhost
const owner = process.env.OWNER_WALLET

PayInterest = {
  setup: async () => {
    provider = new HDWalletProvider(process.env.PRIVATE_KEY, process.env.HOST_URI)
    cuboDaoArtifact = require('../../build/contracts/OmegaDao.json')
    OmegaDao = TruffleContract(cuboDaoArtifact)
    OmegaDao.setProvider(provider)
    return await OmegaDao.deployed()
  },
  main: async () => {
    console.log('start')
    let contract = await PayInterest.setup()
    await contract.payInterest( { from: owner } )
    console.log('done')
    process.exit()
  }
}

PayInterest.main()
