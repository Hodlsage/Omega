const Omega = artifacts.require('Omega')
const Ox = artifacts.require('Ox')
const CuboIdo = artifacts.require('CuboIdo')

require('chai').use(require('chai-as-promised')).should()

function tokens(n) {
  return web3.utils.toWei(n, 'ether')
}

contract('CuboIdo', ([owner, teamMember1, buyer1, buyer2, buyer3]) => {
  let cuboToken, daiToken, cuboIdo
  let cuboPrice = 50 // OX

  before(async () => {
    cuboToken = await Omega.new()
    daiToken = await Ox.new()
    cuboIdo = await CuboIdo.new(cuboToken.address, daiToken.address, cuboPrice)

    cuboBalance = await cuboToken.balanceOf(owner)
    await cuboToken.transfer(cuboIdo.address, cuboBalance.toString(), { from: owner })
  })

  describe('Contract constructor', async () => {
    it('sets OM address', async () => {
      const cuboAddress = await cuboIdo.cuboAddress.call()
      assert.equal(cuboAddress, cuboToken.address)

      const daiAddress = await cuboIdo.daiAddress.call()
      assert.equal(daiAddress, daiToken.address)
    })

    it('has correct OM price', async () => {
      const cuboPrice = await cuboIdo.pricePerCuboPercent.call()
      assert.equal(cuboPrice, 50)
    })
  })

  describe('#sellCuboToken', async () => {
    before(async () => {
      await daiToken.transfer(buyer1, tokens('2000'), { from: owner })
    })

    it('buyer buys 100 OM tokens', async () => {
      const cuboAmountBefore = await cuboToken.balanceOf.call(buyer1)
      assert.equal(cuboAmountBefore, tokens('0'))
      const daiAmountBefore = await daiToken.balanceOf.call(buyer1)
      assert.equal(daiAmountBefore, tokens('2000'))

      await daiToken.approve(cuboIdo.address, tokens('10000'), { from: buyer1 })
      await cuboIdo.sellCuboToken(buyer1, tokens('100'), { from: buyer1 })

      const cuboAmountAfter = await cuboToken.balanceOf.call(buyer1)
      assert.equal(cuboAmountAfter, tokens('100'))
      const daiAmountAfter = await daiToken.balanceOf.call(buyer1)
      assert.equal(daiAmountAfter, tokens('1950'))
    })

    it('buyer buys 1000 OM tokens', async () => {
      const cuboAmountBefore = await cuboToken.balanceOf.call(buyer1)
      assert.equal(cuboAmountBefore, tokens('100'))
      const daiAmountBefore = await daiToken.balanceOf.call(buyer1)
      assert.equal(daiAmountBefore, tokens('1950'))

      await daiToken.approve(cuboIdo.address, tokens('10000'), { from: buyer1 })
      await cuboIdo.sellCuboToken(buyer1, tokens('1000'), { from: buyer1 })

      const cuboAmountAfter = await cuboToken.balanceOf.call(buyer1)
      assert.equal(cuboAmountAfter, tokens('1100'))
      const daiAmountAfter = await daiToken.balanceOf.call(buyer1)
      assert.equal(daiAmountAfter, tokens('1450'))
    })

    it('buyer buys 11.5 OM tokens', async () => {
      const cuboAmountBefore = await cuboToken.balanceOf.call(buyer1)
      assert.equal(cuboAmountBefore, tokens('1100'))
      const daiAmountBefore = await daiToken.balanceOf.call(buyer1)
      assert.equal(daiAmountBefore, tokens('1450'))

      await daiToken.approve(cuboIdo.address, tokens('10000'), { from: buyer1 })
      await cuboIdo.sellCuboToken(buyer1, tokens('11.5'), { from: buyer1 })

      const cuboAmountAfter = await cuboToken.balanceOf.call(buyer1)
      assert.equal(cuboAmountAfter, tokens('1111.5'))
      const daiAmountAfter = await daiToken.balanceOf.call(buyer1)
      assert.equal(daiAmountAfter, tokens('1444.25'))
    })
  })

  describe('#updatePrice', async () => {
    it('updates OM IDO price from 50 OX to 5 OX', async () => {
      const priceBefore = await cuboIdo.pricePerCuboPercent.call()
      assert.equal(priceBefore.toNumber(), 50)

      await cuboIdo.updatePrice(5, { from: owner }) // Value in cents! 0.05 OX

      const priceAfter = await cuboIdo.pricePerCuboPercent.call()
      assert.equal(priceAfter.toNumber(), 5)
    })

    it('updates OM IDO price from 5 OX to 100 OX', async () => {
      const priceBefore = await cuboIdo.pricePerCuboPercent.call()
      assert.equal(priceBefore.toNumber(), 5)

      await cuboIdo.updatePrice(100, { from: owner }) // Value in cents! 1 OX

      const priceAfter = await cuboIdo.pricePerCuboPercent.call()
      assert.equal(priceAfter.toNumber(), 100)
    })
  })

  describe('#withdrawCuboFromIdo', async () => {
    it('fails for non-owner', async () => {
      const daiAmountBefore = await cuboToken.balanceOf.call(cuboIdo.address)
      assert.equal(daiAmountBefore, tokens('998888.5'))

      try {
        await cuboIdo.withdrawCuboFromIdo(teamMember1, tokens('1000'), { from: teamMember1 })
      } catch {}

      const daiAmountAfter = await cuboToken.balanceOf.call(cuboIdo.address)
      assert.equal(daiAmountAfter, tokens('998888.5'))
    })

    it('withraw some OM from IDO contract', async () => {
      const cuboAmountBefore = await cuboToken.balanceOf.call(cuboIdo.address)
      assert.equal(cuboAmountBefore, tokens('998888.5'))

      await cuboIdo.withdrawCuboFromIdo(teamMember1, tokens('1000'), { from: owner })

      const cuboAmountAfter = await cuboToken.balanceOf.call(cuboIdo.address)
      assert.equal(cuboAmountAfter, tokens('997888.5'))

      const cuboAmountToAddress = await cuboToken.balanceOf.call(teamMember1)
      assert.equal(cuboAmountToAddress, tokens('1000'))
    })

    it('withraw all OM from IDO contract', async () => {
      const cuboAmountBefore = await cuboToken.balanceOf.call(cuboIdo.address)
      assert.equal(cuboAmountBefore, tokens('997888.5'))

      await cuboIdo.withdrawCuboFromIdo(teamMember1, cuboAmountBefore, { from: owner })

      const cuboAmountAfter = await cuboToken.balanceOf.call(cuboIdo.address)
      assert.equal(cuboAmountAfter, tokens('0'))

      const cuboAmountToAddress = await cuboToken.balanceOf.call(teamMember1)
      assert.equal(cuboAmountToAddress, tokens('998888.5'))
    })
  })

  describe('#withdrawDaiFromIdo', async () => {
    before(async () => {
      const initDaiAmount = await daiToken.balanceOf.call(owner)
      await daiToken.transfer(cuboIdo.address, initDaiAmount, { from: owner })
    })

    it('fails for non-owner', async () => {
      const daiAmountBefore = await daiToken.balanceOf.call(cuboIdo.address)
      assert.equal(daiAmountBefore, tokens('998555.75'))

      try {
        await cuboIdo.withdrawDaiFromIdo(user1, tokens('1000'), { from: user1 })
      } catch {}

      const daiAmountAfter = await daiToken.balanceOf.call(cuboIdo.address)
      assert.equal(daiAmountAfter, tokens('998555.75'))
    })

    it('withraw some OM from IDO contract', async () => {
      const daiAmountBefore = await daiToken.balanceOf.call(cuboIdo.address)
      assert.equal(daiAmountBefore, tokens('998555.75'))

      await cuboIdo.withdrawDaiFromIdo(teamMember1, tokens('1000'), { from: owner })

      const daiAmountAfter = await daiToken.balanceOf.call(cuboIdo.address)
      assert.equal(daiAmountAfter, tokens('997555.75'))

      const daiAmountToAddress = await daiToken.balanceOf.call(teamMember1)
      assert.equal(daiAmountToAddress, tokens('1000'))
    })

    it('withraw all OM from IDO contract', async () => {
      const daiAmountBefore = await daiToken.balanceOf.call(cuboIdo.address)
      assert.equal(daiAmountBefore, tokens('997555.75'))

      await cuboIdo.withdrawDaiFromIdo(teamMember1, daiAmountBefore, { from: owner })

      const daiAmountAfter = await daiToken.balanceOf.call(cuboIdo.address)
      assert.equal(daiAmountAfter, tokens('0'))

      const daiAmountToAddress = await daiToken.balanceOf.call(teamMember1)
      assert.equal(daiAmountToAddress, tokens('998555.75'))
    })
  })
})
