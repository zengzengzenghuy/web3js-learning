let Web3 = require('web3');
let solc = require('solc');
let fs = require('fs');

// Get privatekey from environment
require('dotenv').config();
const privatekey = process.env.PRIVATE_KEY;

// Load contract
const source = fs.readFileSync('Adder.sol', 'utf8');

// compile solidity
const input = {
  language: 'Solidity',
  sources: {
    'Adder.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
};

console.log("1")
const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
console.log("tempFile ",tempFile)
console.log("2")
const contractFile = tempFile.contracts['Adder.sol']['Adder'];
console.log("3")
// Get bin & abi
const bytecode = contractFile.evm.bytecode.object;
const abi = contractFile.abi;
console.log("4")
// Create web3 with kovan provider，you can change kovan to other testnet
const web3 = new Web3('https://rinkeby.infura.io/v3/' + process.env.INFURA_ID);
console.log("5")
// Create account from privatekey
const account = web3.eth.accounts.privateKeyToAccount(privatekey);
const account_from = {
  privateKey: privatekey,
  accountAddress: account.address,
};

/*
   -- Deploy Contract --
*/
const Deploy = async () => {
  // Create contract instance
  const deployContract = new web3.eth.Contract(abi);
  console.log("6")
  // Create Tx
  const deployTx = deployContract.deploy({
    data: bytecode,
    arguments: [0], // Pass arguments to the contract constructor on deployment(_initialNumber in Incremental.sol)
  });
  console.log("7")
  // Sign Tx
  const deployTransaction = await web3.eth.accounts.signTransaction(
    {
      data: deployTx.encodeABI(),
      gas: 9000000,
    },
    account_from.privateKey
  );
  console.log("8")
  const deployReceipt = await web3.eth.sendSignedTransaction(deployTransaction.rawTransaction);

  // Your deployed contrac can be viewed at: https://kovan.etherscan.io/address/${deployReceipt.contractAddress}
  // You can change kovan in above url to your selected testnet.
  console.log(`Contract deployed at address: ${deployReceipt.contractAddress}`);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
Deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });