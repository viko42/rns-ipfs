const RNSIPFSRegistry = artifacts.require("RNSIPFSRegistry");
const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function(deployer, network, accounts) {
  // Adresse du proxy déployé précédemment
  const proxyAddress = "0x04bE67F8ECB7c28bC41e6D56f9FbBBBE3859526E";

  console.log("Starting upgrade of RNSIPFSRegistry...");
  try {
    // Mettre à jour le proxy avec la nouvelle implémentation
    const upgradedProxy = await upgradeProxy(proxyAddress, RNSIPFSRegistry, { deployer });
    
    console.log('Upgraded proxy address:', upgradedProxy.address);
    
    // Vérifier que l'adresse du proxy n'a pas changé
    if (proxyAddress === upgradedProxy.address) {
      console.log("Verification successful: Proxy address remained unchanged after upgrade.");
    } else {
      console.error("Verification failed: Proxy address changed after upgrade!");
    }

    // Vous pouvez ajouter ici d'autres vérifications ou initialisations si nécessaire

  } catch (error) {
    console.error("Error during upgrade:");
    console.error(error);
    throw error;
  }
};