require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    matic_mumbai: {
      provider: () => new HDWalletProvider(process.env.MUMBAI_PRIVATE_KEY, process.env.MUMBAI_HOST_URI),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      gas: 6000000,
      gasPrice: 10000000000,
    },
    matic_mainnet: {
      provider: () => new HDWalletProvider(process.env.MAINNET_PRIVATE_KEY, process.env.MAINNET_HOST_URI),
      network_id: 137,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      gasPrice: 650000000000, // gasPrice: 650 Gwei
      // gas: 8500000, // default: 6700000
    },
  },
  compilers: {
    solc: {
      version: "0.8.10",
    }
  },
};
