// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LeveragedVault} from "../src/LeveragedVault.sol";

contract TestWithdraw is Script {
    address constant VAULT = 0x47d144a13bEd591688DeA00890001448F3f96196;
    address constant USDC = 0x6b57475467cd854d36Be7FB614caDa5207838943;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        LeveragedVault vault = LeveragedVault(VAULT);

        uint256 shares = vault.balanceOf(deployer);
        uint256 usdcBefore = IERC20(USDC).balanceOf(deployer);

        console.log("=== Before Withdraw ===");
        console.log("Shares:", shares);
        console.log("USDC balance:", usdcBefore);
        console.log("Preview redeem:", vault.previewRedeem(shares));

        vm.startBroadcast(deployerPrivateKey);

        // Redeem all shares
        vault.redeem(shares, deployer, deployer);

        vm.stopBroadcast();

        uint256 usdcAfter = IERC20(USDC).balanceOf(deployer);

        console.log("=== After Withdraw ===");
        console.log("Shares:", vault.balanceOf(deployer));
        console.log("USDC balance:", usdcAfter);
        console.log("USDC received:", usdcAfter - usdcBefore);
        console.log("Vault total assets:", vault.totalAssets());
        console.log("Vault leverage:", vault.getCurrentLeverage());
    }
}
