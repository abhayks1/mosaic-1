const fs = require('fs-extra');
const path = require('path');

const MasterCopyDeployer = require('./MasterCopyDeployer');
const ProxyDeployer = require('./ProxyDeployer');

const deployMasterCopy = async (manifestFilePath) => {
  console.log('deployMasterCopy manifestFilePath: ', manifestFilePath);
  const masterCopyDeployer = new MasterCopyDeployer(manifestFilePath);
  await masterCopyDeployer.deploy();
};
const deployProxy = async (manifestFilePath) => {
  console.log('deployProxy manifestFilePath: ', manifestFilePath);
  const proxyDeployer = new ProxyDeployer(manifestFilePath);
  await proxyDeployer.deploy();
};

const getFilePath = (pathString) => {
  console.log('pathString: ', pathString);
  let filePath;
  try {
    if (fs.existsSync(pathString)) {
      filePath = pathString;
    } else {
      const preDefinedManifestFilePath = path.join(
        __dirname,
        `/config/${pathString}.yaml`,
      );
      console.log('preDefinedManifestFilePath: ', preDefinedManifestFilePath);
      if (fs.existsSync(preDefinedManifestFilePath)) {
        filePath = preDefinedManifestFilePath;
      }
    }
  } catch (err) {}
  return filePath;
};

const run = async () => {
  if (process.argv.length !== 4) {
    console.log('Invalid input params');
    console.log('Please use valid command:');
    console.log('Valid command to deploy master copy:');
    console.log('    npm run tool:deploy:gateway mastercopy hadapsar');
    console.log('    npm run tool:deploy:gateway mastercopy localhost');
    console.log('    npm run tool:deploy:gateway mastercopy <manifest file path>');
    console.log('Valid command to deploy proxy contract:');
    console.log('    npm run tool:deploy:gateway proxy hadapsar');
    console.log('    npm run tool:deploy:gateway proxy localhost');
    console.log('    npm run tool:deploy:gateway proxy <manifest file path>');
    return;
  }
  const filePath = getFilePath(process.argv[3]);
  if (filePath === undefined) {
    console.log('Invalid manifest file: ', process.argv[3]);
  } else if (process.argv[2] === 'mastercopy') {
    await deployMasterCopy(filePath);
  } else if (process.argv[2] === 'proxy') {
    await deployProxy(filePath);
  } else {
    console.log('invalid param ', process.argv[2]);
  }
};

run();
