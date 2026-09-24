// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MockSwapRouter} from "../src/MockSwapRouter.sol";
import {LeveragedVault} from "../src/LeveragedVault.sol";
import {IPoolAddressesProvider} from "../src/interfaces/IPoolAddressesProvider.sol";

contract Deploy is Script {
    // Ink Sepolia addresses
    address constant ADDRESSES_PROVIDER = 0xff75B6da14FfbbfD355Daf7a2731456b3562Ba6D;
    address constant ORACLE = 0xB1532b76D054c9F9E61b25c4d91f69B4133E4671;
    address constant WSPYX = 0x9eF9f9B22d3CA9769e28e769e2AAA3C2B0072D0e;
    address constant USDC = 0x6b57475467cd854d36Be7FB614caDa5207838943;
    address constant A_WSPYX = 0x4199CC1F5ed0d796563d7CcB2e036253E2C18281;
    address constant A_USDC = 0x5cc46d2b1103aB23CFD63eF8631480bbf4eB40FE;

    // Config
    uint256 constant TARGET_LEVERAGE = 30_000; // 3x
    uint256 constant LEVERAGE_TOLERANCE = 1_000; // 10% drift
    uint256 constant MIN_HEALTH_FACTOR = 1.2e18;
    uint256 constant SPREAD_BPS = 30; // 0.30%

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        address debtUsdc = 0x0E76414d433ddfe8004d2A7505d218874875a996;
        address router = 0x2D4bA365056cd1bF3Ba6e9b37f9025DAEcC1cE4c;

        // Deploy LeveragedVault (reuses existing MockSwapRouter)
        LeveragedVault vault = new LeveragedVault(
            IPoolAddressesProvider(ADDRESSES_PROVIDER),
            USDC,
            WSPYX,
            A_WSPYX,
            debtUsdc,
            router,
            TARGET_LEVERAGE,
            LEVERAGE_TOLERANCE,
            MIN_HEALTH_FACTOR
        );
        console.log("LeveragedVault deployed at:", address(vault));

        vm.stopBroadcast();
    }
}
