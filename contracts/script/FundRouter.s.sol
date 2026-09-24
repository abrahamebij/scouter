// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FundRouter is Script {
    address constant ROUTER = 0xBC9987bCB52C7a534e4704E13fBFe60e45eaF5c3;
    address constant USDC = 0x6b57475467cd854d36Be7FB614caDa5207838943;
    address constant WSPYX = 0x9eF9f9B22d3CA9769e28e769e2AAA3C2B0072D0e;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Fund router with 10 USDC and 0.1 wSPYx
        IERC20(USDC).transfer(ROUTER, 10e6);       // 10 USDC
        IERC20(WSPYX).transfer(ROUTER, 0.1e18);    // 0.1 wSPYx

        console.log("Router USDC balance:", IERC20(USDC).balanceOf(ROUTER));
        console.log("Router wSPYx balance:", IERC20(WSPYX).balanceOf(ROUTER));

        vm.stopBroadcast();
    }
}
