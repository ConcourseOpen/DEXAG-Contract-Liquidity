import React, { Component } from "react";
import BuyAndSendContract from "./contracts/BuyAndSend.json";
import getWeb3 from "./utils/getWeb3";
import * as request from "request-promise";
import Widget from "./Widget";
import * as Addresses from "./Addresses";

import "./App.css";

class App extends Component {
  state = { 
    storageValue: 0,
    web3: null, 
    accounts: null, 
    contract: null, 
    data: null ,
    amount: 1,
    token: 'dai',
    receiver: null,
    msg: null,
    widget: false,
    hash: null
  };

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
      this.setState({ web3, accounts, contract: instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  buyAndSend = async () => {
    const { accounts, contract } = this.state;
    if (!this.state.web3.utils.isAddress(this.state.receiver)) {
      alert('Invalid Address!');
      return;
    }

    const options = {
      uri: `https://api.dex.ag/trade?from=eth&to=${this.state.token}&toAmount=${this.state.amount}&dex=best&proxy=0xD3BeD3A8E3e6b24b740EAD108bA776e0Ad298588`,
      json: true // Automatically parses the JSON string in the response
    };
    const dexAgResponse = await request(options);
    let { data, value } = dexAgResponse.trade
    let gasPrice = "10000000000";
    if (dexAgResponse.metadata.query.dex === 'bancor') {
      gasPrice = dexAgResponse.metadata.gasPrice;
    }
    console.log(Addresses[this.state.token.toUpperCase()])
    contract.methods.buyAndSend(data, this.state.receiver, Addresses[this.state.token.toUpperCase()]).send({ from: accounts[0], value: value, gasPrice: gasPrice})
                    .on('transactionHash', (hash) => {
                      console.log('hash', hash);
                      this.setState({ hash: hash});
                      this.setWidget(
                      `TX mining: ${this.state.hash}`,
                        true
                      )
                    })
                    .on('receipt', (receipt) => {
                      console.log('receipt', receipt);
                      this.setWidget(
                        'TX Confirmed!',
                        true,
                        true
                      )
                    })
                    .on('error', (error) => {
                      console.log('error', error);
                      this.setWidget(
                        'Error!'+`${<a href={'https://etherscan.io/tx/'+this.state.hash}>{this.state.hash.substr(0,6)}.....</a>}`,                        true,
                        true
                      )
                    });
  };

  setWidget = (msg, visible, delay=false) => {
    this.setState({ msg: msg, widget: visible});
    if (delay) {
      setTimeout(this.setState({ msg: null, widget: false }), 1000)
    }
  }

  setAmount = (e) => {
    this.setState({ amount: e.target.value })
  }

  setReceiver = (e) => {
    this.setState({ receiver: e.target.value })
  }

  changeToken = (e) => {
    this.setState({ token: e.target.value })
  }

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
        <div>
          Send:
          <input type='number' onChange={(e) => this.setAmount(e)} value={this.state.amount}></input> 
          <select onChange={(e) => this.changeToken(e)}>
            <option value='dai'>DAI</option>
            <option value='mkr'>MKR</option>
            <option value='bat'>BAT</option>
            <option value='usdc'>USDC</option>
            <option value='tusd'>TUSD</option>
            <option value='rep'>REP</option>
            <option value='zrx'>ZRX</option>
          </select>
        </div>
        <div>
          To:
          <input type='text' onChange={(e) => this.setReceiver(e)}></input>
        </div>
        <div>
          <button onClick={(e) => this.buyAndSend()}>Go!</button>
        </div>
        <Widget msg={this.state.msg} visible={!!this.state.widget ? 'block' : 'none'}></Widget>
      </div>
    );
  }
}

export default App;
