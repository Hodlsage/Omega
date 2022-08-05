// Mock OX Token -- just developement
// const Ox = artifacts.require("Ox");

const Omega = artifacts.require("Omega");
const CuboDao = artifacts.require("CuboDao");
const CuboIdo = artifacts.require("CuboIdo");
const Web3 = require('web3')

function toWei(n) {
  return Web3.utils.toWei(n, 'ether')
}

function toEth(n) {
  return Web3.utils.fromWei(n, 'ether')
}

module.exports = async function (deployer, network, accounts) {
  const team = [
    '0xB4738b703dF076b947C41936Daaf69764F900B75',
    '0xc38754F0E05357815Ef614D13431F3BF284255E1',
    '0x10C1F0227f14BE1faC588dd315040938f72E8b89',
    '0x8C5DAD87BaDEeE2388915B38C58332385C864DA4'
  ]

  // Mock OX Token -- testnet
  // const daiContractAddress = '0xc67112C850964bFf0563D894130c02d6839A0EC2'

  // Mock OX Token -- localhost
  // await deployer.deploy(Ox)
  // const daiToken = await Ox.deployed()

  // Mainnet OX Token
  const daiContractAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'

  // Deploy OM Token
  await deployer.deploy(Omega)
  const cuboToken = await Omega.deployed()

  // Deploy cuboDao
  await deployer.deploy(CuboDao, cuboToken.address, daiContractAddress, team)
  const cuboDao = await CuboDao.deployed()

  await cuboToken.setDaoContract(cuboDao.address)

  // Deploy cuboIDO
  let pricePerCubo = 50 // 0.5 OX per OM
  await deployer.deploy(CuboIdo, cuboToken.address, daiContractAddress, pricePerCubo)
  const cuboIdo = await CuboIdo.deployed()

  // Move half OM tokens to the cuboIdo and cuboDao
  let cuboBalance = await cuboToken.balanceOf(accounts[0])
  let halfBalance = toWei((parseInt(toEth(cuboBalance)) / 2).toString())
  await cuboToken.transfer(cuboIdo.address, halfBalance)
  await cuboToken.transfer(cuboDao.address, halfBalance)

  await cuboToken.setTranferLimit(toWei('100000')) // Set transfer limit to 10k OM

  // transfer OX balance to owner -- just developement
  // daiBalance = await daiToken.balanceOf(accounts[0])
  // await daiToken.transfer(cuboIdo.address, daiBalance.toString())
};
