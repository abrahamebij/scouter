// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {CarrySwapRouter} from "../src/CarrySwapRouter.sol";
import {CarryVault} from "../src/CarryVault.sol";

contract DeployCarry is Script {
    // Ethereum Mainnet addresses
    address constant MORPHO = 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb;
    bytes32 constant SPYX_AUSD_MARKET_ID = 0x04b580ba9e6e886b67e47265cc8e314820123d5683563bb24097ad80513d6e4f;
    address constant FLOWDESK_VAULT = 0x32401B9fb79065Bc15949DE0BD43927492f02F0C;
    address constant MORPHO_ORACLE = 0x63d2A9b914Ba18FB28c408fDbC6cB84884153700;

    // Tokens
    address constant AUSD = 0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a;
    address constant SPYX = 0x90A2a4c76b5D8c0bc892A69EA28Aa775a8f2dD48;

    // Config
    uint256 constant TARGET_LTV = 7_000;            // 70%
    uint256 constant MAX_LTV = 8_500;               // 85%
    uint256 constant REBALANCE_THRESHOLD = 500;     // 5% drift
    uint256 constant SWAP_SPREAD_BPS = 30;          // 0.30%

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy swap router
        CarrySwapRouter router = new CarrySwapRouter(
            MORPHO_ORACLE,
            SPYX,
            AUSD,
            18,  // SPYx decimals
            6,   // aUSD decimals
            SWAP_SPREAD_BPS
        );
        console.log("CarrySwapRouter deployed at:", address(router));

        // 2. Deploy vault
        CarryVault vault = new CarryVault(
            MORPHO,
            SPYX_AUSD_MARKET_ID,
            FLOWDESK_VAULT,
            AUSD,
            SPYX,
            address(router),
            MORPHO_ORACLE,
            TARGET_LTV,
            MAX_LTV,
            REBALANCE_THRESHOLD
        );
        console.log("CarryVault deployed at:", address(vault));

        vm.stopBroadcast();
    }
}
