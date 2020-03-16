'use strict';

const Web3 = require('web3');

const Config = require('./config/config');
const Utils = require('./utils');

const UTILITY_TOKEN_CONTRACT = 'UtilityToken';
const ERC20_GATEWAY_CONTRACT = 'ERC20Gateway';
const GEN0_ERC20_COGATEWAY_CONTRACT = 'Gen0ERC20Cogateway';
const PROXY_DEPLOYER_CONTRACT = 'ProxyDeployer';

class MasterCopyDeployer {
  constructor(configPath) {
    this.config = new Config(configPath);

    this.web3Origin = new Web3(this.config.originEndpoint());
    this.web3Auxiliary = new Web3(this.config.auxiliaryEndpoint());

    this.originDeployer = this.config.originDeployer();
    this.auxiliaryDeployer = this.config.auxiliaryDeployer();
  }

  async isGasAvailableForDeploymentOnOrigin() {
    console.info(`\n  • Verifying balance of ${this.originDeployer} on origin chain`);

    const erc20gatewayGas = await Utils.estimateDeployment(
      this.web3Origin,
      ERC20_GATEWAY_CONTRACT,
      [],
    );

    const proxyDeploymentGas = await Utils.estimateDeployment(
      this.web3Origin,
      PROXY_DEPLOYER_CONTRACT,
      [],
    );

    const deployerBalance = await this.web3Origin.eth.getBalance(this.originDeployer);

    const totalRequiredGas = (erc20gatewayGas + proxyDeploymentGas);
    const isGasAvailable = deployerBalance >= totalRequiredGas;
    if (!isGasAvailable) {
      console.log(`    ❌ Insufficient gas for deployment, please fund ${this.originDeployer} address with ${totalRequiredGas} on origin chain`);
    } else {
      console.log(`    ✓ ${this.originDeployer} has sufficient balance on origin chain.`);
    }
    return isGasAvailable;
  }

  async isGasAvailableForDeploymentOnAuxiliary() {
    console.info(`\n  • Verifying balance of ${this.auxiliaryDeployer} on auxiliary chain`);
    const utilityTokenGas = await Utils.estimateDeployment(
      this.web3Auxiliary,
      UTILITY_TOKEN_CONTRACT,
      [],
    );

    const gen0ERC20CogatewayGas = await Utils.estimateDeployment(
      this.web3Auxiliary,
      GEN0_ERC20_COGATEWAY_CONTRACT,
      [],
    );

    const proxyDeploymentGas = await Utils.estimateDeployment(
      this.web3Auxiliary,
      PROXY_DEPLOYER_CONTRACT,
      [],
    );

    const deployerBalance = await this.web3Auxiliary.eth.getBalance(this.auxiliaryDeployer);

    const totalRequiredGas = (utilityTokenGas + gen0ERC20CogatewayGas + proxyDeploymentGas);
    const isGasAvailable = deployerBalance >= totalRequiredGas;
    if (!isGasAvailable) {
      console.log(`    ❌ Insufficient gas for deployment, please fund ${this.auxiliaryDeployer} address with ${totalRequiredGas} on auxiliary chain`);
    } else {
      console.log(`    ✓ ${this.auxiliaryDeployer} has sufficient balance on auxiliary chain.`);
    }
    return isGasAvailable;
  }

  async isGasAvailableForDeployment() {
    console.info('\n‣ Verifying account balances.');
    const isGasAvailableForOriginDeployment = await this.isGasAvailableForDeploymentOnOrigin();
    const isGasAvailableForAuxiliaryDeployment = await this.isGasAvailableForDeploymentOnAuxiliary();
    return isGasAvailableForOriginDeployment && isGasAvailableForAuxiliaryDeployment;
  }

  unlockAccount() {
    console.info('\n‣ Unlocking accounts.');
    console.info(`\n  • Unlocking ${this.originDeployer} account on origin chain.`);
    if (!Utils.isAccountUnlocked(this.web3Origin, this.originDeployer)) {
      try {
        Utils.unlockAccount(
          this.web3Origin,
          this.config.keyStorePath(this.originDeployer),
          this.config.keyStorePasswordPath(this.originDeployer),
        );
      } catch (error) {
        console.log(`    ❌ failed to unlock ${this.originDeployer}`);
        console.log(`    ${error}`);
        return false;
      }
    }
    console.log(`    ✓ ${this.originDeployer} account unlocked on origin chain.`);

    console.info(`\n  • Unlocking ${this.auxiliaryDeployer} account on auxiliary chain.`);
    if (!Utils.isAccountUnlocked(this.web3Auxiliary, this.auxiliaryDeployer)) {
      try {
        Utils.unlockAccount(
          this.web3Auxiliary,
          this.config.keyStorePath(this.auxiliaryDeployer),
          this.config.keyStorePasswordPath(this.auxiliaryDeployer),
        );
      } catch (error) {
        console.log(`    ❌ failed to unlock ${this.auxiliaryDeployer}`);
        console.log(`    ${error}`);
        return false;
      }
    }
    console.log(`    ✓ ${this.auxiliaryDeployer} account unlocked on auxiliary chain.`);
    return true;
  }

