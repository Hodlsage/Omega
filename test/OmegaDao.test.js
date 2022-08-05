const Omega = artifacts.require('Omega')
const Ox = artifacts.require('Ox')
const CuboDao2 = artifacts.require('CuboDao')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('CuboDao', ([owner, investor, teamMember1, teamMember2, teamMember3, user1]) => {
  let cuboToken, daiToken, cuboDao, pool

  before(async () => {
    cuboToken = await Omega.new()
    daiToken = await Ox.new()
    cuboDao = await CuboDao2.new(
      cuboToken.address,
      daiToken.address,
      [teamMember1, teamMember2, teamMember3]
    )
    pool = cuboDao.address

    await cuboToken.setDaoContract(cuboDao.address)
  })

  describe('Contract constructor', async () => {
    it('assigns team nodes', async () => {
      const teamMemberAddress0 = await cuboDao.cuboNodesAddresses.call(0)
      assert.equal(teamMemberAddress0, teamMember1)

      const teamMemberAddress1 = await cuboDao.cuboNodesAddresses.call(1)
      assert.equal(teamMemberAddress1, teamMember2)
    })

    it('has correct number of nodes', async () => {
      const teamMemberAccount0 = await cuboDao.accounts.call(teamMember1)
      assert.equal(teamMemberAccount0.gigaCount, 10)

      const teamMemberAccount1 = await cuboDao.accounts.call(teamMember2)
      assert.equal(teamMemberAccount1.gigaCount, 10)
    })

    it('total nodes are 30', async () => {
      const totalNodes = await cuboDao.totalNodes.call()
      assert.equal(totalNodes, 30)
    })
  })

  describe('#mintNode', async () => {
    before(async () => {
      await daiToken.transfer(investor, tokens('10000'), { from: owner })
      await cuboToken.transfer(investor, tokens('1000'), { from: owner })

      await daiToken.transfer(teamMember1, tokens('10000'), { from: owner })
      await cuboToken.transfer(teamMember1, tokens('1000'), { from: owner })
    })

    it('mints first node for user', async () => {
      result = await daiToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('10000'), 'investor OX wallet balance correct before minting node')

      result = await cuboToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('1000'), 'investor OM wallet balance correct before minting node')

      result = await daiToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('0'), 'OX pool wallet balance correct before minting node')

      result = await cuboToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('0'), 'OM pool wallet balance correct before minting node')

      await daiToken.approve(cuboDao.address, tokens('1000000'), { from: investor })
      await cuboToken.approve(cuboDao.address, tokens('1000000'), { from: investor })

      await cuboDao.mintNode(investor, tokens('500'), tokens('500'), 2, { from: investor })

      result = await daiToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('500'), 'pool OX wallet balance correct after minting node')

      result = await cuboToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('500'), 'pool OM wallet balance correct after minting node')

      const accountForAddress = await cuboDao.accounts.call(investor)
      assert.equal(accountForAddress.kiloCount, 1)

      const totalNodes = await cuboDao.totalNodes.call()
      assert.equal(totalNodes, 31)
    })

    it('mints another node for user', async () => {
      result = await daiToken.balanceOf(teamMember1)
      assert.equal(result.toString(), tokens('10000'), 'investor OX wallet balance correct before minting node')

      result = await cuboToken.balanceOf(teamMember1)
      assert.equal(result.toString(), tokens('1000'), 'investor OM wallet balance correct before minting node')

      result = await daiToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('500'), 'OX pool wallet balance correct before minting node')

      result = await cuboToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('500'), 'OX pool wallet balance correct before minting node')

      await daiToken.approve(cuboDao.address, tokens('500'), { from: teamMember1 })
      await cuboToken.approve(cuboDao.address, tokens('500'), { from: teamMember1 })

      await cuboDao.mintNode(teamMember1, tokens('500'), tokens('500'), 2, { from: teamMember1 })

      result = await daiToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('1000'), 'pool OX wallet balance correct after minting node')

      result = await cuboToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('1000'), 'pool OM wallet balance correct after minting node')

      const accountForAddress = await cuboDao.accounts.call(teamMember1)
      assert.equal(accountForAddress.kiloCount, 1)
      assert.equal(accountForAddress.gigaCount, 10)

      const totalNodes = await cuboDao.totalNodes.call()
      assert.equal(totalNodes, 32)
    })
  })

  describe('#payInterest', async () => {
    it('pays interest to node holders', async () => {
      let accountForAddress = await cuboDao.accounts.call(teamMember1)
      assert.equal(accountForAddress.gigaCount, 10)
      assert.equal(accountForAddress.kiloCount, 1)
      assert.equal(accountForAddress.nanoCount, 0)
      assert.equal(accountForAddress.interestAccumulated, 0)

      accountForAddress = await cuboDao.accounts.call(teamMember2)
      assert.equal(accountForAddress.gigaCount, 10)
      assert.equal(accountForAddress.kiloCount, 0)
      assert.equal(accountForAddress.nanoCount, 0)
      assert.equal(accountForAddress.interestAccumulated, 0)

      accountForAddress = await cuboDao.accounts.call(teamMember3)
      assert.equal(accountForAddress.gigaCount, 10)
      assert.equal(accountForAddress.kiloCount, 0)
      assert.equal(accountForAddress.nanoCount, 0)
      assert.equal(accountForAddress.interestAccumulated, 0)

      accountForAddress = await cuboDao.accounts.call(investor)
      assert.equal(accountForAddress.gigaCount, 0)
      assert.equal(accountForAddress.kiloCount, 1)
      assert.equal(accountForAddress.nanoCount, 0)
      assert.equal(accountForAddress.interestAccumulated, 0)

      // runs day 1
      await cuboDao.payInterest({ from: owner })

      accountForAddress = await cuboDao.accounts.call(teamMember1)
      assert.equal(accountForAddress.gigaCount, 10)
      assert.equal(accountForAddress.kiloCount, 1)
      assert.equal(accountForAddress.nanoCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('1007'))

      accountForAddress = await cuboDao.accounts.call(teamMember2)
      assert.equal(accountForAddress.gigaCount, 10)
      assert.equal(accountForAddress.kiloCount, 0)
      assert.equal(accountForAddress.nanoCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('1000'))

      accountForAddress = await cuboDao.accounts.call(teamMember3)
      assert.equal(accountForAddress.gigaCount, 10)
      assert.equal(accountForAddress.kiloCount, 0)
      assert.equal(accountForAddress.nanoCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('1000'))

      accountForAddress = await cuboDao.accounts.call(investor)
      assert.equal(accountForAddress.gigaCount, 0)
      assert.equal(accountForAddress.kiloCount, 1)
      assert.equal(accountForAddress.nanoCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('7'))

      // runs day 2
      await cuboDao.payInterest({ from: owner })

      accountForAddress = await cuboDao.accounts.call(teamMember1)
      assert.equal(accountForAddress.gigaCount, 10)
      assert.equal(accountForAddress.kiloCount, 1)
      assert.equal(accountForAddress.nanoCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('2014'))

      accountForAddress = await cuboDao.accounts.call(teamMember2)
      assert.equal(accountForAddress.gigaCount, 10)
      assert.equal(accountForAddress.kiloCount, 0)
      assert.equal(accountForAddress.nanoCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('2000'))

      accountForAddress = await cuboDao.accounts.call(teamMember3)
      assert.equal(accountForAddress.gigaCount, 10)
      assert.equal(accountForAddress.kiloCount, 0)
      assert.equal(accountForAddress.nanoCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('2000'))

      accountForAddress = await cuboDao.accounts.call(investor)
      assert.equal(accountForAddress.gigaCount, 0)
      assert.equal(accountForAddress.kiloCount, 1)
      assert.equal(accountForAddress.nanoCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('14'))
    })
  })

  describe('#widthrawInterest', async () => {
    it('user can widthraw their OM interest', async () => {
      accountForAddress = await cuboDao.accounts.call(investor)
      assert.equal(accountForAddress.kiloCount, 1)
      assert.equal(accountForAddress.interestAccumulated, tokens('14'))

      result = await cuboToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('500'), 'pool OM wallet balance correct after minting node')

      await cuboDao.widthrawInterest(investor, { from: investor })

      accountForAddress = await cuboDao.accounts.call(investor)
      assert.equal(accountForAddress.interestAccumulated, 0)

      result = await cuboToken.balanceOf(investor)
      assert.equal(result.toString(), tokens('514'), 'pool OM wallet balance correct after minting node')
    })
  })

  describe('#balancePool', async () => {
    it('balances pool when there are too little tokens', async () => {
      // from 96 OM to 220460
      poolOfCubo = await cuboToken.balanceOf(pool)
      assert.equal(poolOfCubo.toString(), tokens('986'), 'pool OM wallet balance correct before balancing')

      await cuboDao.balancePool({ from: owner })

      result = await cuboToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('1168000'), 'pool OM wallet balance correct after balancing')
    })

    it('balances pool when there are too many tokens', async () => {
      await cuboToken.mint(tokens('10000000'), { from: owner })
      await cuboToken.transfer(pool, tokens('10000000'), { from: owner })

      // from 1220460 OM to 220460
      poolOfCubo = await cuboToken.balanceOf(pool)
      assert.equal(poolOfCubo.toString(), tokens('11168000'), 'pool OM wallet balance correct before balancing')

      await cuboDao.balancePool({ from: owner })

      result = await cuboToken.balanceOf(pool)
      assert.equal(result.toString(), tokens('1168000'), 'pool OM wallet balance correct after balancing')
    })
  })

  describe('#changeInterestRate', async () => {
    it('updates the daily interest to 3', async () => {
      result = await cuboDao.cuboInterestRatePercent.call()
      assert.equal(result.toString(), '100', 'initial interest when contract is launched.')

      await cuboDao.changeInterestRate(300, { from: owner })

      result = await cuboDao.cuboInterestRatePercent.call()
      assert.equal(result.toString(), '300', 'interest after change.')
    })

    it('updates the daily interest to 1', async () => {
      result = await cuboDao.cuboInterestRatePercent.call()
      assert.equal(result.toString(), '300', 'initial interest when contract is launched.')

      await cuboDao.changeInterestRate(100, { from: owner })

      result = await cuboDao.cuboInterestRatePercent.call()
      assert.equal(result.toString(), '100', 'interest after change.')
    })

    it('updates the daily interest to 0.5', async () => {
      result = await cuboDao.cuboInterestRatePercent.call()
      assert.equal(result.toString(), '100', 'initial interest when contract is launched.')

      await cuboDao.changeInterestRate(50, { from: owner })

      result = await cuboDao.cuboInterestRatePercent.call()
      assert.equal(result.toString(), '50', 'interest after change.')
    })

    it('updates the daily interest to 0.3', async () => {
      result = await cuboDao.cuboInterestRatePercent.call()
      assert.equal(result.toString(), '50', 'initial interest when contract is launched.')

      await cuboDao.changeInterestRate(30, { from: owner })

      result = await cuboDao.cuboInterestRatePercent.call()
      assert.equal(result.toString(), '30', 'interest after change.')
    })
  })

  describe('#burnCubo', async () => {
    it('burns OM by sending it to an address', async () => {
      target = teamMember3
      amount = tokens('100')
      balanceBefore = await cuboToken.balanceOf(target)
      assert.equal(balanceBefore.toString(), '0')

      await cuboDao.burnCubo(target, amount, { from: owner })

      balanceAfter = await cuboToken.balanceOf(target)
      assert.equal(balanceAfter.toString(), tokens('100'))
    })

    it('fails because address isn\'t owner', async () => {
      target = teamMember3
      amount = tokens('100')
      balanceBefore = await cuboToken.balanceOf(target)
      assert.equal(balanceBefore.toString(), tokens('100'))

      try {
        await cuboDao.burnCubo(target, amount, { from: teamMember1 })
        await cuboDao.burnCubo(target, amount, { from: teamMember2 })
        await cuboDao.burnCubo(target, amount, { from: teamMember3 })
      } catch {}

      balanceAfter = await cuboToken.balanceOf(target)
      assert.equal(balanceAfter.toString(), tokens('100'))
    })
  })

  describe('#addDaiToLiquidityPool', async () => {
    it('moves OX by sending it to an address', async () => {
      target = teamMember3
      amount = tokens('100')
      balanceBefore = await daiToken.balanceOf(target)
      assert.equal(balanceBefore.toString(), '0')

      await cuboDao.addDaiToLiquidityPool(target, amount, { from: owner })

      balanceAfter = await daiToken.balanceOf(target)
      assert.equal(balanceAfter.toString(), tokens('100'))
    })

    it('fails because address isn\'t owner', async () => {
      target = teamMember3
      amount = tokens('100')
      balanceBefore = await daiToken.balanceOf(target)
      assert.equal(balanceBefore.toString(), tokens('100'))

      try {
        await cuboDao.addDaiToLiquidityPool(target, amount, { from: teamMember1 })
        await cuboDao.addDaiToLiquidityPool(target, amount, { from: teamMember2 })
        await cuboDao.addDaiToLiquidityPool(target, amount, { from: teamMember3 })
      } catch {}

      balanceAfter = await daiToken.balanceOf(target)
      assert.equal(balanceAfter.toString(), tokens('100'))
    })
  })

  describe('#awardNode', async () => {
    it('award more nodes to account with existing nodes', async () => {
      accountForAddress = await cuboDao.accounts.call(teamMember3)
      assert.equal(accountForAddress.kiloCount, 0)
      numOfnodesBefore = parseInt(accountForAddress.kiloCount.toString())

      await cuboDao.awardNode(teamMember3, 2, { from: owner })

      accountForAddress = await cuboDao.accounts.call(teamMember3)
      assert.equal(accountForAddress.kiloCount, 1)
      numOfnodesAfter = parseInt(accountForAddress.kiloCount.toString())

      assert.equal(numOfnodesAfter, numOfnodesBefore + 1)
    })

    it('fails because from address isn\'t owner', async () => {
      accountForAddress = await cuboDao.accounts.call(teamMember3)
      assert.equal(accountForAddress.kiloCount, 1)
      numOfnodesBefore = parseInt(accountForAddress.kiloCount.toString())

      try {
        await cuboDao.awardNode(teamMember3, 2, { from: teamMember1 })
        await cuboDao.awardNode(teamMember3, 2, { from: teamMember3 })
      } catch {}
      accountForAddress = await cuboDao.accounts.call(teamMember3)
      assert.equal(accountForAddress.kiloCount, 1)
    })
  })
})
