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
      version: "0.8.28",
      settings: {
        evmVersion: "paris",
        optimizer: {
          enabled: true,
          runs: 200
        },
        debug: {
          revertStrings: "debug"
        }
      },
    }
  }
};
