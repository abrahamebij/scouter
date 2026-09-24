// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FundCarryRouter is Script {
    // Tokens
    address constant AUSD = 0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a;
    address constant SPYX = 0x90A2a4c76b5D8c0bc892A69EA28Aa775a8f2dD48;

    // Set after deploy
    address constant ROUTER = 0x0fe5c8839BfA95cDcc171f7242E680Ca7fe088e3;

    // Funding amounts
    // 1 SPYx ≈ 656.88 aUSD (from oracle)
    // 10 aUSD ≈ 0.01522 SPYx
    uint256 constant SPYX_AMOUNT = 0.01522e18; // ~$10 worth of SPYx
    uint256 constant AUSD_AMOUNT = 10e6;       // 10 aUSD (6 decimals)

    function run() external {
        require(ROUTER != address(0), "set ROUTER address");

        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        if (SPYX_AMOUNT > 0) {
            IERC20(SPYX).transfer(ROUTER, SPYX_AMOUNT);
            console.log("Sent SPYx to router:", SPYX_AMOUNT);
        }

        if (AUSD_AMOUNT > 0) {
            IERC20(AUSD).transfer(ROUTER, AUSD_AMOUNT);
            console.log("Sent aUSD to router:", AUSD_AMOUNT);
        }

        console.log("Router SPYx balance:", IERC20(SPYX).balanceOf(ROUTER));
        console.log("Router aUSD balance:", IERC20(AUSD).balanceOf(ROUTER));

        vm.stopBroadcast();
    }
}
