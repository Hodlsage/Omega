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
  setupCuboIdo: async () => {
    artifact = require('../../../build/contracts/CuboIdo.json')
    CuboIdo = TruffleContract(artifact)
    CuboIdo.setProvider(provider)
    return await CuboIdo.deployed()
  },
  setupCuboToken: async () => {
    artifact = require('../../../build/contracts/Omega.json')
    Omega = TruffleContract(artifact)
    Omega.setProvider(provider)
    return await Omega.deployed()
  },
  // setupDaiToken: async () => {
  //   artifact = require('../../../build/contracts/Ox.json')
  //   Ox = TruffleContract(artifact)
  //   Ox.setProvider(provider)
  //   return await Ox.deployed()
  // },
  main: async () => {
    console.log('start')
    let ido = await Stats.setupCuboIdo()
    let omega = await Stats.setupCuboToken()
    // let ox = await Stats.setupDaiToken()

    // OX contract on mainnet
    const daiContractAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'

    let daiArtifact = require('../../../build/contracts/MainnetDai.json')
    Ox = TruffleContract(daiArtifact)
    Ox.setProvider(provider)
    let ox = await Ox.at(daiContractAddress)

    console.log('IDO contract address: ' + ido.address)
    console.log('OM contract address: ' + omega.address)
    console.log('OX contract address: ' + ox.address)

    let amountDai = await ox.balanceOf(ido.address)
    console.log('OX in IDO contract: ' + Stats.toEth(amountDai.toString()))

    let amountCubo = await omega.balanceOf(ido.address)
    console.log('OM in IDO contract: ' + Stats.toEth(amountCubo.toString()))

    let cuboPrice = await ido.pricePerCuboPercent.call()
    console.log('OM price in IDO: ' + cuboPrice.toString())

    console.log('done')
    process.exit()
  }
}

Stats.main()
