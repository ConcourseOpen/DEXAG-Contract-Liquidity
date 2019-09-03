import Web3 from "web3";

const estimateGas = (address, data) => {
  return new Promise(async (resolve, reject) => {
    web3.eth.getAccounts().then((accounts) => {
      web3.eth.estimateGas({
        to: address,
        from: accounts[0],
        data: data
      })
      .then((gasEstimate) => {
        console.log(gasEstimate);
        resolve(gasEstimate);
      });
    })
  });
}

export default estimateGas;