const Omega = artifacts.require('Omega')
const Ox = artifacts.require('Ox')
const CuboDao2 = artifacts.require('CuboDao')

require('chai')
  .use(require('chai-as-promised'))
  .should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('CuboDao', ([owner, investor, teamMember1, teamMember2, teamMember3, user1, user2]) => {
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

  describe('User has no records to start with', async () => {
    it('has correct number of nodes and rewards', async () => {
      const userAccount = await cuboDao.accounts.call(user1)
      assert.equal(userAccount.nanoCount, 0)
      assert.equal(userAccount.miniCount, 0)
      assert.equal(userAccount.kiloCount, 0)
      assert.equal(userAccount.megaCount, 0)
      assert.equal(userAccount.gigaCount, 0)

      assert.equal(userAccount.interestAccumulated, 0)
    })
  })

  describe('User creates a node', async () => {
    before(async () => {
      await daiToken.transfer(user1, tokens('10000'), { from: owner })
      await cuboToken.transfer(user1, tokens('10000'), { from: owner })
    })

    it('nano node is created suceessfully', async () => {
      await daiToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })
      await cuboToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })

      await cuboDao.mintNode(user1, tokens('100'), tokens('100'), 0, { from: user1 })
      const userAccount = await cuboDao.accounts.call(user1)
      assert.equal(userAccount.nanoCount, 1)
    })
  })

  describe('User tries to create a node with less coins than required', async () => {
    it('mini node fails to create', async () => {
      let daiBalanceBefore = await daiToken.balanceOf(user1)
      let cuboBalanceBefore = await cuboToken.balanceOf(user1)

      await daiToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })
      await cuboToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })

      try {
        // insuficient tokens supplied
        await cuboDao.mintNode(user1, tokens('100'), tokens('100'), 1, { from: user1 })
      } catch {}

      const userAccount = await cuboDao.accounts.call(user1)
      assert.equal(userAccount.miniCount, 0)

      let daiBalanceAfter = await daiToken.balanceOf(user1)
      let cuboBalanceAfter = await cuboToken.balanceOf(user1)
      assert.equal(daiBalanceAfter.toString(), daiBalanceBefore.toString())
      assert.equal(cuboBalanceAfter.toString(), cuboBalanceBefore.toString())
    })

    it('mini node fails to create', async () => {
      let daiBalanceBefore = await daiToken.balanceOf(user1)
      let cuboBalanceBefore = await cuboToken.balanceOf(user1)

      await daiToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })
      await cuboToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })

      try {
        // insuficient tokens supplied
        await cuboDao.mintNode(user1, tokens('0'), tokens('0'), 1, { from: user1 })
      } catch {}

      const userAccount = await cuboDao.accounts.call(user1)
      assert.equal(userAccount.miniCount, 0)

      let daiBalanceAfter = await daiToken.balanceOf(user1)
      let cuboBalanceAfter = await cuboToken.balanceOf(user1)
      assert.equal(daiBalanceAfter.toString(), daiBalanceBefore.toString())
      assert.equal(cuboBalanceAfter.toString(), cuboBalanceBefore.toString())
    })

    it('mini node fails to create', async () => {
      let daiBalanceBefore = await daiToken.balanceOf(user1)
      let cuboBalanceBefore = await cuboToken.balanceOf(user1)

      await daiToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })
      await cuboToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })

      try {
        // insuficient tokens supplied
        await cuboDao.mintNode(user1, tokens('249'), tokens('249'), 1, { from: user1 })
      } catch {}

      const userAccount = await cuboDao.accounts.call(user1)
      assert.equal(userAccount.miniCount, 0)

      let daiBalanceAfter = await daiToken.balanceOf(user1)
      let cuboBalanceAfter = await cuboToken.balanceOf(user1)
      assert.equal(daiBalanceAfter.toString(), daiBalanceBefore.toString())
      assert.equal(cuboBalanceAfter.toString(), cuboBalanceBefore.toString())
    })

    it('mini node fails to create', async () => {
      let daiBalanceBefore = await daiToken.balanceOf(user1)
      let cuboBalanceBefore = await cuboToken.balanceOf(user1)

      await daiToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })
      await cuboToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })

      try {
        // insuficient tokens supplied
        await cuboDao.mintNode(user1, tokens('0'), tokens('250'), 1, { from: user1 })
      } catch {}

      const userAccount = await cuboDao.accounts.call(user1)
      assert.equal(userAccount.miniCount, 0)

      let daiBalanceAfter = await daiToken.balanceOf(user1)
      let cuboBalanceAfter = await cuboToken.balanceOf(user1)
      assert.equal(daiBalanceAfter.toString(), daiBalanceBefore.toString())
      assert.equal(cuboBalanceAfter.toString(), cuboBalanceBefore.toString())
    })

    it('mini node fails to create', async () => {
      let daiBalanceBefore = await daiToken.balanceOf(user1)
      let cuboBalanceBefore = await cuboToken.balanceOf(user1)

      await daiToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })
      await cuboToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })

      try {
        // insuficient tokens supplied
        await cuboDao.mintNode(user1, tokens('250'), tokens('0'), 1, { from: user1 })
      } catch {}

      const userAccount = await cuboDao.accounts.call(user1)
      assert.equal(userAccount.miniCount, 0)

      let daiBalanceAfter = await daiToken.balanceOf(user1)
      let cuboBalanceAfter = await cuboToken.balanceOf(user1)
      assert.equal(daiBalanceAfter.toString(), daiBalanceBefore.toString())
      assert.equal(cuboBalanceAfter.toString(), cuboBalanceBefore.toString())
    })

    it('mini node fails to create', async () => {
      let daiBalanceBefore = await daiToken.balanceOf(user1)
      let cuboBalanceBefore = await cuboToken.balanceOf(user1)

      await daiToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })
      await cuboToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })

      try {
        // insuficient tokens supplied
        await cuboDao.mintNode(user1, -1, -1, 1, { from: user1 })
      } catch {}

      const userAccount = await cuboDao.accounts.call(user1)
      assert.equal(userAccount.miniCount, 0)

      let daiBalanceAfter = await daiToken.balanceOf(user1)
      let cuboBalanceAfter = await cuboToken.balanceOf(user1)
      assert.equal(daiBalanceAfter.toString(), daiBalanceBefore.toString())
      assert.equal(cuboBalanceAfter.toString(), cuboBalanceBefore.toString())
    })

    it('mini node fails to create', async () => {
      let daiBalanceBefore = await daiToken.balanceOf(user1)
      let cuboBalanceBefore = await cuboToken.balanceOf(user1)

      await daiToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })
      await cuboToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })

      try {
        await cuboDao.mintNode(user1, tokens('250'), tokens('250'), 1, { from: teamMember1 })
        await cuboDao.mintNode(user1, tokens('250'), tokens('250'), 1, { from: teamMember2 })
        await cuboDao.mintNode(user1, tokens('250'), tokens('250'), 1, { from: owner })
      } catch {}

      const userAccount = await cuboDao.accounts.call(user1)
      assert.equal(userAccount.miniCount, 0)

      let daiBalanceAfter = await daiToken.balanceOf(user1)
      let cuboBalanceAfter = await cuboToken.balanceOf(user1)
      assert.equal(daiBalanceAfter.toString(), daiBalanceBefore.toString())
      assert.equal(cuboBalanceAfter.toString(), cuboBalanceBefore.toString())
    })

    it('mini node fails to create', async () => {
      let daiBalanceBefore = await daiToken.balanceOf(user1)
      let cuboBalanceBefore = await cuboToken.balanceOf(user1)

      await daiToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })
      await cuboToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })

      try {
        // insuficient tokens supplied
        await cuboDao.mintNode(user1, tokens('99.9'), tokens('99.9'), 0, { from: user1 })
      } catch {}

      const userAccount = await cuboDao.accounts.call(user1)
      assert.equal(userAccount.miniCount, 0)

      let daiBalanceAfter = await daiToken.balanceOf(user1)
      let cuboBalanceAfter = await cuboToken.balanceOf(user1)
      assert.equal(daiBalanceAfter.toString(), daiBalanceBefore.toString())
      assert.equal(cuboBalanceAfter.toString(), cuboBalanceBefore.toString())
    })
  })

  describe('User creates a node with a lot more tokens', async () => {
    it('mini node is created', async () => {
      let daiBalanceBefore = await daiToken.balanceOf(user1)
      let cuboBalanceBefore = await cuboToken.balanceOf(user1)
      assert.equal(daiBalanceBefore.toString(), tokens('9900'))
      assert.equal(cuboBalanceBefore.toString(), tokens('9900'))

      await daiToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })
      await cuboToken.approve(cuboDao.address, tokens('1000000'), { from: user1 })

      try {
        // double tokens supplied
        await cuboDao.mintNode(user1, tokens('500'), tokens('500'), 1, { from: user1 })
      } catch {}

      const userAccount = await cuboDao.accounts.call(user1)
      assert.equal(userAccount.miniCount, 1)

      let daiBalanceAfter = await daiToken.balanceOf(user1)
      let cuboBalanceAfter = await cuboToken.balanceOf(user1)
      assert.equal(daiBalanceAfter.toString(), tokens('9400'))
      assert.equal(cuboBalanceAfter.toString(), tokens('9400'))
    })
  })

  describe('User redeemes awarded OM', async () => {
    before(async () => {
      await daiToken.transfer(user2, tokens('1000'), { from: owner })
      await cuboToken.transfer(user2, tokens('1000'), { from: owner })
      // create nodes and give rewards to user2
      await daiToken.approve(cuboDao.address, tokens('1000000'), { from: user2 })
      await cuboToken.approve(cuboDao.address, tokens('1000000'), { from: user2 })

      await cuboDao.mintNode(user2, tokens('100'), tokens('100'), 0, { from: user2 }) // 1 OM rewards
      await cuboDao.mintNode(user2, tokens('250'), tokens('250'), 1, { from: user2 }) // 3 OM rewards

      await cuboDao.payInterest({ from: owner })
    })

    it('redeemed value is correct', async () => {
      let accountForAddress = await cuboDao.accounts.call(user2)
      assert.equal(accountForAddress.nanoCount, 1)
      assert.equal(accountForAddress.miniCount, 1)
      assert.equal(accountForAddress.kiloCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('4'))

      result = await cuboToken.balanceOf(user2)
      assert.equal(result.toString(), tokens('650'), 'pool OM wallet balance correct after minting node')

      await cuboDao.widthrawInterest(user2, { from: user2 })

      accountForAddress = await cuboDao.accounts.call(user2)
      assert.equal(accountForAddress.interestAccumulated, 0)

      result = await cuboToken.balanceOf(user2)
      assert.equal(result.toString(), tokens('654'), 'pool OM wallet balance correct after minting node')
    })

    it('can\'t redeem if there\'s nothing to redeem', async () => {
      let accountForAddress = await cuboDao.accounts.call(user2)
      assert.equal(accountForAddress.nanoCount, 1)
      assert.equal(accountForAddress.miniCount, 1)
      assert.equal(accountForAddress.kiloCount, 0)
      assert.equal(accountForAddress.interestAccumulated, tokens('0'))

      result = await cuboToken.balanceOf(user2)
      assert.equal(result.toString(), tokens('654'), 'pool OM wallet balance correct after minting node')

      try { await cuboDao.widthrawInterest(user2, { from: user2 }) }
      catch {}

      accountForAddress = await cuboDao.accounts.call(user2)
      assert.equal(accountForAddress.interestAccumulated, tokens('0'))

      result = await cuboToken.balanceOf(user2)
      assert.equal(result.toString(), tokens('654'), 'pool OM wallet balance correct after minting node')
    })

    // trying to hack redeemable OM
  })
})
