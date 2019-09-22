var BuyAndSend = artifacts.require("./BuyAndSend.sol");

var proxy = '';

module.exports = function(deployer) {
  deployer.deploy(BuyAndSend, proxy);
};
