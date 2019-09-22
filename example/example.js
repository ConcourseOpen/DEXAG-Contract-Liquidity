const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const request = require('request-promise');

const mnemonic = '';
const infuraMainnet = "";
const provider = new HDWalletProvider(mnemonic, infuraMainnet);

const web3 = new Web3(provider);

const BUYANDSEND = require('../build/contracts/BuyAndSend.json');
const BuyAndSendAddress = '0x0000000000000000000000000000000000000000'
const BuyAndSend = new web3.eth.Contract(BUYANDSEND.abi, BuyAndSendAddress);

const proxyAddress = '0x0000000000000000000000000000000000000000';
const token = 'DAI';
const tokenAddress = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359';
const amount = 1;
const receiver = '0x0000000000000000000000000000000000000000'

async function buyAndSend() {
    const options = {
        uri: `https://api.dex.ag/trade?from=eth&to=${token}&toAmount=${amount}&dex=best&proxy=${proxyAddress}`,
        json: true // Automatically parses the JSON string in the response
      };

    const accounts = await web3.eth.getAccounts();
    const dexAgResponse = await request(options);
    let { data, value } = dexAgResponse.trade
    let gasPrice = "10000000000";
    if (dexAgResponse.metadata.query.dex === 'bancor') {
    gasPrice = dexAgResponse.metadata.gasPrice;
    }
    
    BuyAndSend.methods.buyAndSend(data, receiver, tokenAddress)
        .send({ from: accounts[0], value: value, gasPrice: gasPrice})
        .on('transactionHash', (hash) => {
            console.log('hash: ', hash);
        })
        .on('receipt', (receipt) => {
            console.log('receipt: ', receipt);
        })
        .on('error', (error) => {
            console.log('error: ', error);
        });
}