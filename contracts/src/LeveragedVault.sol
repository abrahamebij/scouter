// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IPool} from "./interfaces/IPool.sol";
import {IPoolAddressesProvider} from "./interfaces/IPoolAddressesProvider.sol";
import {IPriceOracleGetter} from "./interfaces/IPriceOracleGetter.sol";
import {IFlashLoanSimpleReceiver} from "./interfaces/IFlashLoanSimpleReceiver.sol";
import {MockSwapRouter} from "./MockSwapRouter.sol";

/// @title LeveragedVault
/// @notice ERC-4626 vault that creates leveraged exposure to wSPYx (tokenized S&P 500)
///         by looping through Tydro (Aave V3 fork) on Ink L2.
contract LeveragedVault is ERC4626, IFlashLoanSimpleReceiver, Ownable {
    using SafeERC20 for IERC20;

    // --- Tydro protocol ---
    IPoolAddressesProvider public immutable ADDRESSES_PROVIDER;
    IPool public immutable POOL;
    IPriceOracleGetter public immutable oracle;

    // --- Tokens ---
    IERC20 public immutable wspyx;
    IERC20 public immutable aWspyx;   // aToken (collateral receipt)
    IERC20 public immutable debtUsdc; // variable debt token

    // --- Swap ---
    MockSwapRouter public swapRouter;

    // --- Leverage config ---
    uint256 public targetLeverageRatio; // in BPS, e.g. 30000 = 3x
    uint256 public leverageTolerance;   // BPS drift before rebalance, e.g. 1000 = 10%
    uint256 public minHealthFactor;     // minimum HF after operations (18 decimals), e.g. 1.2e18
    uint256 public constant BPS = 10_000;

    // --- Access ---
    address public keeper;

    // --- Flash loan state ---
    enum FlashLoanAction { OPEN, CLOSE, REBALANCE_UP, REBALANCE_DOWN }

    bool private _inFlashLoan;

    // --- Events ---
    event Rebalanced(uint256 oldLeverage, uint256 newLeverage);
    event KeeperUpdated(address indexed newKeeper);
    event LeverageUpdated(uint256 newTarget, uint256 newTolerance);

    constructor(
        IPoolAddressesProvider _addressesProvider,
        address _usdc,
        address _wspyx,
        address _aWspyx,
        address _debtUsdc,
        address _swapRouter,
        uint256 _targetLeverageRatio,
        uint256 _leverageTolerance,
        uint256 _minHealthFactor
    )
        ERC4626(IERC20(_usdc))
        ERC20("YieldX Leveraged SPY", "yxSPY")
        Ownable(msg.sender)
    {
        ADDRESSES_PROVIDER = _addressesProvider;
        POOL = IPool(_addressesProvider.getPool());
        oracle = IPriceOracleGetter(_addressesProvider.getPriceOracle());

        wspyx = IERC20(_wspyx);
        aWspyx = IERC20(_aWspyx);
        debtUsdc = IERC20(_debtUsdc);
        swapRouter = MockSwapRouter(_swapRouter);

        targetLeverageRatio = _targetLeverageRatio;
        leverageTolerance = _leverageTolerance;
        minHealthFactor = _minHealthFactor;

        // Approve pool for supply/repay
        IERC20(_usdc).approve(address(POOL), type(uint256).max);
        IERC20(_wspyx).approve(address(POOL), type(uint256).max);

        // Approve swap router
        IERC20(_usdc).approve(_swapRouter, type(uint256).max);
        IERC20(_wspyx).approve(_swapRouter, type(uint256).max);
    }

    // ═══════════════════════════════════════════════════════════════
    //                        ERC-4626 OVERRIDES
    // ═══════════════════════════════════════════════════════════════

    /// @notice Net asset value: collateral value minus debt, denominated in USDC
    function totalAssets() public view override returns (uint256) {
        uint256 collateralBal = aWspyx.balanceOf(address(this));
        uint256 debtBal = debtUsdc.balanceOf(address(this));
        uint256 idleUsdc = IERC20(asset()).balanceOf(address(this));

        if (collateralBal == 0) return idleUsdc;

        uint256 wspyxPrice = oracle.getAssetPrice(address(wspyx));
        uint256 usdcPrice = oracle.getAssetPrice(asset());

        // Both prices are in base currency units (8 decimals USD).
        // collateral value in base = collateralBal * wspyxPrice / 10^18
        // debt value in base = debtBal * usdcPrice / 10^6
        // net value in USDC = (collateralValueBase - debtValueBase) * 10^6 / usdcPrice

        uint256 collateralValueBase = collateralBal * wspyxPrice / 1e18;
        uint256 debtValueBase = debtBal * usdcPrice / 1e6;

        if (collateralValueBase <= debtValueBase) return idleUsdc;

        uint256 netValueBase = collateralValueBase - debtValueBase;
        uint256 netUsdc = netValueBase * 1e6 / usdcPrice;

        return netUsdc + idleUsdc;
    }

    /// @dev After minting shares and receiving USDC, open the leveraged position
    function _deposit(address caller, address receiver, uint256 assets, uint256 shares) internal override {
        // Transfer USDC from caller and mint shares
        super._deposit(caller, receiver, assets, shares);

        // Calculate flash loan amount for target leverage
        // For 3x on `assets`: total exposure = assets * 3, flash = assets * 2
        uint256 flashLoanAmount = assets * (targetLeverageRatio - BPS) / BPS;

        if (flashLoanAmount > 0) {
            bytes memory params = abi.encode(FlashLoanAction.OPEN, assets);
            _inFlashLoan = true;
            POOL.flashLoanSimple(address(this), asset(), flashLoanAmount, params, 0);
            _inFlashLoan = false;

            _checkHealthFactor();
        }
    }

    /// @dev Unwind proportional position before sending USDC to receiver
    function _withdraw(
        address caller,
        address receiver,
        address _owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        uint256 totalSharesBefore = totalSupply();
        uint256 debtBal = debtUsdc.balanceOf(address(this));

        if (debtBal > 0 && totalSharesBefore > 0) {
            // Proportional debt to repay
            uint256 debtToRepay = debtBal * shares / totalSharesBefore;

            if (debtToRepay > 0) {
                bytes memory params = abi.encode(FlashLoanAction.CLOSE, shares, totalSharesBefore);
                _inFlashLoan = true;
                POOL.flashLoanSimple(address(this), asset(), debtToRepay, params, 0);
                _inFlashLoan = false;
            }
        }

        // Send actual USDC available (may be less than `assets` due to swap spread)
        uint256 available = IERC20(asset()).balanceOf(address(this));
        uint256 toSend = assets > available ? available : assets;

        if (caller != _owner) {
            _spendAllowance(_owner, caller, shares);
        }
        _burn(_owner, shares);

        IERC20(asset()).safeTransfer(receiver, toSend);

        emit Withdraw(caller, receiver, _owner, toSend, shares);
    }

    // ═══════════════════════════════════════════════════════════════
    //                        FLASH LOAN CALLBACK
    // ═══════════════════════════════════════════════════════════════

    function executeOperation(
        address _asset,
        uint256 amount,
        uint256 premium,
        address initiator,
        bytes calldata params
    ) external returns (bool) {
        require(msg.sender == address(POOL), "caller must be pool");
        require(initiator == address(this), "initiator must be vault");

        FlashLoanAction action = abi.decode(params, (FlashLoanAction));

        if (action == FlashLoanAction.OPEN) {
            (, uint256 depositAmount) = abi.decode(params, (FlashLoanAction, uint256));
            _executeOpen(amount, premium, depositAmount);
        } else if (action == FlashLoanAction.CLOSE) {
            (, uint256 shares, uint256 totalSharesBefore) =
                abi.decode(params, (FlashLoanAction, uint256, uint256));
            _executeClose(amount, premium, shares, totalSharesBefore);
        } else if (action == FlashLoanAction.REBALANCE_UP) {
            _executeRebalanceUp(amount, premium);
        } else if (action == FlashLoanAction.REBALANCE_DOWN) {
            _executeRebalanceDown(amount, premium);
        }

        // Pool already has max approval from constructor — no need to re-approve
        return true;
    }

    // ═══════════════════════════════════════════════════════════════
    //                        FLASH LOAN ACTIONS
    // ═══════════════════════════════════════════════════════════════

    function _executeOpen(uint256 flashAmount, uint256 premium, uint256 depositAmount) internal {
        // Vault holds: depositAmount (user's) + flashAmount (flash loaned) USDC
        uint256 totalUsdc = depositAmount + flashAmount;

        // 1. Swap all USDC → wSPYx
        uint256 wspyxReceived = swapRouter.swap(asset(), address(wspyx), totalUsdc);

        // 2. Supply wSPYx as collateral to Tydro
        POOL.supply(address(wspyx), wspyxReceived, address(this), 0);

        // 3. Borrow USDC to repay flash loan
        uint256 borrowAmount = flashAmount + premium;
        POOL.borrow(asset(), borrowAmount, 2, 0, address(this));
    }

    function _executeClose(
        uint256 flashAmount,
        uint256 premium,
        uint256 shares,
        uint256 totalSharesBefore
    ) internal {
        // 1. Repay USDC debt on Tydro
        POOL.repay(asset(), flashAmount, 2, address(this));

        // 2. Withdraw proportional wSPYx collateral
        uint256 totalCollateral = aWspyx.balanceOf(address(this));
        uint256 collateralToWithdraw;

        if (shares >= totalSharesBefore) {
            // Full withdrawal — take everything
            collateralToWithdraw = totalCollateral;
        } else {
            collateralToWithdraw = totalCollateral * shares / totalSharesBefore;
        }

        POOL.withdraw(address(wspyx), collateralToWithdraw, address(this));

        // 3. Swap wSPYx → USDC
        swapRouter.swap(address(wspyx), asset(), collateralToWithdraw);

        // usdcReceived covers: flash repayment (flashAmount + premium) + user's assets
        // The flash loan repayment is handled by the approve at the end of executeOperation
        // Remaining USDC stays in vault for the _withdraw transfer
    }

    function _executeRebalanceUp(uint256 flashAmount, uint256 premium) internal {
        // Lever up: swap USDC → wSPYx, supply, borrow to repay flash
        uint256 wspyxReceived = swapRouter.swap(asset(), address(wspyx), flashAmount);
        POOL.supply(address(wspyx), wspyxReceived, address(this), 0);
        POOL.borrow(asset(), flashAmount + premium, 2, 0, address(this));
    }

    function _executeRebalanceDown(uint256 flashAmount, uint256 premium) internal {
        // Delever: repay debt, withdraw collateral, swap to USDC
        POOL.repay(asset(), flashAmount, 2, address(this));

        // Calculate collateral to free based on debt repaid
        uint256 wspyxPrice = oracle.getAssetPrice(address(wspyx));
        uint256 usdcPrice = oracle.getAssetPrice(asset());
        // Convert flashAmount USDC to equivalent wSPYx value + buffer for premium
        uint256 collateralToWithdraw = (flashAmount + premium) * usdcPrice * 1e18 / (wspyxPrice * 1e6);
        // Add small buffer for rounding (0.1%)
        collateralToWithdraw = collateralToWithdraw * 10010 / 10000;

        uint256 maxCollateral = aWspyx.balanceOf(address(this));
        if (collateralToWithdraw > maxCollateral) {
            collateralToWithdraw = maxCollateral;
        }

        POOL.withdraw(address(wspyx), collateralToWithdraw, address(this));

        // Swap wSPYx → USDC to repay flash loan
        swapRouter.swap(address(wspyx), asset(), collateralToWithdraw);
    }

    // ═══════════════════════════════════════════════════════════════
    //                          REBALANCE
    // ═══════════════════════════════════════════════════════════════

    /// @notice Rebalance the vault back to target leverage. Called by keeper or owner.
    function rebalance() external {
        require(msg.sender == keeper || msg.sender == owner(), "unauthorized");

        (uint256 totalCollateralBase, uint256 totalDebtBase,,,,) =
            POOL.getUserAccountData(address(this));

        require(totalCollateralBase > totalDebtBase, "underwater");

        uint256 netValueBase = totalCollateralBase - totalDebtBase;
        uint256 currentLeverage = totalCollateralBase * BPS / netValueBase;

        uint256 diff = currentLeverage > targetLeverageRatio
            ? currentLeverage - targetLeverageRatio
            : targetLeverageRatio - currentLeverage;
        require(diff > leverageTolerance, "within tolerance");

        uint256 usdcPrice = oracle.getAssetPrice(asset());

        if (currentLeverage > targetLeverageRatio) {
            // Over-leveraged → reduce debt
            uint256 targetDebtBase = netValueBase * (targetLeverageRatio - BPS) / BPS;
            uint256 debtReductionBase = totalDebtBase - targetDebtBase;
            uint256 debtReductionUsdc = debtReductionBase * 1e6 / usdcPrice;

            bytes memory params = abi.encode(FlashLoanAction.REBALANCE_DOWN);
            _inFlashLoan = true;
            POOL.flashLoanSimple(address(this), asset(), debtReductionUsdc, params, 0);
            _inFlashLoan = false;
        } else {
            // Under-leveraged → increase exposure
            uint256 targetDebtBase = netValueBase * (targetLeverageRatio - BPS) / BPS;
            uint256 debtIncreaseBase = targetDebtBase - totalDebtBase;
            uint256 flashAmount = debtIncreaseBase * 1e6 / usdcPrice;

            bytes memory params = abi.encode(FlashLoanAction.REBALANCE_UP);
            _inFlashLoan = true;
            POOL.flashLoanSimple(address(this), asset(), flashAmount, params, 0);
            _inFlashLoan = false;
        }

        // Verify post-rebalance state
        (uint256 newCollateral, uint256 newDebt,,,,) = POOL.getUserAccountData(address(this));
        uint256 newLeverage = newCollateral * BPS / (newCollateral - newDebt);

        _checkHealthFactor();

        emit Rebalanced(currentLeverage, newLeverage);
    }

    /// @notice Returns current leverage in BPS (e.g. 30000 = 3x)
    function getCurrentLeverage() external view returns (uint256) {
        (uint256 totalCollateralBase, uint256 totalDebtBase,,,,) =
            POOL.getUserAccountData(address(this));

        if (totalCollateralBase == 0) return 0;
        if (totalCollateralBase <= totalDebtBase) return type(uint256).max;

        return totalCollateralBase * BPS / (totalCollateralBase - totalDebtBase);
    }

    // ═══════════════════════════════════════════════════════════════
    //                          ADMIN
    // ═══════════════════════════════════════════════════════════════

    function setKeeper(address _keeper) external onlyOwner {
        keeper = _keeper;
        emit KeeperUpdated(_keeper);
    }

    function setTargetLeverage(uint256 _targetLeverageRatio, uint256 _tolerance) external onlyOwner {
        require(_targetLeverageRatio > BPS, "leverage must be > 1x");
        require(_targetLeverageRatio <= 50_000, "leverage must be <= 5x");
        targetLeverageRatio = _targetLeverageRatio;
        leverageTolerance = _tolerance;
        emit LeverageUpdated(_targetLeverageRatio, _tolerance);
    }

    function setSwapRouter(address _swapRouter) external onlyOwner {
        // Revoke old approvals
        IERC20(asset()).approve(address(swapRouter), 0);
        wspyx.approve(address(swapRouter), 0);

        swapRouter = MockSwapRouter(_swapRouter);

        // Set new approvals
        IERC20(asset()).approve(_swapRouter, type(uint256).max);
        wspyx.approve(_swapRouter, type(uint256).max);
    }

    function setMinHealthFactor(uint256 _minHealthFactor) external onlyOwner {
        minHealthFactor = _minHealthFactor;
    }

    // ═══════════════════════════════════════════════════════════════
    //                          INTERNAL
    // ═══════════════════════════════════════════════════════════════

    function _checkHealthFactor() internal view {
        (,,,,, uint256 healthFactor) = POOL.getUserAccountData(address(this));
        require(healthFactor >= minHealthFactor, "health factor too low");
    }
}
