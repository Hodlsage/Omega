// Mock OX Token -- just developement
// const Ox = artifacts.require("Ox");

const Omega = artifacts.require("Omega");
const OmegaDao = artifacts.require("OmegaDao");
const OmegaIdo = artifacts.require("OmegaIdo");
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
  // const oxContractAddress = '0xc67112C850964bFf0563D894130c02d6839A0EC2'

  // Mock OX Token -- localhost
  // await deployer.deploy(Ox)
  // const oxToken = await Ox.deployed()

  // Mainnet OX Token
  const oxContractAddress = '0x1945698b32CBDB5684A28Ad507608205eB1a95cB'

  // Deploy OM Token
  await deployer.deploy(Omega)
  const omegaToken = await Omega.deployed()

  // Deploy omegaDao
  await deployer.deploy(OmegaDao, omegaToken.address, oxContractAddress, team)
  const omegaDao = await OmegaDao.deployed()

  await omegaToken.setDaoContract(omegaDao.address)

  // Deploy omegaIDO
  let pricePerOmega = 50 // 0.5 OX per OM
  await deployer.deploy(OmegaIdo, omegaToken.address, oxContractAddress, pricePerOmega)
  const omegaIdo = await OmegaIdo.deployed()

  // Move half OM tokens to the omegaIdo and omegaDao
  let omegaBalance = await omegaToken.balanceOf(accounts[0])
  let halfBalance = toWei((parseInt(toEth(omegaBalance)) / 2).toString())
  await omegaToken.transfer(omegaIdo.address, halfBalance)
  await omegaToken.transfer(omegaDao.address, halfBalance)

  await omegaToken.setTranferLimit(toWei('100000')) // Set transfer limit to 10k OM

  // transfer OX balance to owner -- just developement
  // oxBalance = await oxToken.balanceOf(accounts[0])
  // await oxToken.transfer(omegaIdo.address, oxBalance.toString())
};
