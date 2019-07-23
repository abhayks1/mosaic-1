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

const BN = require('bn.js');

const web3 = require('../test_lib/web3.js');

const Committee = artifacts.require('Committee');

function remove0x(str) {
  if (str.substr(0, 2) === '0x') {
    return str.substr(2);
  }

  return str;
}

async function createCommittee(committeeSize, dislocation, proposal, txOptions = {}) {
  return Committee.new(
    committeeSize,
    dislocation,
    proposal,
    txOptions,
  );
}

function shuffleAccount(dislocation, account) {
  return web3.utils.soliditySha3(
    { t: 'address', v: account },
    { t: 'bytes32', v: dislocation },
  );
}

function distance(h1, h2) {
  // Create BN from hashes.
  const a = new BN(remove0x(h1), 16);
  const b = new BN(remove0x(h2), 16);

  // Return XOR as big number.
  return a.xor(b);
}

function distanceToProposal(dislocation, account, proposal) {
  return distance(shuffleAccount(dislocation, account), proposal);
}

const CommitteeStatus = {
  Open: new BN(0),
  Cooldown: new BN(1),
  CommitPhase: new BN(2),
  RevealPhase: new BN(3),
  Closed: new BN(4),
  Invalid: new BN(5),
};

function isCommitteeOpen(status) {
  return CommitteeStatus.Open.cmp(status) === 0;
}

const SENTINEL_MEMBERS = '0x1';

async function assertCommitteeMembers(committee, dist) {
  const membersCount = (await committee.memberCount.call()).toNumber();

  assert.strictEqual(
    membersCount,
    dist.length,
  );

  if (membersCount === 0) {
    return;
  }

  // assert all members in the committee match the distance ordered validators.
  for (let i = 0; i < membersCount - 1; i += 1) {
    // get the next further member in the committee
    // note: the linked-list refers to the closer member
    // eslint-disable-next-line no-await-in-loop
    const member = await committee.members.call(dist[i + 1].address);
    assert.strictEqual(
      member,
      dist[i].address,
      `Member ${i} is ${dist[i].address}, but was expected to be ${member}`,
    );
  }

  const sentinelMembers = await committee.SENTINEL_MEMBERS.call();
  const member = await committee.members.call(sentinelMembers);

  // assert we've reached the end of the linked-list
  assert.strictEqual(
    member,
    dist[membersCount - 1].address,
    `The furthest member ${dist[membersCount - 1].address} should be `
          + `given by Sentinel but instead ${member} was returned.`,
  );
}


module.exports = {
  createCommittee,
  distance,
  shuffleAccount,
  distanceToProposal,
  CommitteeStatus,
  isCommitteeOpen,
  SENTINEL_MEMBERS,
  assertCommitteeMembers,
};
