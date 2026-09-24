// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LeveragedVault} from "../src/LeveragedVault.sol";

contract TestDeposit is Script {
    address constant VAULT = 0x47d144a13bEd591688DeA00890001448F3f96196;
    address constant USDC = 0x6b57475467cd854d36Be7FB614caDa5207838943;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        LeveragedVault vault = LeveragedVault(VAULT);

        // Approve and deposit 5 USDC
        IERC20(USDC).approve(VAULT, 2e6);
        vault.deposit(2e6, deployer);

        console.log("Shares received:", vault.balanceOf(deployer));
        console.log("Total assets:", vault.totalAssets());
        console.log("Current leverage:", vault.getCurrentLeverage());

        vm.stopBroadcast();
    }
}
