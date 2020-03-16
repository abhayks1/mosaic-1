'use strict';

const fs = require('fs');
const yaml = require('js-yaml');

const CHAIN_ID = 'chain id';
const ORIGIN = 'origin';
const AUXILIARY = 'auxiliary';
const ENDPOINTS = 'ethereum node endpoints';
const DEPLOYER = 'deployer address';
const ACCOUNTS = 'accounts';
const KETSTORE_PATH = 'keystore path';
const KETSTORE_PASSWORD_PATH = 'keystore password';
const MASTER_COPY_CONTRACTS = 'master copy contracts';
const PROXY_CONTRACTS = 'proxy contracts';

const ANCHOR = 'anchor';
const ERC20_GATEWAY = 'erc20 gateway';
const ERC20_COGATEWAY = 'erc20 cogateway';
const UTILITY_TOKEN = 'utility token';
const PROXY_DEPLOYER = 'proxy deployer';

const MAX_STORAGE_ROOT_ITEMS = 'maximum number of storage roots';

class Config {
  constructor(configPath) {
    this.configPath = configPath;
    this.config = yaml.safeLoad(
      fs.readFileSync(
        this.configPath,
        'utf8',
      ),
    );
  }

  data() {
    return this.config;
  }

  originChainId() {
    return this.config[CHAIN_ID][ORIGIN];
  }

  auxiliaryChainId() {
    return this.config[CHAIN_ID][AUXILIARY];
  }

  originEndpoint() {
    return this.config[ENDPOINTS][ORIGIN];
  }

  auxiliaryEndpoint() {
    return this.config[ENDPOINTS][AUXILIARY];
  }

  originDeployer() {
    return this.config[DEPLOYER][ORIGIN];
  }

  auxiliaryDeployer() {
    return this.config[DEPLOYER][AUXILIARY];
  }

  keyStorePath(address) {
    console.log('Config -> keyStorePath -> address', address);
    let path;
    const accounts = this.config[ACCOUNTS];
    console.log('Config -> keyStorePath -> accounts', accounts);
    for (let index = 0; index < accounts.length; index += 1) {
      const accountData = accounts[index];
      if (accountData[address] !== undefined) {
        path = accountData[address][KETSTORE_PATH];
        break;
      }
    }
    return path;
  }

  keyStorePasswordPath(address) {
    let path;
    const accounts = this.config[ACCOUNTS];
    for (let index = 0; index < accounts.length; index += 1) {
      const accountData = accounts[index];
      if (accountData[address] !== undefined) {
        path = accountData[address][KETSTORE_PASSWORD_PATH];
        break;
      }
    }
    return path;
  }

  maxStorageRootItems() {
    return this.config[MAX_STORAGE_ROOT_ITEMS];
  }

  originAnchorAddress() {
    return this.config[MASTER_COPY_CONTRACTS][ORIGIN][ANCHOR];
  }

  auxiliaryAnchorAddress() {
    return this.config[MASTER_COPY_CONTRACTS][AUXILIARY][ANCHOR];
  }

  originProxyDeployer() {
    return this.config[MASTER_COPY_CONTRACTS][ORIGIN][PROXY_DEPLOYER];
  }

  auxiliaryProxyDeployer() {
    return this.config[MASTER_COPY_CONTRACTS][AUXILIARY][PROXY_DEPLOYER];
  }

  erc20GatewayMasterCopyAddress() {
    return this.config[MASTER_COPY_CONTRACTS][ORIGIN][ERC20_GATEWAY];
  }

  erc20CogatewayMasterCopyAddress() {
    return this.config[MASTER_COPY_CONTRACTS][AUXILIARY][ERC20_COGATEWAY];
  }

  utilityTokenMasterCopyAddress() {
    return this.config[MASTER_COPY_CONTRACTS][AUXILIARY][UTILITY_TOKEN];
  }

  erc20GatewayProxyContractAddress() {
    return this.config[PROXY_CONTRACTS][ORIGIN][ERC20_GATEWAY];
  }

  erc20CogatewayProxyContractAddress() {
    return this.config[PROXY_CONTRACTS][AUXILIARY][ERC20_COGATEWAY];
  }

  updateUtilityTokenMasterCopyAddress(address) {
    this.config[MASTER_COPY_CONTRACTS][AUXILIARY][UTILITY_TOKEN] = address;
  }

  updateERC20CogatewayMasterCopyAddress(address) {
    this.config[MASTER_COPY_CONTRACTS][AUXILIARY][ERC20_COGATEWAY] = address;
  }

  updateERC20GatewayMasterCopyAddress(address) {
    this.config[MASTER_COPY_CONTRACTS][ORIGIN][ERC20_GATEWAY] = address;
  }

  updateAuxiliaryProxyDeployer(address) {
    this.config[MASTER_COPY_CONTRACTS][AUXILIARY][PROXY_DEPLOYER] = address;
  }

  updateOriginProxyDeployer(address) {
    this.config[MASTER_COPY_CONTRACTS][ORIGIN][PROXY_DEPLOYER] = address;
  }

  updateERC20GatewayProxyContractAddress(address) {
    this.config[PROXY_CONTRACTS][ORIGIN][ERC20_GATEWAY] = address;
  }

  updateERC20CogatewayProxyContractAddress(address) {
    this.config[PROXY_CONTRACTS][AUXILIARY][ERC20_COGATEWAY] = address;
  }

  save() {
    const yamlStr = yaml.safeDump(this.config);
    fs.writeFileSync(this.configPath, yamlStr, 'utf8');
    return this.configPath;
  }
}

module.exports = Config;
