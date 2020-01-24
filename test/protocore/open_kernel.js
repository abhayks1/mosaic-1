// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const BN = require('bn.js');

const { AccountProvider } = require('../test_lib/utils.js');
const Utils = require('../test_lib/utils.js');

const ProtocoreTest = artifacts.require('TestProtocore');

const config = {};

contract('Protocore::openKernel', (accounts) => {
  const accountProvider = new AccountProvider(accounts);

  beforeEach(async () => {
    config.coconsensusAddress = accountProvider.get();

    config.genesisKernelHeight = new BN(0);
    config.genesisKernelHash = Utils.getRandomHash();

    config.protocore = await ProtocoreTest.new(
      config.coconsensusAddress,
      config.genesisKernelHeight,
      config.genesisKernelHash,
    );
  });

  contract('Negative Tests', async () => {
    it('should revert if caller is not coconsensus', async () => {
      const newKernelHeight = config.genesisKernelHeight.addn(1);
      const newKernelHash = Utils.getRandomHash();

      await Utils.expectRevert(
        config.protocore.openKernel(
          newKernelHeight,
          newKernelHash,
          { from: accountProvider.get() },
        ),
        'Only the Coconsensus contract can call this function.',
      );
    });

    it('should revert if new kernel height is not plus one of the current', async () => {
      const newKernelHeight = config.genesisKernelHeight;
      const newKernelHash = Utils.getRandomHash();

      await Utils.expectRevert(
        config.protocore.openKernel(
          newKernelHeight,
          newKernelHash,
          { from: config.coconsensusAddress },
        ),
        'The given kernel height should be plus 1 of the current one.',
      );
    });
  });

  contract('Positive Tests', async () => {
    it('should open a new kernel', async () => {
      const newKernelHeight = config.genesisKernelHeight.addn(1);
      const newKernelHash = Utils.getRandomHash();

      await config.protocore.openKernel(
        newKernelHeight,
        newKernelHash,
        { from: config.coconsensusAddress },
      );

      const currentKernelHeight = await config.protocore.openKernelHeight.call();
      const currentKernelHash = await config.protocore.openKernelHash.call();

      assert.isOk(
        currentKernelHeight.eq(newKernelHeight),
      );

      assert.strictEqual(
        currentKernelHash,
        newKernelHash,
      );
    });
  });
});