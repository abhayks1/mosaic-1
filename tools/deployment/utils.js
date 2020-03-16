'use strict';

const fs = require('fs-extra');
const path = require('path');
const cliProgress = require('cli-progress');

const CONTRACT_BUILD_PATH = '../../build/contracts/';

const isAccountUnlocked = (web3, account) => web3.eth.accounts.wallet[account] !== undefined;

// Function to unlock the account.
const unlockAccount = (web3, keystorePath, passwordPath) => {
  if (!fs.existsSync(keystorePath)) {
    throw new Error(
      `Cannot read file at ${keystorePath}.`,
    );
  }
  const keystorePathFile = fs.readFileSync(keystorePath);
  const encryptedKeyStore = JSON.parse(keystorePathFile);

  if (!fs.existsSync(passwordPath)) {
    throw new Error(
      `Cannot read file at ${passwordPath}.`,
    );
  }

  try {
    const web3Account = web3.eth.accounts.decrypt(
      encryptedKeyStore,
      fs.readFileSync(passwordPath).toString().trim(),
    );
    web3.eth.accounts.wallet.add(web3Account);
  } catch (e) {
    throw new Error(
      `unlock account failed, Message ${e.message}`,
    );
  }
};

// Get the abi and bin data
const getMetadata = (contractName) => {
  const contractPath = path.join(
    __dirname,
    `${CONTRACT_BUILD_PATH}/${contractName}.json`,
  );

  if (!fs.existsSync(contractPath)) {
    throw new Error(
      `Cannot read file ${contractPath}.`
      + 'Truffle compile must be run before building the package.',
    );
  }
  console.log('reading abi for contract:', contractName, ' from path: ', contractPath);
  const contractFile = fs.readFileSync(contractPath);
  return JSON.parse(contractFile);
};

// Get the abi of the contract
const getABI = (contractName) => {
  const metaData = getMetadata(contractName);
  return metaData.abi;
};

// Get the bin of the contract
const getBIN = (contractName) => {
  const metaData = getMetadata(contractName);
  return metaData.bytecode;
};

const estimateGas = async (rawTx, deployer) => {
  console.log('estimating gas for deployer', deployer);
  const gasEstimation = await rawTx
    .estimateGas(
      { from: deployer },
    );
  return gasEstimation;
};

const send = async (rawTx, txOptions) => new Promise((resolve, reject) => {
  const progressBar = new cliProgress.SingleBar({
    format: '    Block confirmations: [{bar}] {percentage}% | {value}/{total}',
  });
  let transactionReceipt;
  rawTx.send(txOptions)
    .on('error', (error) => {
      progressBar.stop();
      reject(error);
    })
    .on('transactionHash', (transactionHash) => {
      console.log('    TransactionHash: ', transactionHash);
      progressBar.start(6, 0);
    })
    .on('confirmation', (confirmationNumber) => {
      if (confirmationNumber === 6) {
        progressBar.stop();
        resolve(transactionReceipt);
      }
      progressBar.increment(1);
    })
    .then((receipt) => {
      transactionReceipt = receipt;
    });
});

// Deploy contract.
const deployContract = (contract, txOptions) => new Promise((resolve, reject) => {
  contract.deploy().estimateGas((err, gas) => {
    if (err) {
      reject(err);
    } else {
      // eslint-disable-next-line no-param-reassign
      txOptions.gas = gas;
      send(contract.deploy(), txOptions)
        .then((receipt) => {
          resolve(receipt.options.address);
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
});

const deployProxy = async (rawTx, deployer) => {
  const estimatedGas = await estimateGas(rawTx, deployer);
  const transaction = {
    from: deployer,
    gas: estimatedGas,
  };
  const receipt = await send(rawTx, transaction);
  return receipt.events.ProxyCreation.returnValues.proxy;
};

const deploy = (
  web3,
  contractName,
  constructorParams,
  txOptions,
) => {
  const metaData = getMetadata(contractName);
  const contract = new web3.eth.Contract(metaData.abi);
  contract.options.data = metaData.bytecode;
  contract.options.arguments = constructorParams;
  return deployContract(contract, txOptions);
};

const estimateDeployment = async (
  web3,
  contractName,
  constructorParams,
) => new Promise((resolve, reject) => {
  const metaData = getMetadata(contractName);
  const contract = new web3.eth.Contract(metaData.abi);
  contract.options.data = metaData.bytecode;
  contract.options.arguments = constructorParams;
  contract
    .deploy()
    .estimateGas((err, gas) => {
      if (err) {
        console.log('Error while estimating the gas: ', err);
        reject(err);
      }
      resolve(gas);
    });
});

const sendTransaction = async (rawTx, deployer) => new Promise((resolve, reject) => {
  estimateGas(rawTx, deployer).then((estimatedGas) => {
    const transaction = {
      from: deployer,
      gas: estimatedGas,
    };

    send(rawTx, transaction)
      .then((receipt) => {
        resolve(receipt);
      })
      .catch((error) => {
        reject(error);
      });
  })
    .catch((error) => {
      reject(error);
    });
});


module.exports = {
  isAccountUnlocked,
  unlockAccount,
  getMetadata,
  getABI,
  getBIN,
  deployContract,
  deployProxy,
  deploy,
  estimateDeployment,
  estimateGas,
  sendTransaction,
};
