import React, { Component } from "react";
import BuyAndSendContract from "./contracts/BuyAndSend.json";
import getWeb3 from "./utils/getWeb3";
import * as request from "request-promise";

import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null, data: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = BuyAndSendContract.networks[networkId];
      const instance = new web3.eth.Contract(
        BuyAndSendContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;

    const options = {
      uri: 'https://api.dex.ag/trade?from=eth&to=dai&toAmount=1&dex=oasis&proxy=0xD3BeD3A8E3e6b24b740EAD108bA776e0Ad298588',
      json: true // Automatically parses the JSON string in the response
    };
    const dexAgResponse = await request(options);
    let { data, value } = dexAgResponse.trade
    console.log(dexAgResponse)
    let gasPrice = "2000000000";
    if (dexAgResponse.metadata.query.dex === 'bancor') {
      gasPrice = dexAgResponse.metadata.gasPrice;
    }

    await contract.methods.buyAndSend(data, accounts[0], '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359')
                    .estimateGas({ from: '0xd0C81E82AbDdF29C6505d660f5bEBe60CDFf03c5', value: value}, (error,amt) => {
                      console.log(amt);
                    });
    contract.methods.buyAndSend(data, accounts[0], '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359').send({ from: accounts[0], value: value, gasPrice: gasPrice})
                    .on('transactionHash', (hash) => {
                      console.log(hash);
                    })
                    .on('receipt', (receipt) => {
                      console.log(receipt);
                    })
                    .on('error', (error) => {
                      console.log(error);
                    });

    // Update state with the result.
    this.setState({ data: dexAgResponse.trade.data });
  };



  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Buy and Send</h1>
        <p>
          Address: {this.state.accounts[0]} <br />
        </p>
        <h2></h2>
      </div>
    );
  }
}

export default App;
