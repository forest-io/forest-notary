const truffleAssert = require("truffle-assertions");
const ForestNotary = artifacts.require("ForestNotary");

contract("ForestNotary test", async accounts => {
  let notary;
  const forestName = web3.utils.asciiToHex("kongo");

  beforeEach(async () => {
    notary = await ForestNotary.new();
  });

  it("sets owner", async () => {
    const owner = await notary.owner();

    assert.equal(owner, accounts[0]);
  });

  describe("#registerForest", async () => {
    it("increases forestsCount", async () => {
      assert.equal(await notary.forestsCount(), 0);

      await notary.registerForest(forestName);

      assert.equal(await notary.forestsCount(), 1);
    });

    it("adds forest to registry", async () => {
      await notary.registerForest(forestName);

      const forest = await notary.forests(forestName);
      const block = await web3.eth.getBlock("latest");
      // The incoming string or bytes are padded to bytes32
      assert.equal(web3.utils.hexToAscii(forest.name), "kongo" + "\u0000".repeat(27));
      assert.equal(forest.verificationsCount.toNumber(), 0);
      assert.equal(forest.createdAt.toNumber(), block.timestamp);
    });

    it("emits ForestRegistered event", async () => {
      await notary.registerForest(forestName);

      const events = await notary.getPastEvents('ForestRegistered');
      assert.equal(events.length, 1)
    });

    it("fails when called by non-owner", async () => {
      await truffleAssert.reverts(
        notary.registerForest(forestName, { from: accounts[1] }),
        "The sender is not the owner"
      );
    });

    it("fails when forest name is already present", async () => {
      await notary.registerForest(forestName);
      await truffleAssert.reverts(
        notary.registerForest(forestName),
        "The forest is already registered"
      );
    });
  });

  describe("#addVerification", async () => {
    beforeEach(async () => {
      await notary.registerForest(forestName);
    });

    it("adds verification to registry", async () => {
      await notary.addVerification(forestName, 123, 1649683497);
      await notary.addVerification(forestName, 124, 1649683498);

      const block = await web3.eth.getBlock("latest");
      const verification = await notary.getVerification(forestName, 1);
      assert.equal(verification.value, 124);
      assert.equal(verification.acquiredAt, 1649683498);
      assert.equal(verification.createdAt, block.timestamp);
    });

    it("emits ForestVerificationAdded event", async () => {
      await notary.addVerification(forestName, 123, 1649683497);

      const events = await notary.getPastEvents('ForestVerificationAdded');
      assert.equal(events.length, 1)
    });

    it("fails when called by non-owner", async () => {
      await truffleAssert.reverts(
        notary.addVerification(forestName, 123, 1649683497, { from: accounts[1] }),
        "The sender is not the owner"
      );
    });

    it("fails when forest is not registered", async () => {
      const unknownForestName = web3.utils.asciiToHex("kamerun");
      await truffleAssert.reverts(
        notary.addVerification(unknownForestName, 123, 1649683497),
        "The forest is not registered"
      );
    });
  });
});
