// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {LeveragedVault} from "../src/LeveragedVault.sol";
import {MockSwapRouter} from "../src/MockSwapRouter.sol";
import {IPool} from "../src/interfaces/IPool.sol";
import {IPoolAddressesProvider} from "../src/interfaces/IPoolAddressesProvider.sol";
import {IPriceOracleGetter} from "../src/interfaces/IPriceOracleGetter.sol";

/// @notice Fork-based integration tests against Tydro on Ink Sepolia
contract LeveragedVaultTest is Test {
    // Ink Sepolia addresses
    address constant ADDRESSES_PROVIDER = 0xff75B6da14FfbbfD355Daf7a2731456b3562Ba6D;
    address constant ORACLE = 0xB1532b76D054c9F9E61b25c4d91f69B4133E4671;
    address constant WSPYX = 0x9eF9f9B22d3CA9769e28e769e2AAA3C2B0072D0e;
    address constant USDC = 0x6b57475467cd854d36Be7FB614caDa5207838943;
    address constant A_WSPYX = 0x4199CC1F5ed0d796563d7CcB2e036253E2C18281;

    LeveragedVault public vault;
    MockSwapRouter public router;
    IPool public pool;
    IPriceOracleGetter public oracleContract;

    address public user = makeAddr("user");
    address public keeper = makeAddr("keeper");
    address public debtUsdc;

    function setUp() public {
        // Fork Ink Sepolia
        // vm.createSelectFork(vm.envString("INK_SEPOLIA_RPC_URL"));

        pool = IPool(IPoolAddressesProvider(ADDRESSES_PROVIDER).getPool());
        oracleContract = IPriceOracleGetter(IPoolAddressesProvider(ADDRESSES_PROVIDER).getPriceOracle());

        // Find the variable debt token for USDC
        // For testing, we'll use the data provider or set it manually
        // This needs to be looked up from the deployed Tydro contracts
        debtUsdc = _getVariableDebtToken(USDC);

        // Deploy mock swap router
        router = new MockSwapRouter(
            ORACLE,
            USDC,
            WSPYX,
            6,  // USDC decimals
            18, // wSPYx decimals
            30  // 0.30% spread
        );

        // Deploy vault: 3x leverage, 10% tolerance, 1.2 min HF
        vault = new LeveragedVault(
            IPoolAddressesProvider(ADDRESSES_PROVIDER),
            USDC,
            WSPYX,
            A_WSPYX,
            debtUsdc,
            address(router),
            30_000,  // 3x
            1_000,   // 10% tolerance
            1.2e18   // min health factor
        );

        vault.setKeeper(keeper);

        // Fund the mock swap router with tokens
        deal(USDC, address(router), 10_000_000e6);    // 10M USDC
        deal(WSPYX, address(router), 100_000e18);      // 100K wSPYx

        // Fund user
        deal(USDC, user, 100_000e6); // 100K USDC
    }

    function test_deposit() public {
        uint256 depositAmount = 10_000e6; // 10K USDC

        vm.startPrank(user);
        IERC20(USDC).approve(address(vault), depositAmount);
        vault.deposit(depositAmount, user);
        vm.stopPrank();

        // User should have shares
        assertGt(vault.balanceOf(user), 0, "should have shares");

        // Vault should have collateral on Tydro
        assertGt(IERC20(A_WSPYX).balanceOf(address(vault)), 0, "should have collateral");

        // Vault should have debt
        assertGt(IERC20(debtUsdc).balanceOf(address(vault)), 0, "should have debt");

        // Check leverage is approximately 3x
        uint256 leverage = vault.getCurrentLeverage();
        console.log("Current leverage (BPS):", leverage);
        // Allow 15% deviation due to swap spread
        assertGt(leverage, 25_000, "leverage too low");
        assertLt(leverage, 35_000, "leverage too high");

        // Check totalAssets reflects net value
        uint256 totalAssets = vault.totalAssets();
        console.log("Total assets (USDC):", totalAssets);
        // Should be roughly equal to deposit minus swap costs
        assertGt(totalAssets, depositAmount * 80 / 100, "totalAssets too low");
        assertLt(totalAssets, depositAmount * 110 / 100, "totalAssets too high");
    }

    function test_withdraw() public {
        uint256 depositAmount = 10_000e6;

        // Deposit first
        vm.startPrank(user);
        IERC20(USDC).approve(address(vault), depositAmount);
        vault.deposit(depositAmount, user);

        uint256 shares = vault.balanceOf(user);
        // Withdraw all
        vault.redeem(shares, user, user);
        vm.stopPrank();

        // User should have no shares
        assertEq(vault.balanceOf(user), 0, "should have no shares");

        // User should have received USDC back
        uint256 userBalance = IERC20(USDC).balanceOf(user);
        console.log("User USDC after withdraw:", userBalance);
        // Should get most of deposit back (minus swap spread costs on both legs)
        assertGt(userBalance, depositAmount * 90 / 100, "got back too little");

        // Vault should have minimal dust
        assertLt(IERC20(A_WSPYX).balanceOf(address(vault)), 1e15, "collateral dust");
    }

    function test_multipleDepositors() public {
        address user2 = makeAddr("user2");
        deal(USDC, user2, 50_000e6);

        // User 1 deposits 10K
        vm.startPrank(user);
        IERC20(USDC).approve(address(vault), 10_000e6);
        vault.deposit(10_000e6, user);
        vm.stopPrank();

        // User 2 deposits 50K
        vm.startPrank(user2);
        IERC20(USDC).approve(address(vault), 50_000e6);
        vault.deposit(50_000e6, user2);
        vm.stopPrank();

        // User 2 should have ~5x the shares of user 1
        uint256 shares1 = vault.balanceOf(user);
        uint256 shares2 = vault.balanceOf(user2);
        console.log("User1 shares:", shares1);
        console.log("User2 shares:", shares2);

        // User 1 withdraws
        vm.startPrank(user);
        vault.redeem(shares1, user, user);
        vm.stopPrank();

        // User 2 should still have their shares
        assertEq(vault.balanceOf(user2), shares2, "user2 shares should be unchanged");

        // Vault should still have a position
        assertGt(IERC20(A_WSPYX).balanceOf(address(vault)), 0, "should still have collateral");
    }

    function test_rebalance() public {
        // Deposit to create a position
        vm.startPrank(user);
        IERC20(USDC).approve(address(vault), 10_000e6);
        vault.deposit(10_000e6, user);
        vm.stopPrank();

        uint256 leverageBefore = vault.getCurrentLeverage();
        console.log("Leverage before:", leverageBefore);

        // Simulate price change by manipulating oracle (if possible on fork)
        // For now, just verify rebalance reverts when within tolerance
        vm.prank(keeper);
        vm.expectRevert("within tolerance");
        vault.rebalance();
    }

    function test_onlyKeeperCanRebalance() public {
        vm.prank(user);
        vm.expectRevert("unauthorized");
        vault.rebalance();
    }

    function test_totalAssetsEmpty() public view {
        assertEq(vault.totalAssets(), 0, "empty vault should have 0 assets");
    }

    function test_setTargetLeverage() public {
        vault.setTargetLeverage(20_000, 500); // 2x, 5% tolerance
        assertEq(vault.targetLeverageRatio(), 20_000);
        assertEq(vault.leverageTolerance(), 500);
    }

    function test_setTargetLeverage_onlyOwner() public {
        vm.prank(user);
        vm.expectRevert();
        vault.setTargetLeverage(20_000, 500);
    }

    // Helper to get variable debt token address
    // In a real scenario, query the Aave data provider
    function _getVariableDebtToken(address) internal pure returns (address) {
        return 0x0E76414d433ddfe8004d2A7505d218874875a996;
    }
}
