// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {CarrySwapRouter} from "../src/CarrySwapRouter.sol";
import {CarryVault} from "../src/CarryVault.sol";

contract DeployCarryRouter is Script {
    address constant MORPHO_ORACLE = 0x63d2A9b914Ba18FB28c408fDbC6cB84884153700;
    address constant SPYX = 0x90A2a4c76b5D8c0bc892A69EA28Aa775a8f2dD48;
    address constant AUSD = 0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a;
    address constant VAULT = 0xDB6e4525963b9689445Ec0b48d0487bb3c98a422;

    uint256 constant SWAP_SPREAD_BPS = 30; // 0.30%

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy new router with correct decimals
        CarrySwapRouter router = new CarrySwapRouter(
            MORPHO_ORACLE,
            SPYX,
            AUSD,
            18, // SPYx decimals
            6,  // aUSD decimals
            SWAP_SPREAD_BPS
        );
        console.log("New CarrySwapRouter deployed at:", address(router));

        // 2. Point vault to new router
        CarryVault(VAULT).setSwapRouter(address(router));
        console.log("Vault swap router updated");

        vm.stopBroadcast();
    }
}
