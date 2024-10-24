const RNSIPFSRegistry = artifacts.require("RNSIPFSRegistry");

module.exports = async function(deployer, network, accounts) {
  console.log("Starting deployment of RNSIPFSRegistry...");
  try {
    const defaultIpfsLink = "bafybeictek24m2xoh33zq66v4ujf7i7gpw53pxnf7rz7gvhjamjzejz3de";
    const nftContractAddress = "0x0cc07f120dffdf507a6e983c54bcb402fc6bf716";
    
    await deployer.deploy(RNSIPFSRegistry, defaultIpfsLink, nftContractAddress);
    const instance = await RNSIPFSRegistry.deployed();
    console.log("RNSIPFSRegistry successfully deployed at address:", instance.address);
  
  } catch (error) {
    console.error("Error during RNSIPFSRegistry deployment:");
    console.error(error);
  }
};
