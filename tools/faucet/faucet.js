'use strict';

const axios = require('axios');

const AUXILIARY_CHAIN = '1405';
const FAUCET_URL = 'https://faucet.mosaicdao.org';

const fundAccount = async (account) => {
  console.log(`Funding ${account}`);
  try {
    const response = await axios.post(
      FAUCET_URL,
      {
        beneficiary: `${account}@${AUXILIARY_CHAIN}`,
      },
    );
    console.log(`Transaction hash is ${response.data.txHash}`);
    console.log(`https://view.mosaicdao.org/tx/${response.data.txHash}/internal_transactions`);
  } catch (error) {
    console.log('Failed to fund the address.');
  }
};

const run = async () => {
  if (process.argv.length !== 3) {
    console.log('Invalid command');
    console.log('Please use valid command:');
    console.log('  npm run tool:fund:hadapsar <account>'); 
  }
  await fundAccount(process.argv[2]);
};

run();
