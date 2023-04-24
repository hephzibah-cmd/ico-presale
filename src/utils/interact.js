
require('dotenv').config();

const INFURAKEY = process.env.KEY;

const Web3 = require('web3');
/*
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);
*/
//const web3 = new Web3(`https://polygon-mumbai.infura.io/v3/${INFURAKEY}`);
const web3 = new Web3(`https://polygon-mumbai.infura.io/v3/ad6b3a00b3a848e1a3d78f824694b064`);


const contractABI = require('../presale.json')
const contractAddress = "0x86E01980F4EC6313F1a5e6d048D4D5453556F42D";

//const { pinJSONToIPFS } = require('./pinata.js');
const BN = require('bn.js');

export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_requestAccounts",
            })
            const obj = {
                status: "👆🏽 Write a message in the text-field above.",
                address: addressArray[0]
            };
            return obj;
        } catch (err) {
            return {
              address: "",
              status: "😥 " + err.message,
            };
        }
    } else {
        return {
            address: "",
            status: (
              <span>
                <p>
                  {" "}
                  🦊{" "}
                  <a target="_blank" href={`https://metamask.io/download.html`}>
                    You must install Metamask, a virtual Ethereum wallet, in your
                    browser.
                  </a>
                </p>
              </span>
            ),
        };
    }
}

export const getCurrentWalletConnected = async () => {
    if (window.ethereum) {
        try {
            const addressArray = await window.ethereum.request({
                method: "eth_accounts"
            });
            if (addressArray.length > 0) {
                return {
                    address: addressArray[0],
                    status: "👆🏽 Put ETH Amount in the text-field above.",
                }
            } else {
                return {
                    address: "",
                    status: "🦊 Connect to Metamask using the top right button.",
                }
            }
        } catch(err) {
            return {
                address: "",
                status: "😥 " + err.message
            }
        }
    } else {
        return {
          address: "",
          status: (
            <span>
              <p>
                {" "}
                🦊{" "}
                <a target="_blank" href={`https://metamask.io/download.html`}>
                  You must install Metamask, a virtual Ethereum wallet, in your
                  browser.
                </a>
              </p>
            </span>
          ),
        };
      }
}

export const getTotalRaisedAmount = async () => {
    let bnbAmount = await web3.eth.getBalance(contractAddress);
    bnbAmount = web3.utils.fromWei(bnbAmount, 'ether');
    return bnbAmount;
}

export const buyToken = async (bnbAmount) => {
    window.contract = await new web3.eth.Contract(contractABI, contractAddress);//loadContract();
    console.log("bnbAmount =", bnbAmount);
    bnbAmount = (new BN(parseInt(bnbAmount*1000)).mul(new BN(10).pow(new BN(15))));
    //bnbAmount = bnbAmount * 1000_000_000_000_000_000;
    //console.log("bnbAmount =", bnbAmount.toString());
    //set up your Ethereum transaction
    const transactionParameters = {
        to: contractAddress, // Required except during contract publications.
        from: window.ethereum.selectedAddress, // must match user's active address.
        'data': window.contract.methods.buyTokens().encodeABI(), //make call to NFT smart contract 
        'value': bnbAmount.toString(16)
    };

    //sign transaction via Metamask
    try {
        const txHash = await window.ethereum
            .request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
        return {
            success: true,
            status: "✅ Check out your transaction on mumbaiscan: https://mumbai.polygonscan.com/tx/" + txHash
        }
    } catch (error) {
        return {
            success: false,
            status: "😥 Something went wrong: " + error.message
        }
    }
}


