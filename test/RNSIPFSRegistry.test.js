const RNSIPFSRegistry = artifacts.require("RNSIPFSRegistry");
const truffleAssert = require('truffle-assertions');

contract("RNSIPFSRegistry", function (accounts) {
  const [owner, user1, user2] = accounts;
  let rnsIPFSRegistry;

  beforeEach(async function () {
    rnsIPFSRegistry = await RNSIPFSRegistry.new({ from: owner });
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const contractOwner = await rnsIPFSRegistry.owner();
      assert.equal(contractOwner, owner, "Owner is not correctly set");
    });
  });

  describe("setIPFSHash", function () {
    it("Should allow setting IPFS hash for RNS", async function () {
      const rns = "example.ron";
      const ipfsHash = "QmXnnyufdzAWL5CqZ2RnSNgPbvCc1ALT73s6epPrRnZ1Xy";
      
      await rnsIPFSRegistry.setIPFSHash(rns, ipfsHash, { from: owner });
      const storedHash = await rnsIPFSRegistry.getIPFSHash(rns);
      assert.equal(storedHash, ipfsHash, "IPFS hash not correctly set");
    });

    it("Should emit IPFSUpdated event", async function () {
      const rns = "example.ron";
      const ipfsHash = "QmXnnyufdzAWL5CqZ2RnSNgPbvCc1ALT73s6epPrRnZ1Xy";
      
      const result = await rnsIPFSRegistry.setIPFSHash(rns, ipfsHash, { from: owner });
      truffleAssert.eventEmitted(result, 'IPFSUpdated', (ev) => {
        return ev.rns === rns && ev.ipfsHash === ipfsHash;
      });
    });

    // Note: Ce test échouera car la fonction isRNSOwner n'est pas encore implémentée correctement
    it("Should revert when non-owner tries to set IPFS hash", async function () {
      const rns = "example.ron";
      const ipfsHash = "QmXnnyufdzAWL5CqZ2RnSNgPbvCc1ALT73s6epPrRnZ1Xy";
      
      await truffleAssert.reverts(
        rnsIPFSRegistry.setIPFSHash(rns, ipfsHash, { from: user1 }),
        "Not the RNS owner"
      );
    });
  });

  describe("getIPFSHash", function () {
    it("Should return the correct IPFS hash for a given RNS", async function () {
      const rns = "example.ron";
      const ipfsHash = "QmXnnyufdzAWL5CqZ2RnSNgPbvCc1ALT73s6epPrRnZ1Xy";
      
      await rnsIPFSRegistry.setIPFSHash(rns, ipfsHash, { from: owner });
      const storedHash = await rnsIPFSRegistry.getIPFSHash(rns);
      assert.equal(storedHash, ipfsHash, "Returned IPFS hash is incorrect");
    });

    it("Should return an empty string for non-existent RNS", async function () {
      const rns = "nonexistent.ron";
      const storedHash = await rnsIPFSRegistry.getIPFSHash(rns);
      assert.equal(storedHash, "", "Should return empty string for non-existent RNS");
    });
  });
});
