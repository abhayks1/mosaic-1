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

import shared from '../shared';
import Interacts from "../../../interacts/Interacts";

const FUNDING_AMOUNT_IN_ETHER = '2';
describe('Deployment', async () => {
  it.skip('Contract deployment', async () => {

    const {
      Axiom,
      Committee,
      Consensus,
      Core,
      Reputation,
    } = shared.artifacts;

    const committee = await Committee.new();
    const consensus = await Consensus.new();
    const reputation = await Reputation.new();
    const core = await Core.new();
    const axiom = await Axiom.new(
      shared.origin.keys.techGov,
      consensus.address,
      core.address,
      committee.address,
      reputation.address,
    );

    const web3 = shared.origin.web3;
    shared.origin.contracts.Axiom.instance = Interacts.getAxiom(web3, axiom.address);
    shared.origin.contracts.Axiom.address = axiom.address;

  });

  it.skip('Token deployment and fund validator', async () => {
    const {
      ERC20Mock,
    } = shared.artifacts;

    const { funder } = shared.origin;

    const most = await ERC20Mock.new(funder,'800000000', { from: funder });
    const wETH = await ERC20Mock.new(funder,'800000000', { from: funder });

    const web3 = shared.origin.web3;
    shared.origin.contracts.MOST.instance = Interacts.getERC20I(web3, most.address);
    shared.origin.contracts.MOST.address = most.address;
    shared.origin.contracts.WETH.instance = Interacts.getERC20I(web3, wETH.address);
    shared.origin.contracts.WETH.address = wETH.address;
    const erc20FundingPromises = [];
    const fundingAmount = web3.utils.toWei(FUNDING_AMOUNT_IN_ETHER);

    shared.origin.keys.validators.forEach((validator) => {
      erc20FundingPromises.push(
        most.transfer(
          validator.address,
          fundingAmount,
          { from: funder },
        ),
      );

      erc20FundingPromises.push(
        wETH.transfer(
          validator.address,
          fundingAmount,
          { from: funder },
        ),
      );
    });

    await Promise.all(erc20FundingPromises);
  });
});
