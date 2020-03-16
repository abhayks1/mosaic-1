# Deployment of gateways on the gen0 testnet/chains.

The new ERC20 gateways that are designed for generation 1 testnet/chains can also be deployed on the generation 0 testnet/chains.

In this example, we can consider deployment of ERC20 gateways on `Hadapsar` testnet i.e `Goerli` as origin chain and `1405` as an auxiliary chain.

The master copies of the following contracts are deployed.
- Origin chain
    - `ERC20Gateway`
    - `ProxyDeployer`
- Auxiliary chain
    - `Gen0ERC20Cogateway`
    - `UtilityToken`
    - `ProxyDeployer`
The following proxy contracts are deployed using the `ProxyDeployer` contracts.
- Origin chain
    - `ERC20Gateway` proxy contract
- Auxiliary chain
    - `Gen0ERC20Cogateway` proxy contract.

## Here is a quick guide on how to deploy the gateways

1. **Checkout Project**
    Checkout Mosaic-1 contracts from the Github
    - Open terminal, clone the project.
        ```bash
        git clone https://github.com/mosaicdao/mosaic-1.git
        ```
    - Navigate into the project directory
        ```bash
        cd mosaic-1
        ```
    - Install packages
        ```node
        npm install
        ```
1. **Create ethereum account.**
    Two ethereum account will be required for deployment of contract, one for the origin chain and one for the auxiliary chain. Create an encrypted Keystore file and a password file.

    An ethereum account can be created as follows:
    - Run the npm create account command
        ```node
        npm run tool:create:account
        ```
    - It will ask for the password and hit enter, please type the password. Remember this password as it will be required for unlocking the account.
    - It will ask for the path where the Keystore path will be created, enter the path. Below is the screenshot of the terminal.
    ![](https://i.imgur.com/eCh1UuT.png)

1. **Fund ethereum account.**
    Fund the newly created accounts. Faucets can be used to get the funds in the accounts.
    - Fund account with ethers on the Goerli chain.
      Use one of the following faucets
      https://goerli-faucet.slock.it/
      https://faucet.goerli.mudit.blog/
    - Fund account with OST'
      Use the faucet to fund
      ```js
      npm run tool:fund:hadapsar <account>
      ```
      For example:
      ```js
      npm run tool:fund:hadapsar 0x03e361330Cfe9e29A8dD29949D83852Cd9E6B5D1
      ```
      ![](https://i.imgur.com/yX7CPS0.png)
        - The transaction details can be seen on the [explorer](https://view.mosaicdao.org). 
1. **The manifest file.**
    - Update the following in the manifest file. The manifest file for the `Hadapsar` testnet is available [here](https://)
        ```yaml
        # Chain id 
        chain id:
          origin: '5'
          auxiliary: '1405'

        # Ethereum node endpoints, 
        ethereum node endpoints:
          origin: 'https://rpc.slock.it/goerli'
          auxiliary: 'https://chain.mosaicdao.org/hadapsar'

        # Ethereum account to deploy the contracts.  
        deployer address:
          origin: '0x18e4226843f4De5bff4F12ba17E8029abAf794Bf'
          auxiliary: '0x18e4226843f4De5bff4F12ba17E8029abAf794Bf'

        # File path of encrypyed keystore file and its password.
        accounts:
          - '0x03e361330Cfe9e29A8dD29949D83852Cd9E6B5D1':
              keystore path: tools/0x03e361330Cfe9e29A8dD29949D83852Cd9E6B5D1.json
              keystore password: tools/0x03e361330Cfe9e29A8dD29949D83852Cd9E6B5D1.password
        ```
    - The public endpoint for the Goerli and Hadapsar chains
        - https://rpc.slock.it/goerli
        - https://chain.mosaicdao.org/hadapsar

1. **Deploy the master copy of contracts**
    - Use the npm command to deploy the contracts.
      ```js
       npm run tool:deploy:gateway mastercopy <manifest_file_path/hadapsar/localhost>
      ```
      - example:
          ```
          npm run tool:deploy:gateway mastercopy hadapsar
          ```
    - The output of this command will appear as below
        ![](https://i.imgur.com/lq7NZcr.png)
    - This command will deploy the master copy contracts and update the manifest file with the deployed master copy contract addresses. Below is the example that will be appended in the manifest file.
        ```yaml
        master copy contracts:
          origin:
            anchor: '0x4fDF26dc9a99D11FfB39a2d88a7E39E49544602a'
            erc20 gateway: '0xF94AB7001DdE021d5D3BAf34B99438f7170Ae696'
            proxy deployer: '0x1567c8ef052f7d6DC185C24b41E6e9DB08053b14'
          auxiliary:
            anchor: '0x2Bbe4DFb364e76dA987Ac5754bB87b476cC6D80B'
            utility token: '0x882b56A390119455Ad109bc1288ec8aAE8BF3931'
            erc20 cogateway: '0xDaE8f05FB3fac567cb5e8cA2aC2797e1965eE03C'
            proxy deployer: '0x223036631e25D67cc932F0c91B8F8D0383E5eea2'
        ```
1. **Deploy proxy contracts**
    - Use the npm command to deploy the proxy contracts.
      ```js
       npm run tool:deploy:gateway proxy <manifest_file_path/hadapsar/localhost>
      ```
      - example:
          ```
          npm run tool:deploy:gateway proxy hadapsar
          ```
    - The output of this command will appear as below
        ![](https://i.imgur.com/VH2Lg2B.png)

    - This command will deploy the proxy contracts and update the manifest file with the deployed proxy contract addresses. Below is the example that will be appended in the manifest file.
        ```yaml
        proxy contracts:
          origin:
            erc20 gateway: '0x1567c8ef052f7d6DC185C24b41E6e9DB08053b14'
          auxiliary:
            erc20 cogateway: '0x223036631e25D67cc932F0c91B8F8D0383E5eea2'
        ```