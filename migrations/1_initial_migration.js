const ForestNotary = artifacts.require("ForestNotary");

module.exports = function (deployer) {
  deployer.deploy(ForestNotary);
};
