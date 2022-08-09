require('dotenv').config()
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const TruffleContract = require('truffle-contract')
// const owner = '0xf2D61557575e87D695F9f29ddD5B7Fe9BcaF6805' // owner testnet
const owner = process.env.OWNER_WALLET
const provider = new HDWalletProvider(process.env.PRIVATE_KEY, process.env.HOST_URI)

Stats = {
  toWei: (n) => {
    return Web3.utils.toWei(n, 'ether')
  },
  toEth: (n) => {
    return Web3.utils.fromWei(n, 'ether')
  },
  setupOmegaDao: async () => {
    artifact = require('../../build/contracts/OmegaDao.json')
    OmegaDao = TruffleContract(artifact)
    OmegaDao.setProvider(provider)
    return await OmegaDao.deployed()
  },
  setupOmegaToken: async () => {
    artifact = require('../../build/contracts/Omega.json')
    Omega = TruffleContract(artifact)
    Omega.setProvider(provider)
    return await Omega.deployed()
  },
  setupOxToken: async () => {
    artifact = require('../../build/contracts/Ox.json')
    Ox = TruffleContract(artifact)
    Ox.setProvider(provider)
    return await Ox.deployed()
  },
  main: async () => {
    console.log('start')
    let dao = await Stats.setupOmegaDao()
    let omega = await Stats.setupOmegaToken()

    // let ox = await Stats.setupOxToken()

    // OX contract on mainnet
    const oxContractAddress = '0x1945698b32CBDB5684A28Ad507608205eB1a95cB'
    let oxArtifact = require('../../build/contracts/MainnetOx.json')
    Ox = TruffleContract(oxArtifact)
    Ox.setProvider(provider)
    let ox = await Ox.at(oxContractAddress)

    console.log('DAO contract address: ' + dao.address)
    console.log('OM contract address: ' + omega.address)
    console.log('OX contract address: ' + ox.address)

    let omegaInterestRatePercent = await dao.omegaInterestRatePercent.call()
    console.log('Interest per node: ' + (omegaInterestRatePercent.toNumber() / 100))

    let amountOx = await ox.balanceOf(dao.address)
    console.log('OX in contract: ' + Stats.toEth(amountOx.toString()))

    let amountOmega = await omega.balanceOf(dao.address)
    console.log('OM in contract: ' + Stats.toEth(amountOmega.toString()))

    let totalNodes = await dao.totalNodes.call()
    console.log(totalNodes.toNumber())
    let omegaNodesAddresses = await dao.omegaNodesAddresses.call(1)
    console.log(omegaNodesAddresses)

    console.log('done')
    process.exit()
  }
}

Stats.main()
