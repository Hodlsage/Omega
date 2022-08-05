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

    await Main.setupClickCollect()
    await Main.setupClickMintNode()
    $walletBtn = $('#wallet')
    $walletBtn.on('click', async () => {
      await Main.loadWeb3(false)
    })

    await Main.setupClickProvideOmega()
    await Main.setupClickProvideOx()
    await Main.setupClickApproveOx()
    await Main.setupMetamaskEvents()
    await Main.setupClickAddTokenToWallet()
    await Main.setupClickChangeNetwork()

    $('#max-omega').on('click', Main.maxOmegaBtn)
    $('#max-ox').on('click', Main.maxOxBtn)
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
    const cuboDao = await $.getJSON('contracts/OmegaDao.json')
    Main.contracts.OmegaDao = TruffleContract(cuboDao)
    Main.contracts.OmegaDao.setProvider(Main.web3Provider)

    const omega = await $.getJSON('contracts/Omega.json')
    Main.contracts.Omega = TruffleContract(omega)
    Main.contracts.Omega.setProvider(Main.web3Provider)

    // OX contract on mainnet
    const daiContractAddress = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063'
    const ox = await $.getJSON('contracts/MainnetOx.json')
    Main.contracts.Ox = TruffleContract(ox)
    Main.contracts.Ox.setProvider(Main.web3Provider)

    // // DummyOX contract on testnet
    // const daiContractAddress = '0xc67112C850964bFf0563D894130c02d6839A0EC2'
    // const ox = await $.getJSON('contracts/ExternalOx.json')
    // Main.contracts.Ox = TruffleContract(ox)
    // Main.contracts.Ox.setProvider(Main.web3Provider)

    // Mock OX contract locally
    // const ox = await $.getJSON('contracts/Ox.json')
    // Main.contracts.Ox = TruffleContract(ox)
    // Main.contracts.Ox.setProvider(Main.web3Provider)

    try {
      Main.cuboDao = await Main.contracts.OmegaDao.deployed()
      Main.omega = await Main.contracts.Omega.deployed()
      // Mock OX contract locally
      // Main.ox = await Main.contracts.Ox.deployed()

      // DummyOX / OX contract on testnet and mainnet
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
      await Main.fetchGeneralData()
    }
  },
  fetchGeneralData: async () => {
    let totalNodes = await Main.cuboDao.totalNodes.call()
    $('#total-nodes').html(totalNodes.toString())

    let contractAccount = await Main.cuboDao.accounts(Main.account)
    let total = contractAccount.nanoCount.toNumber() * 200
    total += contractAccount.miniCount.toNumber() * 500
    total += contractAccount.kiloCount.toNumber() * 1000
    total += contractAccount.megaCount.toNumber() * 2000
    total += contractAccount.gigaCount.toNumber() * 10000
    $('#tlv').html('$' + total.toLocaleString('us'))

    let cuboPool = await Main.omega.balanceOf(Main.cuboDao.address)
    let formatedPoolAmount = parseInt(Main.toEth(cuboPool))
    $('#omega-pool').html(formatedPoolAmount.toLocaleString('us'))
    $('#ox-pool').html((total / 2).toLocaleString('us'))
  },
  fetchAccountData: async () => {
    // number of nodes
    let contractAccount = await Main.cuboDao.accounts(Main.account)
    let total = contractAccount.nanoCount.toNumber() + contractAccount.miniCount.toNumber() + contractAccount.kiloCount.toNumber() +
      contractAccount.megaCount.toNumber() + contractAccount.gigaCount.toNumber()

    let totalRewards = contractAccount.nanoCount.toNumber() * 1 + contractAccount.miniCount.toNumber() * 3 + contractAccount.kiloCount.toNumber() * 7 +
      contractAccount.megaCount.toNumber() * 16 + contractAccount.gigaCount.toNumber() * 100

    $('#nano-count').html(contractAccount.nanoCount.toNumber())
    $('#nano-rewards').html(contractAccount.nanoCount.toNumber() * 1)

    $('#mini-count').html(contractAccount.miniCount.toNumber())
    $('#mini-rewards').html(contractAccount.miniCount.toNumber() * 3)

    $('#kilo-count').html(contractAccount.kiloCount.toNumber())
    $('#kilo-rewards').html(contractAccount.kiloCount.toNumber() * 7)

    $('#mega-count').html(contractAccount.megaCount.toNumber())
    $('#mega-rewards').html(contractAccount.megaCount.toNumber() * 16)

    $('#giga-count').html(contractAccount.gigaCount.toNumber())
    $('#giga-rewards').html(contractAccount.gigaCount.toNumber() * 100)

    $('#total-count').html(total)
    $('#total-rewards').html(totalRewards)

    $('#num-nodes').html(total)

    // rewards accumulated
    let interestAccumulated = Main.toEth(contractAccount.interestAccumulated)
    $('#accumulated-interest').html(interestAccumulated + ' OM')

    if(parseFloat(interestAccumulated) == 0){
      $('#collect-omega').attr('disabled', 'disabled')
    }

    // wallet amount of OM
    cuboBalance = await Main.omega.balanceOf(Main.account)
    $('#omega-balance').html(Main.toEth(cuboBalance.toString()))

    // wallet amount of OX
    daiBalance = await Main.ox.balanceOf(Main.account)
    $('#ox-balance').html(Main.toEth(daiBalance.toString()))

    let allowanceOmega = await Main.omega.allowance(Main.account, Main.cuboDao.address)
    let allowanceOx = await Main.ox.allowance(Main.account, Main.cuboDao.address)

    if(allowanceOx > 0 && allowanceOmega > 0) {
      $('#collect-omega').show()
      $('#node-type-modal').show()
    }
    else if(allowanceOx == 0 && allowanceOmega > 0) {
      $('#collect-omega').show()
      $('#approve-ox').show()
      $('#approve-modal').show()
    }
    else if(allowanceOx > 0 && allowanceOmega == 0) {
      $('.approve-omega').show()
      $('#approve-modal').show()
    }
    else {
      $('#approve-ox').show()
      $('.approve-omega').show()
      $('#approve-modal').show()
    }

    $('#node-modal').removeAttr('disabled')
  },
  setupClickCollect: async () => {
    $('.approve-omega').on('click', async (e) => {
      let amount = Main.toWei('1000000')
      Main.buttonLoadingHelper(e, 'approving...', async () => {
        await Main.omega.approve(Main.cuboDao.address, amount, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Approving OM token...')
        })
      })
    })

    $('#collect-omega').on('click', async (e) => {
      Main.buttonLoadingHelper(e, 'collecting...', async () => {
        await Main.cuboDao.widthrawInterest(Main.account, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Collecting OM to your wallet...')
        })
      })
    })
  },
  setupClickProvideOmega: async () => {
    $('#provide-omega').on('click', async () => {
      let currentBalence = parseInt(Main.toEth(cuboBalance.toString()))
      let amountToProvide = parseInt($('#provide-omega').data('amount'))

      if(currentBalence >= amountToProvide){
        $('#input-omega').val(amountToProvide)
      }
    })
  },
  setupClickProvideOx: async () => {
    $('#provide-ox').on('click', async () => {
      let currentBalence = parseInt(Main.toEth(daiBalance.toString()))
      let amountToProvide = parseInt($('#provide-ox').data('amount'))

      if(currentBalence >= amountToProvide){
        $('#input-ox').val(amountToProvide)
      }
    })
  },
  setupClickApproveOx: async () => {
    $('#approve-ox').on('click', async (e) => {
      let amount = Main.toWei('100000000')
      Main.buttonLoadingHelper(e, 'approving...', async () => {
        await Main.ox.approve(Main.cuboDao.address, amount, { from: Main.account }).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Approving OX token...')
        })
      })
    })
  },
  setupClickMintNode: async () => {
    let cuboType, tokensVals

    $('#next-step-modal').on('click', async (e) => {
      cuboType = $('#omega-type').val()

      switch(cuboType) {
        case '0':
          tokensVals = 100
          break;
        case '1':
          tokensVals = 250
          break;
        case '2':
          tokensVals = 500
          break;
        case '3':
          tokensVals = 1000
          break;
        case '4':
          tokensVals = 5000
          break;
        default:
          alert('Something went wrong!')
      }

      $('#input-omega').attr('placeholder', tokensVals + ' OM')
      $('#provide-omega').attr('data-amount', tokensVals)
      $('#input-ox').attr('placeholder', tokensVals + ' OX')
      $('#provide-ox').attr('data-amount', tokensVals)
      $('.token-vals').html(tokensVals)
      $('#mint-node').attr('data-amount', tokensVals)
      $('#mint-node').attr('data-omega-type', cuboType)

      $('#node-type-modal').hide()
      $('#mint-modal').show()
    })

    $('#mint-node').on('click', async (e) => {
      let cuboAmount = $('#input-omega').val()
      let daiAmount = $('#input-ox').val()
      let amountToProvide = $(e.target).data('amount')
      let cuboType = $(e.target).data('omega-type')

      if(cuboAmount < amountToProvide || daiAmount < amountToProvide){
        alert('You need to provide ' + amountToProvide + ' OM and ' + amountToProvide + ' OX to mint a node')
        return
      }

      Main.buttonLoadingHelper(e, 'minting...', async () => {
        await Main.cuboDao.mintNode(
          Main.account,
          Main.toWei(cuboAmount),
          Main.toWei(daiAmount),
          cuboType,
          { from: Main.account }
        ).once("transactionHash", async (txHash) => {
          Main.handleTransaction(txHash, 'Minting Omega node...')
        })
      })
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
      alert('Something went wrong, please refresh and try again.')
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
  }
}

$(() => {
  $(window).load(() => { Main.load() })
})
