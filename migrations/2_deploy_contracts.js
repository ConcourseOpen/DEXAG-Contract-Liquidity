var BuyAndSend = artifacts.require("./BuyAndSend.sol");

var proxy = '0xD3BeD3A8E3e6b24b740EAD108bA776e0Ad298588';

module.exports = function(deployer) {
  deployer.deploy(BuyAndSend, proxy);
};
