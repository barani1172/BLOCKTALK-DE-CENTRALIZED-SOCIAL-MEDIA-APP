const Web3 = require('web3');
const web3  = new Web3("https://rpc-mumbai.matic.today");

const Private_key = "768cca0285eb1a8e97748c8d4bf4efd79df0d5a09dd1f8fae6fb860e84cec274";
const from_Address = "0x48Edfa26C6Ef7c85A351CB1C193aCdFF58dC2669";
const to_Address = "0x4A9Df50763090b449620aA21A8143e26d3C0B13c";
const Web3 = require('web3');
if (typeof window.ethereum !== 'undefined') {
    alert('MetaMask is installed!');
    var web3 = new Web3(window.ethereum);
    async function asyncCall() {
        var accounts = await web3.eth.getAccounts();
        web3.eth.getBalance("0x4CC3Df6D15dEACDA7Ac5B01E5dDe0cb07Df1a1b3").then(alert);
    }
    asyncCall();
}
async function  poly_transaction(){
 
    var value = web3.utils.toWei('0.0001','ether');
    var signedTransaction = await web3.eth.accounts.signTransaction({
        to: to_Address,
        value: value,
        gas:200000
    },Private_key);

    web3.eth.sendSignedTransaction(signedTransaction.rawTransaction).then(
        (receipt)=>{
            console.log(receipt);
            console.log("contract at " + receipt.contractAddress );
        }
    )

}

poly_transaction();
