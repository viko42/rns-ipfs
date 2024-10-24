const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

const pk = process.env.PRIVATE_KEY;

module.exports = {
  networks: {
    saigon: {
      provider: () => new HDWalletProvider(pk, 'https://saigon-testnet.roninchain.com/rpc'),
      network_id: 2021,
      confirmations: 2,
      timeoutBlocks: 500,
      skipDryRun: true,
      networkCheckTimeout: 1000000,
      deploymentPollingInterval: 10000,
      gasPrice: 20000000000,
    },
  },
  compilers: {
    solc: {
      version: "0.8.20",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "istanbul"
      }
    }
  }
};
