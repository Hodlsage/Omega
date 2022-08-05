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
  setupOmegaIdo: async () => {
    artifact = require('../../../build/contracts/OmegaIdo.json')
    OmegaIdo = TruffleContract(artifact)
    OmegaIdo.setProvider(provider)
    return await OmegaIdo.deployed()
  },
  setupOmegaToken: async () => {
    artifact = require('../../../build/contracts/Omega.json')
    Omega = TruffleContract(artifact)
    Omega.setProvider(provider)
    return await Omega.deployed()
  },
  // setupOxToken: async () => {
  //   artifact = require('../../../build/contracts/Ox.json')
  //   Ox = TruffleContract(artifact)
  //   Ox.setProvider(provider)
  //   return await Ox.deployed()
  // },
  main: async () => {
    console.log('start')
    let ido = await Stats.setupOmegaIdo()
    let omega = await Stats.setupOmegaToken()
    // let ox = await Stats.setupOxToken()

    // OX contract on mainnet
    const oxContractAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'

    let oxArtifact = require('../../../build/contracts/MainnetOx.json')
    Ox = TruffleContract(oxArtifact)
    Ox.setProvider(provider)
    let ox = await Ox.at(oxContractAddress)

    console.log('IDO contract address: ' + ido.address)
    console.log('OM contract address: ' + omega.address)
    console.log('OX contract address: ' + ox.address)

    let amountOx = await ox.balanceOf(ido.address)
    console.log('OX in IDO contract: ' + Stats.toEth(amountOx.toString()))

    let amountOmega = await omega.balanceOf(ido.address)
    console.log('OM in IDO contract: ' + Stats.toEth(amountOmega.toString()))

    let omegaPrice = await ido.pricePerOmegaPercent.call()
    console.log('OM price in IDO: ' + omegaPrice.toString())

    console.log('done')
    process.exit()
  }
}

Stats.main()
