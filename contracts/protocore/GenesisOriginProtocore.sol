pragma solidity >=0.5.0 <0.6.0;

// Copyright 2020 OpenST Ltd.
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

/**
 * @title Genesis origin protocore contract is a storage contract that holds
 *        the initial values required by the contract that were written in the
 *        genesis block.
 */
contract GenesisOriginProtocore {

    /* Storage */

    /** Metachain id of the origin chain. */
    bytes32 public genesisMetachainId;

    /** Epoch length. */
    uint256 public genesisEpochLength;

    /** Proposed metablock height. */
    uint256 public genesisProposedMetablockHeight;

    /** Domain separator. */
    bytes32 public genesisDomainSeparator;

    /** Block hash of source checkpoint. */
    bytes32 public genesisOriginSourceBlockHash;

    /** Block number of source checkpoint. */
    uint256 public genesisOriginSourceBlockNumber;

    /** Block hash of target checkpoint. */
    bytes32 public genesisOriginTargetBlockHash;

    /** Block number of target checkpoint. */
    uint256 public genesisOriginTargetBlockNumber;

    /** Parent vote message hash. */
    bytes32 public genesisOriginParentVoteMessageHash;

    /** Self protocore address. */
    address public genesisSelfProtocore;
}
