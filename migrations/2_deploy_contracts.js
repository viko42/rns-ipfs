const RNSIPFSRegistry = artifacts.require("RNSIPFSRegistry");
const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

module.exports = async function(deployer, network, accounts) {
  const defaultIpfsLink = "bafybeictek24m2xoh33zq66v4ujf7i7gpw53pxnf7rz7gvhjamjzejz3de";
  const nftContractAddress = "0x0cc07f120dffdf507a6e983c54bcb402fc6bf716";

  console.log("Starting deployment of RNSIPFSRegistry using deployProxy...");
  try {
    // Déployer le proxy et l'implémentation en une seule étape
    const proxy = await deployProxy(RNSIPFSRegistry, [defaultIpfsLink, nftContractAddress], { deployer });

    console.log('Proxy deployed at:', proxy.address);
    
    // Vérifier l'état initial
    const storedIpfsLink = await proxy.defaultIpfsLink();
    console.log("Current default IPFS link:", storedIpfsLink);

    // Simuler une mise à jour
    console.log("Simulating an upgrade...");
    const upgradedProxy = await upgradeProxy(proxy.address, RNSIPFSRegistry, { deployer });
    
    console.log('Upgraded proxy address:', upgradedProxy.address);
    
    // Vérifier que l'adresse du proxy n'a pas changé
    if (proxy.address === upgradedProxy.address) {
      console.log("Verification successful: Proxy address remained unchanged after upgrade.");
    } else {
      console.error("Verification failed: Proxy address changed after upgrade!");
    }

  } catch (error) {
    console.error("Error during deployment or upgrade:");
    console.error(error);
    throw error;
  }
};
