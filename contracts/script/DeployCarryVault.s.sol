// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {CarryVault} from "../src/CarryVault.sol";

contract DeployCarryVault is Script {
    address constant MORPHO = 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb;
    bytes32 constant SPYX_AUSD_MARKET_ID = 0x04b580ba9e6e886b67e47265cc8e314820123d5683563bb24097ad80513d6e4f;
    address constant FLOWDESK_VAULT = 0x32401B9fb79065Bc15949DE0BD43927492f02F0C;
    address constant MORPHO_ORACLE = 0x63d2A9b914Ba18FB28c408fDbC6cB84884153700;

    address constant AUSD = 0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a;
    address constant SPYX = 0x90A2a4c76b5D8c0bc892A69EA28Aa775a8f2dD48;

    // Existing router — already deployed and funded
    address constant ROUTER = 0x0fe5c8839BfA95cDcc171f7242E680Ca7fe088e3;

    uint256 constant TARGET_LTV = 7_000;
    uint256 constant MAX_LTV = 8_500;
    uint256 constant REBALANCE_THRESHOLD = 500;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        CarryVault vault = new CarryVault(
            MORPHO,
            SPYX_AUSD_MARKET_ID,
            FLOWDESK_VAULT,
            AUSD,
            SPYX,
            ROUTER,
            MORPHO_ORACLE,
            TARGET_LTV,
            MAX_LTV,
            REBALANCE_THRESHOLD
        );
        console.log("CarryVault deployed at:", address(vault));

        vm.stopBroadcast();
    }
}
