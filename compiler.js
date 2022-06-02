const fs = require('fs');
const solc=require('solc');
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

const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
console.log('tempfile: ',tempFile)
const contractFile = tempFile.contracts["Adder.sol"]["Adder"];

module.exports=contractFile;