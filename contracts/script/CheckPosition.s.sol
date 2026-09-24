// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LeveragedVault} from "../src/LeveragedVault.sol";
import {IPool} from "../src/interfaces/IPool.sol";

contract CheckPosition is Script {
    address constant VAULT = 0x47d144a13bEd591688DeA00890001448F3f96196;
    address constant A_WSPYX = 0x4199CC1F5ed0d796563d7CcB2e036253E2C18281;
    address constant DEBT_USDC = 0x0E76414d433ddfe8004d2A7505d218874875a996;
    address constant USDC = 0x6b57475467cd854d36Be7FB614caDa5207838943;

    function run() external view {
        LeveragedVault vault = LeveragedVault(VAULT);

        console.log("=== YieldX Vault Position ===");
        console.log("Total shares:", vault.totalSupply());
        console.log("Total assets (USDC):", vault.totalAssets());
        console.log("Idle USDC in vault:", IERC20(USDC).balanceOf(VAULT));
        console.log("aWspyx (collateral):", IERC20(A_WSPYX).balanceOf(VAULT));
        console.log("Debt USDC:", IERC20(DEBT_USDC).balanceOf(VAULT));
        console.log("Current leverage (BPS):", vault.getCurrentLeverage());

        IPool pool = vault.POOL();
        (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,
            uint256 availableBorrowsBase,
            ,
            uint256 ltv,
            uint256 healthFactor
        ) = pool.getUserAccountData(VAULT);

        console.log("=== Tydro Account Data ===");
        console.log("Collateral (base):", totalCollateralBase);
        console.log("Debt (base):", totalDebtBase);
        console.log("Available borrows (base):", availableBorrowsBase);
        console.log("LTV:", ltv);
        console.log("Health factor:", healthFactor);
    }
}
