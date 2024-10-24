const RNSIPFSRegistry = artifacts.require("RNSIPFSRegistry");

module.exports = async function(deployer, network, accounts) {
  console.log("Starting deployment of RNSIPFSRegistry...");
  try {
    const defaultIpfsLink = "bafybeibcnb4bgoa46acdbhxpogpphfjut5i2ns4pcmwhql6npg4ii5os5m";
    const nftContractAddress = "0x0cc07f120dffdf507a6e983c54bcb402fc6bf716";
    
    await deployer.deploy(RNSIPFSRegistry, defaultIpfsLink, nftContractAddress);
    const instance = await RNSIPFSRegistry.deployed();
    console.log("RNSIPFSRegistry successfully deployed at address:", instance.address);
  
  } catch (error) {
    console.error("Error during RNSIPFSRegistry deployment:");
    console.error(error);
  }
};
