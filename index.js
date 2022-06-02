const Web3 = require('web3');
const solc = require('solc');
const fs = require('fs');
const contractFile=require('./compiler')
// Get privatekey from environment
require('dotenv').config();
const privatekey = process.env.PRIVATE_KEY;

/*Define Provider */
const providerRPC={
    rinkeby: 'https://rinkeby.infura.io/v3/' + process.env.INFURA_ID
};
const web3 = new Web3(providerRPC.rinkeby);

const account = web3.eth.accounts.privateKeyToAccount(privatekey);
const account_from = {
  privateKey: privatekey,
  accountAddress: account.address,
};
// Get abi & bin
const bytecode = contractFile.evm.bytecode.object;
const abi = contractFile.abi;

/*
   -- Deploy Contract --
*/
const Transaction = async () => {
    console.log("====================Deploy Contract==================")
  // Create contract instance
  const deployContract = new web3.eth.Contract(abi);

  // Create Tx
  const deployTx = deployContract.deploy({
    data: bytecode,
    arguments: [0], // Pass arguments to the contract constructor on deployment(_initialNumber in Incremental.sol)
  });
  // Sign Tx
  const deployTransaction = await web3.eth.accounts.signTransaction(
    {
      data: deployTx.encodeABI(),
      gas: 9000000,
    },
    account_from.privateKey
  );

  const deployReceipt = await web3.eth.sendSignedTransaction(deployTransaction.rawTransaction);

  console.log(`Contract deployed at address: ${deployReceipt.contractAddress}`);

  const deployedBlockNumber = deployReceipt.blockNumber;
  
  console.log("=================Calling Contract Function(Read only)================")
  let adder= new web3.eth.Contract(abi,deployReceipt.contractAddress);
  let _getCount = await adder.methods.getCount().call();
  console.log(`The current count is:${_getCount}`)
  ;

  console.log("=============Calling Contract Function(Write)==================")
  const _amount =11;
  let _addAmount=adder.methods.Add(_amount);
  console.log(`Add ${_amount} to count`)
  //sign with pk
  let adderTransaction = await web3.eth.accounts.signTransaction(
      {
          to: deployReceipt.contractAddress,
          data:_addAmount.encodeABI(),
          gas: 9000000,
      },
      account_from.privateKey
  );
  const adderReceipt= await web3.eth.sendSignedTransaction(adderTransaction.rawTransaction);
  console.log(`Added successful with hash:${adderReceipt.transactionHash}`);

  _getCount=await adder.methods.getCount().call();
  console.log("After addeed count=",_getCount)
  console.log("==============Listen to Even============")
  const web3Socket = new Web3(new Web3.providers.WebsocketProvider('wss://rinkeby.infura.io/ws/v3/'+process.env.INFURA_ID))
      adder = new web3Socket.eth.Contract(abi,deployReceipt.contractAddress);
      adder.once('Adder',(error,event)=>{
          console.log('I am a onetime event listener, I\'m going to die now');
      })
      adder.events.Adder(()=>{console.log('I am a longlive event listener, I get an event now');})
      for(let step = 0; step<3;step++){
          adderTransaction= await web3.eth.accounts.signTransaction({
              to: deployReceipt.contractAddress,
              data: _addAmount.encodeABI(),
              gas: 9000000,
          },
          account_from.privateKey);
          await web3.eth.sendSignedTransaction(adderTransaction.rawTransaction);

          if (step == 2) {
            // clear all the listeners
            web3Socket.eth.clearSubscriptions();
            console.log('Clearing all the events listeners !!!!');
          }
      }

 console.log("================Get past events=================")
 const pastEvents=await adder.getPastEvents('Adder',{
     fromBlock: deployedBlockNumber,
     toBlock: 'latest',
 })
 pastEvents.map((event)=>{console.log(event)})

 console.log("===================Check transaction Error=================")
 adderTx=adder.methods.Add(5);
 adderTransaction = await web3.eth.accounts.signTransaction({
     to: deployReceipt.contractAddress,
     data:adderTx.encodeABI(),
     gas: 9000000,
 })
 await web3.eth
    .sendSignedTransaction(adderTransaction.rawTransaction)
    .on('error',console.error);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
Transaction()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });