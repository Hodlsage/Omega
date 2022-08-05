require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')
const TruffleContract = require('truffle-contract')
const owner = process.env.OWNER_WALLET

ChangeInterestRate = {
  setup: async () => {
    provider = new HDWalletProvider(process.env.PRIVATE_KEY, process.env.HOST_URI)
    cuboDaoArtifact = require('../../build/contracts/CuboDao.json')
    CuboDao = TruffleContract(cuboDaoArtifact)
    CuboDao.setProvider(provider)
    return await CuboDao.deployed()
  },
  main: async (value) => {
    console.log('start')
    let contract = await ChangeInterestRate.setup()
    await contract.changeInterestRate(value, { from: owner } )
    console.log('done')
    process.exit()
  }
}

const value = process.argv.slice(2);
ChangeInterestRate.main(value.toString())
