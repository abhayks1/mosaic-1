pragma solidity >=0.5.0 <0.6.0;

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

import "./ProxyFactory.sol";

/**
 * @notice Proxy deployer contract helps to create new proxy contact and
 *         execute a message call to the new proxy within one transaction.
 */
contract ProxyDeployer is ProxyFactory {

    /* External Functions */

    /**
     * @notice Deploy a new proxy contract.
     *
     * @param _masterCopy Address of master copy contract.
     * @param _data Message call data.
     *
     * @return proxy_ A newly deployed proxy contract address.
     */
    function deployProxy(address _masterCopy, bytes calldata _data)
        external
        returns (Proxy proxy_)
    {
        proxy_ = ProxyFactory.createProxy(_masterCopy, _data);
    }
}
