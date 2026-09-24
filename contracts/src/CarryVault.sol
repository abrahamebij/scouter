// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IMorpho, MarketParams, Position, Market} from "./interfaces/IMorpho.sol";
import {IMetaMorpho} from "./interfaces/IMetaMorpho.sol";

interface ISwapRouter {
    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut);
}

interface IMorphoOracle {
    function price() external view returns (uint256);
}

/// @title CarryVault
/// @notice ERC-4626 vault that runs an aUSD carry trade on Morpho Blue.
///         Users deposit SPYx → vault collateralizes on Morpho → borrows aUSD
///         → deposits borrowed aUSD into the Flowdesk MetaMorpho vault.
///         On withdraw, surplus aUSD profit is swapped back to SPYx.
///         Profit = Flowdesk vault yield − Morpho borrow rate.
contract CarryVault is ERC4626, Ownable {
    using SafeERC20 for IERC20;

    // --- Morpho Blue ---
    IMorpho public immutable morpho;
    bytes32 public immutable marketId;
    MarketParams public marketParams;

    // --- Flowdesk MetaMorpho vault ---
    IMetaMorpho public immutable flowdeskVault;

    // --- Tokens ---
    IERC20 public immutable ausd;   // loan token (borrowed & deposited into Flowdesk)

    // --- Oracle ---
    IMorphoOracle public immutable oracle; // Morpho oracle for SPYx/aUSD pricing

    // --- Swap ---
    ISwapRouter public swapRouter;

    // --- Config ---
    uint256 public targetLtv;       // target borrow-to-collateral in BPS (e.g. 7000 = 70%)
    uint256 public maxLtv;          // hard cap LTV in BPS, must be < market LLTV
    uint256 public rebalanceThreshold; // BPS drift before rebalance (e.g. 500 = 5%)
    uint256 public constant BPS = 10_000;

    // --- Access ---
    address public keeper;

    // --- Events ---
    event Rebalanced(uint256 oldLtv, uint256 newLtv);
    event KeeperUpdated(address indexed newKeeper);
    event LtvUpdated(uint256 newTarget, uint256 newMax, uint256 newThreshold);
    event PositionOpened(uint256 collateralAdded, uint256 borrowed, uint256 deposited);
    event PositionClosed(uint256 withdrawn, uint256 repaid, uint256 collateralRemoved, uint256 surplusSwapped);
    event SwapRouterUpdated(address indexed newRouter);

    constructor(
        address _morpho,
        bytes32 _marketId,
        address _flowdeskVault,
        address _ausd,
        address _spyx,
        address _swapRouter,
        address _oracle,
        uint256 _targetLtv,
        uint256 _maxLtv,
        uint256 _rebalanceThreshold
    )
        ERC4626(IERC20(_spyx))
        ERC20("YieldX S&P500 Carry", "yxCARRY")
        Ownable(msg.sender)
    {
        morpho = IMorpho(_morpho);
        marketId = _marketId;
        flowdeskVault = IMetaMorpho(_flowdeskVault);
        ausd = IERC20(_ausd);
        oracle = IMorphoOracle(_oracle);
        swapRouter = ISwapRouter(_swapRouter);

        targetLtv = _targetLtv;
        maxLtv = _maxLtv;
        rebalanceThreshold = _rebalanceThreshold;

        // Cache market params from Morpho
        marketParams = morpho.idToMarketParams(_marketId);
        require(marketParams.loanToken == _ausd, "loan token mismatch");
        require(marketParams.collateralToken == _spyx, "collateral token mismatch");

        // Approvals
        IERC20(_ausd).approve(_morpho, type(uint256).max);
        IERC20(_spyx).approve(_morpho, type(uint256).max);
        IERC20(_ausd).approve(_flowdeskVault, type(uint256).max);
        IERC20(_ausd).approve(_swapRouter, type(uint256).max);
        IERC20(_spyx).approve(_swapRouter, type(uint256).max);
    }

    // ═══════════════════════════════════════════════════════════════
    //                        ERC-4626 OVERRIDES
    // ═══════════════════════════════════════════════════════════════

    /// @notice Net asset value denominated in SPYx.
    function totalAssets() public view override returns (uint256) {
        uint256 idleSpyx = IERC20(asset()).balanceOf(address(this));

        Position memory pos = morpho.position(marketId, address(this));
        uint256 collateral = uint256(pos.collateral);
        uint256 debt = _borrowSharesToAssets(pos.borrowShares);

        uint256 flowdeskShares = flowdeskVault.balanceOf(address(this));
        uint256 flowdeskAusd = flowdeskShares > 0
            ? flowdeskVault.convertToAssets(flowdeskShares)
            : 0;

        if (collateral == 0) return idleSpyx;

        // Convert net aUSD position to SPYx equivalent using oracle
        uint256 oraclePrice = oracle.price();
        if (oraclePrice == 0) return idleSpyx + collateral;

        if (flowdeskAusd >= debt) {
            uint256 surplusAusd = flowdeskAusd - debt;
            // aUSD → SPYx: multiply by 1e36, divide by oracle price
            uint256 surplusSpyx = surplusAusd * 1e36 / oraclePrice;
            return idleSpyx + collateral + surplusSpyx;
        } else {
            uint256 deficitAusd = debt - flowdeskAusd;
            uint256 deficitSpyx = deficitAusd * 1e36 / oraclePrice;
            if (idleSpyx + collateral <= deficitSpyx) return 0;
            return idleSpyx + collateral - deficitSpyx;
        }
    }

    /// @dev After minting shares and receiving SPYx, collateralize and borrow
    function _deposit(address caller, address receiver, uint256 assets, uint256 shares) internal override {
        super._deposit(caller, receiver, assets, shares);
        _openPosition(assets);
    }

    /// @dev Unwind proportional position, swap surplus aUSD → SPYx, send SPYx to receiver
    function _withdraw(
        address caller,
        address receiver,
        address _owner,
        uint256 assets,
        uint256 shares
    ) internal override {
        uint256 totalSharesBefore = totalSupply();

        if (totalSharesBefore > 0) {
            _closePosition(shares, totalSharesBefore);
        }

        // Transfer SPYx to receiver
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
    //                     POSITION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /// @dev Open carry position: collateralize SPYx → borrow aUSD → deposit to Flowdesk
    function _openPosition(uint256 spyxDeposited) internal {
        if (spyxDeposited == 0) return;

        // Supply SPYx as collateral on Morpho
        morpho.supplyCollateral(marketParams, spyxDeposited, address(this), "");

        // Borrow only the delta between target and current debt
        uint256 targetDebt = _calcBorrowForTarget();
        Position memory pos = morpho.position(marketId, address(this));
        uint256 currentDebt = _borrowSharesToAssets(pos.borrowShares);
        uint256 borrowAmount = targetDebt > currentDebt ? targetDebt - currentDebt : 0;

        if (borrowAmount > 0) {
            morpho.borrow(marketParams, borrowAmount, 0, address(this), address(this));
            uint256 deposited = flowdeskVault.deposit(borrowAmount, address(this));
            emit PositionOpened(spyxDeposited, borrowAmount, deposited);
        } else {
            emit PositionOpened(spyxDeposited, 0, 0);
        }
    }

    /// @dev Close proportional carry position: withdraw Flowdesk → repay Morpho → free collateral → swap surplus
    function _closePosition(uint256 shares, uint256 totalShares) internal {
        // 1. Withdraw proportional Flowdesk position
        uint256 flowdeskShares = flowdeskVault.balanceOf(address(this));
        uint256 flowdeskToRedeem = flowdeskShares * shares / totalShares;

        uint256 ausdReceived = 0;
        if (flowdeskToRedeem > 0) {
            ausdReceived = flowdeskVault.redeem(flowdeskToRedeem, address(this), address(this));
        }

        // 2. Repay proportional Morpho debt
        Position memory pos = morpho.position(marketId, address(this));
        uint256 debtToRepay = _borrowSharesToAssets(pos.borrowShares) * shares / totalShares;

        uint256 ausdAfterRepay = ausdReceived;
        if (debtToRepay > 0) {
            uint256 repayAmount = debtToRepay > ausdReceived ? ausdReceived : debtToRepay;
            morpho.repay(marketParams, repayAmount, 0, address(this), "");
            ausdAfterRepay = ausdReceived - repayAmount;
        }

        // 3. Withdraw collateral (SPYx) — respect remaining debt
        uint256 maxCollateral = uint256(pos.collateral) * shares / totalShares;
        _withdrawSafeCollateral(maxCollateral);

        // 4. Swap any surplus aUSD profit → SPYx
        uint256 surplusSwapped = 0;
        if (ausdAfterRepay > 0) {
            surplusSwapped = swapRouter.swap(address(ausd), asset(), ausdAfterRepay);
        }

        emit PositionClosed(ausdReceived, debtToRepay, maxCollateral, surplusSwapped);
    }

    // ═══════════════════════════════════════════════════════════════
    //                          REBALANCE
    // ═══════════════════════════════════════════════════════════════

    /// @notice Rebalance the borrow position back to target LTV. Called by keeper or owner.
    function rebalance() external {
        require(msg.sender == keeper || msg.sender == owner(), "unauthorized");

        Position memory pos = morpho.position(marketId, address(this));
        require(pos.collateral > 0, "no position");

        uint256 currentDebt = _borrowSharesToAssets(pos.borrowShares);
        uint256 currentLtv = _getCurrentLtv();
        uint256 target = targetLtv;

        uint256 diff = currentLtv > target
            ? currentLtv - target
            : target - currentLtv;
        require(diff > rebalanceThreshold, "within tolerance");

        if (currentLtv > target) {
            uint256 targetDebt = _calcBorrowForTarget();
            uint256 toRepay = currentDebt - targetDebt;

            uint256 ausdWithdrawn = flowdeskVault.withdraw(toRepay, address(this), address(this));
            morpho.repay(marketParams, ausdWithdrawn, 0, address(this), "");
        } else {
            uint256 targetDebt = _calcBorrowForTarget();
            uint256 toBorrow = targetDebt - currentDebt;

            morpho.borrow(marketParams, toBorrow, 0, address(this), address(this));
            flowdeskVault.deposit(toBorrow, address(this));
        }

        uint256 newLtv = _getCurrentLtv();
        require(newLtv <= maxLtv, "exceeds max ltv");

        emit Rebalanced(currentLtv, newLtv);
    }

    /// @notice Supply additional SPYx collateral (called by keeper/owner to manage position)
    function addCollateral(uint256 amount) external {
        require(msg.sender == keeper || msg.sender == owner(), "unauthorized");
        IERC20(asset()).safeTransferFrom(msg.sender, address(this), amount);
        morpho.supplyCollateral(marketParams, amount, address(this), "");
    }

    // ═══════════════════════════════════════════════════════════════
    //                          VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function getCurrentLtv() external view returns (uint256) {
        return _getCurrentLtv();
    }

    function getHealthFactor() external view returns (uint256) {
        uint256 ltv = _getCurrentLtv();
        if (ltv == 0) return type(uint256).max;
        // Convert LTV from BPS to 1e18 scale to match Morpho's LLTV
        uint256 ltvScaled = ltv * 1e18 / BPS;
        return marketParams.lltv * 1e18 / ltvScaled;
    }

    function vaultDeposited() external view returns (uint256) {
        uint256 shares = flowdeskVault.balanceOf(address(this));
        return shares > 0 ? flowdeskVault.convertToAssets(shares) : 0;
    }

    function collateralValue() external view returns (uint256) {
        Position memory pos = morpho.position(marketId, address(this));
        return pos.collateral;
    }

    function debtValue() external view returns (uint256) {
        Position memory pos = morpho.position(marketId, address(this));
        return _borrowSharesToAssets(pos.borrowShares);
    }

    function getNetSpread() external pure returns (int256) {
        return 0; // Placeholder — rates are dynamic
    }

    // ═══════════════════════════════════════════════════════════════
    //                          ADMIN
    // ═══════════════════════════════════════════════════════════════

    function setKeeper(address _keeper) external onlyOwner {
        keeper = _keeper;
        emit KeeperUpdated(_keeper);
    }

    function setLtvParams(uint256 _targetLtv, uint256 _maxLtv, uint256 _threshold) external onlyOwner {
        require(_targetLtv < _maxLtv, "target must be < max");
        require(_maxLtv < marketParams.lltv, "max must be < lltv");
        targetLtv = _targetLtv;
        maxLtv = _maxLtv;
        rebalanceThreshold = _threshold;
        emit LtvUpdated(_targetLtv, _maxLtv, _threshold);
    }

    function setSwapRouter(address _swapRouter) external onlyOwner {
        // Revoke old approvals
        ausd.approve(address(swapRouter), 0);
        IERC20(asset()).approve(address(swapRouter), 0);

        swapRouter = ISwapRouter(_swapRouter);

        // Set new approvals
        ausd.approve(_swapRouter, type(uint256).max);
        IERC20(asset()).approve(_swapRouter, type(uint256).max);

        emit SwapRouterUpdated(_swapRouter);
    }

    /// @notice Emergency: withdraw all from Flowdesk, repay all debt, free all collateral
    ///         If there's dust debt the vault can't cover, frees as much collateral as possible.
    function emergencyUnwind() external onlyOwner {
        uint256 flowdeskShares = flowdeskVault.balanceOf(address(this));
        if (flowdeskShares > 0) {
            flowdeskVault.redeem(flowdeskShares, address(this), address(this));
        }

        // Repay as much debt as we can
        Position memory pos = morpho.position(marketId, address(this));
        uint256 debt = _borrowSharesToAssets(pos.borrowShares);
        if (debt > 0) {
            uint256 bal = ausd.balanceOf(address(this));
            uint256 repayAmount = debt > bal ? bal : debt;
            morpho.repay(marketParams, repayAmount, 0, address(this), "");
        }

        // Free as much collateral as possible
        _withdrawSafeCollateral(type(uint256).max);
    }

    // ═══════════════════════════════════════════════════════════════
    //                          INTERNAL
    // ═══════════════════════════════════════════════════════════════

    /// @dev Withdraw up to `maxAmount` collateral, leaving enough to satisfy Morpho's health check.
    ///      Morpho does two separate floor divisions:
    ///        maxBorrow = (collateral * price / 1e36) * lltv / 1e18
    ///      We invert each step with ceil division to find the minimum collateral.
    function _withdrawSafeCollateral(uint256 maxAmount) internal {
        Position memory pos = morpho.position(marketId, address(this));
        if (pos.collateral == 0) return;

        uint256 collateralToFree;

        if (pos.borrowShares == 0) {
            collateralToFree = uint256(pos.collateral);
        } else {
            Market memory mkt = morpho.market(marketId);

            // Match Morpho's toAssetsUp: round UP
            uint256 borrowed = (uint256(pos.borrowShares) * uint256(mkt.totalBorrowAssets) + uint256(mkt.totalBorrowShares) - 1) / uint256(mkt.totalBorrowShares);

            uint256 oraclePrice = oracle.price();
            uint256 lltv = marketParams.lltv;

            // Invert Morpho's two-step floor division:
            // Step 2: step1 * lltv / 1e18 >= borrowed  →  step1 >= ceil(borrowed * 1e18 / lltv)
            uint256 minStep1 = (borrowed * 1e18 + lltv - 1) / lltv;
            // Step 1: collateral * price / 1e36 >= minStep1  →  collateral >= ceil(minStep1 * 1e36 / price)
            uint256 minCollateral = (minStep1 * 1e36 + oraclePrice - 1) / oraclePrice;
            minCollateral += 1; // +1 for absolute safety

            uint256 current = uint256(pos.collateral);
            collateralToFree = current > minCollateral ? current - minCollateral : 0;
        }

        if (collateralToFree > maxAmount) collateralToFree = maxAmount;
        if (collateralToFree > 0) {
            morpho.withdrawCollateral(marketParams, collateralToFree, address(this), address(this));
        }
    }

    /// @dev Convert SPYx collateral to aUSD value using Morpho oracle
    function _collateralToLoan(uint256 collateral) internal view returns (uint256) {
        return collateral * oracle.price() / 1e36;
    }

    function _getCurrentLtv() internal view returns (uint256) {
        Position memory pos = morpho.position(marketId, address(this));
        if (pos.collateral == 0) return 0;
        uint256 debt = _borrowSharesToAssets(pos.borrowShares);
        if (debt == 0) return 0;
        uint256 collateralInAusd = _collateralToLoan(uint256(pos.collateral));
        if (collateralInAusd == 0) return type(uint256).max;
        return debt * BPS / collateralInAusd;
    }

    function _calcBorrowForTarget() internal view returns (uint256) {
        Position memory pos = morpho.position(marketId, address(this));
        if (pos.collateral == 0) return 0;
        uint256 collateralInAusd = _collateralToLoan(uint256(pos.collateral));
        return collateralInAusd * targetLtv / BPS;
    }

    function _borrowSharesToAssets(uint128 borrowShares) internal view returns (uint256) {
        if (borrowShares == 0) return 0;
        Market memory mkt = morpho.market(marketId);
        if (mkt.totalBorrowShares == 0) return 0;
        return uint256(borrowShares) * uint256(mkt.totalBorrowAssets) / uint256(mkt.totalBorrowShares);
    }
}
