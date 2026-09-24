// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IPoolAddressesProvider} from "./IPoolAddressesProvider.sol";
import {IPool} from "./IPool.sol";

interface IFlashLoanSimpleReceiver {
    function executeOperation(
        address asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool);

    function ADDRESSES_PROVIDER() external view returns (IPoolAddressesProvider);

    function POOL() external view returns (IPool);
}
