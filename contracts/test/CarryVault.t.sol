// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {CarryVault} from "../src/CarryVault.sol";
import {CarrySwapRouter} from "../src/CarrySwapRouter.sol";
import {IMorpho, MarketParams, Position, Market} from "../src/interfaces/IMorpho.sol";
import {IMetaMorpho} from "../src/interfaces/IMetaMorpho.sol";

/// @notice Unit tests for CarryVault using mocked Morpho and Flowdesk
contract CarryVaultTest is Test {
    // Morpho Blue mainnet
    address constant MORPHO = 0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb;
    bytes32 constant MARKET_ID = 0x04b580ba9e6e886b67e47265cc8e314820123d5683563bb24097ad80513d6e4f;
    address constant FLOWDESK_VAULT = 0x32401B9fb79065Bc15949DE0BD43927492f02F0C;

    address constant MORPHO_ORACLE = 0x63d2A9b914Ba18FB28c408fDbC6cB84884153700;

    CarryVault public vault;
    CarrySwapRouter public router;

    address public user = makeAddr("user");
    address public keeper = makeAddr("keeper");

    address constant AUSD = 0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a;
    address constant SPYX = 0x90A2a4c76b5D8c0bc892A69EA28Aa775a8f2dD48;
    address ausd;
    address spyx;

    function setUp() public {
        // Fork Ethereum mainnet
        // vm.createSelectFork(vm.envString("ETH_RPC_URL"));

        // Read market params to get token addresses
        MarketParams memory params = IMorpho(MORPHO).idToMarketParams(MARKET_ID);
        ausd = params.loanToken;
        spyx = params.collateralToken;

        console.log("aUSD:", ausd);
        console.log("sPYX:", spyx);

        // Deploy swap router
        router = new CarrySwapRouter(MORPHO_ORACLE, spyx, ausd, 18, 18, 30);

        // Deploy vault: 70% target LTV, 85% max, 5% rebalance threshold
        vault = new CarryVault(
            MORPHO,
            MARKET_ID,
            FLOWDESK_VAULT,
            ausd,
            spyx,
            address(router),
            MORPHO_ORACLE,
            7_000,
            8_500,
            500
        );

        vault.setKeeper(keeper);

        // Fund swap router with liquidity
        deal(ausd, address(router), 10_000_000e18);
        deal(spyx, address(router), 100_000e18);

        // Fund user with SPYx
        deal(spyx, user, 100_000e18);
    }

    function test_deposit() public {
        uint256 depositAmount = 10_000e18;

        vm.startPrank(user);
        IERC20(spyx).approve(address(vault), depositAmount);
        vault.deposit(depositAmount, user);
        vm.stopPrank();

        assertGt(vault.balanceOf(user), 0, "should have shares");
        assertGt(vault.vaultDeposited(), 0, "should have Flowdesk position");
        assertGt(vault.collateralValue(), 0, "should have collateral");
        assertGt(vault.debtValue(), 0, "should have debt");

        console.log("Shares:", vault.balanceOf(user));
        console.log("Flowdesk value:", vault.vaultDeposited());
        console.log("Collateral:", vault.collateralValue());
        console.log("Debt:", vault.debtValue());
        console.log("Total assets:", vault.totalAssets());
        console.log("LTV (BPS):", vault.getCurrentLtv());
    }

    function test_withdraw() public {
        uint256 depositAmount = 10_000e18;

        vm.startPrank(user);
        IERC20(spyx).approve(address(vault), depositAmount);
        vault.deposit(depositAmount, user);

        uint256 shares = vault.balanceOf(user);
        vault.redeem(shares, user, user);
        vm.stopPrank();

        assertEq(vault.balanceOf(user), 0, "should have no shares");

        uint256 userBalance = IERC20(spyx).balanceOf(user);
        console.log("User SPYx after withdraw:", userBalance);
        // Should get most back (minus swap spread)
        assertGt(userBalance, 90_000e18, "got back too little");
    }

    function test_multipleDepositors() public {
        address user2 = makeAddr("user2");
        deal(spyx, user2, 500_000e18);

        vm.startPrank(user);
        IERC20(spyx).approve(address(vault), 10_000e18);
        vault.deposit(10_000e18, user);
        vm.stopPrank();

        vm.startPrank(user2);
        IERC20(spyx).approve(address(vault), 50_000e18);
        vault.deposit(50_000e18, user2);
        vm.stopPrank();

        uint256 shares1 = vault.balanceOf(user);
        uint256 shares2 = vault.balanceOf(user2);
        console.log("User1 shares:", shares1);
        console.log("User2 shares:", shares2);

        // User 1 withdraws
        vm.startPrank(user);
        vault.redeem(shares1, user, user);
        vm.stopPrank();

        assertEq(vault.balanceOf(user2), shares2, "user2 shares unchanged");
        assertGt(vault.collateralValue(), 0, "should still have collateral");
    }

    function test_rebalance() public {
        uint256 depositAmount = 10_000e18;

        vm.startPrank(user);
        IERC20(spyx).approve(address(vault), depositAmount);
        vault.deposit(depositAmount, user);
        vm.stopPrank();

        vm.prank(keeper);
        vm.expectRevert("within tolerance");
        vault.rebalance();
    }

    function test_onlyKeeperCanRebalance() public {
        vm.prank(user);
        vm.expectRevert("unauthorized");
        vault.rebalance();
    }

    function test_emergencyUnwind() public {
        uint256 depositAmount = 10_000e18;

        vm.startPrank(user);
        IERC20(spyx).approve(address(vault), depositAmount);
        vault.deposit(depositAmount, user);
        vm.stopPrank();

        vault.emergencyUnwind();

        assertEq(vault.debtValue(), 0, "debt should be cleared");
        assertEq(vault.collateralValue(), 0, "collateral should be freed");
    }

    function test_totalAssetsEmpty() public view {
        assertEq(vault.totalAssets(), 0, "empty vault should have 0 assets");
    }

    function test_setLtvParams() public {
        vault.setLtvParams(6_000, 8_000, 300);
        assertEq(vault.targetLtv(), 6_000);
        assertEq(vault.maxLtv(), 8_000);
        assertEq(vault.rebalanceThreshold(), 300);
    }

    function test_setLtvParams_onlyOwner() public {
        vm.prank(user);
        vm.expectRevert();
        vault.setLtvParams(6_000, 8_000, 300);
    }

    function test_addCollateral() public {
        deal(spyx, keeper, 10_000e18);

        vm.startPrank(keeper);
        IERC20(spyx).approve(address(vault), 10_000e18);
        vault.addCollateral(10_000e18);
        vm.stopPrank();

        assertGt(vault.collateralValue(), 0, "should have collateral");
    }
}