  static async deployMasterCopy(contract, web3, deployer) {
    console.info(`\n  • Deploying ${contract} contract.`);
    try {
      const masterCopyAddress = await Utils.deploy(
        web3,
        contract,
        [],
        { from: deployer },
      );
      console.log(`    ✓ Master copy of ${contract} contract is deployed at: `, masterCopyAddress);
      return masterCopyAddress;
    } catch (error) {
      console.log(`    ❌ Failed to deploy ${contract} contract`);
      console.log(`    ${error}`);
      return null;
    }
  }

  static async deployProxyDeployerContract(contract, web3, deployer) {
    console.info(`\n  • Deploying ${contract} contract.`);
    try {
      const proxyDeployerContractAddress = await Utils.deploy(
        web3,
        contract,
        [],
        { from: deployer },
      );
      console.log(`    ✓ ${contract} contract is deployed at: `, proxyDeployerContractAddress);
      return proxyDeployerContractAddress;
    } catch (error) {
      console.log(`    ❌ Failed to deploy ${contract} contract`);
      console.log(`    ${error}`);
      return null;
    }
  }

  async deploy() {
    if (!await this.isGasAvailableForDeployment()) {
      return;
    }

    if (!await this.unlockAccount()) {
      return;
    }

    console.info('\n‣ Deploying master copy contracts on auxiliary chain.');

    const utilityTokenMasterCopyAddress = await MasterCopyDeployer.deployMasterCopy(
      UTILITY_TOKEN_CONTRACT,
      this.web3Auxiliary,
      this.auxiliaryDeployer,
    );
    if (utilityTokenMasterCopyAddress !== null) {
      this.config.updateUtilityTokenMasterCopyAddress(utilityTokenMasterCopyAddress);
    } else {
      return;
    }

    const gen0ERC20CogatewayMasterCopyAddress = await MasterCopyDeployer.deployMasterCopy(
      GEN0_ERC20_COGATEWAY_CONTRACT,
      this.web3Auxiliary,
      this.auxiliaryDeployer,
    );
    if (gen0ERC20CogatewayMasterCopyAddress !== null) {
      this.config.updateERC20CogatewayMasterCopyAddress(gen0ERC20CogatewayMasterCopyAddress);
    } else {
      return;
    }

    console.info('\n‣ Deploying master copy contracts on origin chain.');

    const erc20GatewayMasterCopyAddress = await MasterCopyDeployer.deployMasterCopy(
      ERC20_GATEWAY_CONTRACT,
      this.web3Origin,
      this.originDeployer,
    );
    if (erc20GatewayMasterCopyAddress !== null) {
      this.config.updateERC20GatewayMasterCopyAddress(erc20GatewayMasterCopyAddress);
    } else {
      return;
    }

    console.info('\n‣ Deploying proxy deployer contracts on auxiliary chain.');

    const proxyDeployerAuxiliary = await MasterCopyDeployer.deployProxyDeployerContract(
      PROXY_DEPLOYER_CONTRACT,
      this.web3Auxiliary,
      this.auxiliaryDeployer,
    );
    if (proxyDeployerAuxiliary !== null) {
      this.config.updateAuxiliaryProxyDeployer(proxyDeployerAuxiliary);
    } else {
      return;
    }

    console.info('\n‣ Deploying proxy deployer contracts on origin chain.');

    const proxyDeployerOrigin = await MasterCopyDeployer.deployProxyDeployerContract(
      PROXY_DEPLOYER_CONTRACT,
      this.web3Origin,
      this.originDeployer,
    );
    if (proxyDeployerOrigin !== null) {
      this.config.updateOriginProxyDeployer(proxyDeployerOrigin);
    } else {
      return;
    }

    console.info('\n‣ Updating the manifest file with deployed contract addresses.');
    try {
      const path = this.config.save();
      console.log('  ✓ Manifest file updated with deployed contract address: ');
      console.log(`  ${path}\n`);
    } catch (error) {
      console.log('  ❌ Failed to update manifest fileUnlocking');
      console.log(`  ${error}`);
    }
    // console.log('MasterCopyDeployer -> deploy -> this.config', JSON.stringify(this.config));
    process.exit(0);
  }
}

module.exports = MasterCopyDeployer;
