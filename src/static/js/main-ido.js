Main = {
  loading: false,
  contracts: {},

  toEth: (n) => {
    let toEther = web3.utils.fromWei(n, 'ether')
    return toEther //.slice(0, 3) + '.' + toMilli.slice(3)
  },
  toWei: (n) => {
    return web3.utils.toWei(n, 'ether')
  },
  load: async () => {
    Main.toggleLoadingScreen(true)
    await Main.loadWeb3(true)

    $walletBtn = $('#wallet')
    $walletBtn.on('click', async () => {
      await Main.loadWeb3(false)
    })
    await Main.setupMetamaskEvents()
    await Main.setupClickPay()
    await Main.setupClickAddTokenToWallet()
    await Main.setupClickChangeNetwork()

    await Main.toggleLoadingScreen(false)
    console.log('loading done!')
  },
  toggleLoadingScreen: async (load) => {
    if(load) {
      $('.loading').show()
      $('.content').hide()
    }
    else {
      $('.loading').hide()
      $('.content').show()
    }
  },
  setupMetamaskEvents: async () => {
    if(typeof(ethereum) === 'undefined') { return }

    ethereum.on('accountsChanged', async () => {
      Main.toggleLoadingScreen(true)
      window.location.reload()
    });

    ethereum.on('chainChanged', async () => {
      Main.toggleLoadingScreen(true)
      window.location.reload()
    });
  },
  loadContract: async () => {
    const cuboIdo = await $.getJSON('contracts/CuboIdo.json')
    Main.contracts.CuboIdo = TruffleContract(cuboIdo)
    Main.contracts.CuboIdo.setProvider(Main.web3Provider)

    const omega = await $.getJSON('contracts/Omega.json')
    Main.contracts.Omega = TruffleContract(omega)
    Main.contracts.Omega.setProvider(Main.web3Provider)

    // OX contract on mainnet
    const daiContractAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
    const ox = await $.getJSON('contracts/MainnetDai.json')
    Main.contracts.Ox = TruffleContract(ox)
    Main.contracts.Ox.setProvider(Main.web3Provider)

    // // DummyDAI contract on testnet
    // const daiContractAddress = '0xc67112C850964bFf0563D894130c02d6839A0EC2'
    // const ox = await $.getJSON('contracts/ExternalDai.json')
    // Main.contracts.Ox = TruffleContract(ox)
    // Main.contracts.Ox.setProvider(Main.web3Provider)

    // Mock OX contract locally
    // const ox = await $.getJSON('contracts/Ox.json')
    // Main.contracts.Ox = TruffleContract(ox)
    // Main.contracts.Ox.setProvider(Main.web3Provider)

    try {
      Main.cuboIdo = await Main.contracts.CuboIdo.deployed()
      Main.omega = await Main.contracts.Omega.deployed()
      // Mock OX contract locally
      // Main.ox = await Main.contracts.Ox.deployed()

      // DummyDAI / OX contract on testnet and mainnet
      Main.ox = await Main.contracts.Ox.at(daiContractAddress)
    }
    catch {
      $('#network-alert').show()
    }
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async (firstLoad) => {
    if (typeof web3 !== 'undefined') {
      Main.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      if(!firstLoad) { window.alert("Please connect to Metamask.") }
    }
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        if(!firstLoad) { await ethereum.enable() }
      } catch {}
    }
    else if (window.web3) {
      Main.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
    }

    if(typeof web3 !== 'undefined'){ Main.accountConnected() }
  },
  accounts: async () => {
    const acc = await web3.eth.getAccounts()
    return acc
  },
  accountConnected: async () => {
    let accounts = await Main.accounts()
    if(accounts.length > 0) {
      Main.account = accounts[0]
      let acc = accounts[0]
      $('#wallet-content').html(acc.slice(0, 5) + '...' + acc.slice(acc.length - 4, acc.length))

      await Main.loadContract()
      await Main.fetchAccountData()
    }
  },
  fetchAccountData: async () => {
    daiBalance = await Main.ox.balanceOf(Main.account)
    $('#ox-balance').html(Main.toEth(daiBalance.toString()))

    let allowanceDai = await Main.ox.allowance(Main.account, Main.cuboIdo.address)
    if(allowanceDai > 0) {
      $('#buy-omega').show()
    }
    else {
      $('#approve-ox').show()
    }
  },
  setupClickPay: async () => {
    $('#approve-ox').on('click', async (e) => {
      let amount = Main.toWei('100000000')
      Main.buttonLoadingHelper(e, 'approving...', async () => {
        await Main.ox.approve(Main.cuboIdo.address, amount, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Approving OX token...')
        })
      })
    })

    $('#buy-omega').on('click', async (e) => {
      Main.buttonLoadingHelper(e, 'buying OM...', async () => {
        let cuboAmount = $('#input-omega').val()
        if(cuboAmount < 1){
          alert('You must purchase at least 1 OM token')
          return
        }
        cuboAmount = Main.toWei(cuboAmount.toString())
        await Main.cuboIdo.sellCuboToken(Main.account, cuboAmount, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Transfering OM to your wallet...')
        })
      })
    })

    $('#input-omega').on('keyup', async (e) => {
      let cuboPrice = await Main.cuboIdo.pricePerCuboPercent()
      cuboPrice = parseFloat(cuboPrice.toString()) / 100
      let inputVal = parseFloat($(e.target).val())
      $('#ox-value').html(cuboPrice * inputVal)
    })
  },
  setupClickAddTokenToWallet: async () => {
    $('#add-token').on('click', async (e) => {
      Main.addTokenToWallet()
    })
  },
  addTokenToWallet: async () => {
    await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: Main.omega.address, // The address that the token is at.
          symbol: 'OM', // A ticker symbol or shorthand, up to 5 chars.
          decimals: 18 // The number of decimals in the token
        }
      }
    })
  },
  setupClickChangeNetwork: async () => {
    $('#change-network').on('click', async (e) => {
      Main.changeWalletNetwork()
    })
  },
  changeWalletNetwork: async () => {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params:[ { chainId: '0x89' } ]
    });
  },

  // helper functions
  buttonLoadingHelper: async (event, loadingText, callback) => {
    $btn = $(event.target)
    $btn.attr('disabled', 'disabled')
    $btn.html(loadingText)

    try {
      await callback()
    } catch {
      alert('There was a problem. Please check the values you inputed and try again.')
      window.location.reload()
    }
    window.location.reload()
  },
  handleTransaction: async (txHash, message) => {
    $('#create-node').modal('hide')
    $modal = $('#tx-alert')
    $modal.find('#tx-link').attr('href', 'https://polygonscan.com/tx/' + txHash)
    $modal.find('#tx-message').html(message)
    $modal.modal('show')
  },
}

$(() => {
  $(window).load(() => { Main.load() })
})
