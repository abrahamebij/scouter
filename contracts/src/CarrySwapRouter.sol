// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface IMorphoOracle {
    /// @notice Returns the price of 1 unit of collateral token in loan token units,
    ///         scaled by 1e36 / (10^collateralDecimals).
    function price() external view returns (uint256);
}

/// @title CarrySwapRouter
/// @notice Oracle-priced swap router for SPYx <-> aUSD on Ethereum mainnet.
///         Uses the Morpho oracle from the SPYx/aUSD market for pricing.
///         Must be pre-funded with both tokens. Owner can withdraw at any time.
contract CarrySwapRouter is Ownable {
    using SafeERC20 for IERC20;

    IMorphoOracle public immutable oracle;
    IERC20 public immutable spyx;
    IERC20 public immutable ausd;

    uint8 public immutable spyxDecimals;
    uint8 public immutable ausdDecimals;

    uint256 public spreadBps; // e.g. 30 = 0.30%
    uint256 public constant BPS = 10_000;

    event Swap(address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    constructor(
        address _oracle,
        address _spyx,
        address _ausd,
        uint8 _spyxDecimals,
        uint8 _ausdDecimals,
        uint256 _spreadBps
    ) Ownable(msg.sender) {
        oracle = IMorphoOracle(_oracle);
        spyx = IERC20(_spyx);
        ausd = IERC20(_ausd);
        spyxDecimals = _spyxDecimals;
        ausdDecimals = _ausdDecimals;
        spreadBps = _spreadBps;
    }

    /// @notice Swap tokenIn for tokenOut at oracle price minus spread
    /// @param tokenIn Address of input token (must be spyx or ausd)
    /// @param tokenOut Address of output token (must be spyx or ausd)
    /// @param amountIn Amount of tokenIn to swap
    /// @return amountOut Amount of tokenOut received
    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut) {
        require(
            (tokenIn == address(spyx) && tokenOut == address(ausd))
                || (tokenIn == address(ausd) && tokenOut == address(spyx)),
            "invalid pair"
        );

        // Morpho oracle.price() = price of 1e(collateralDecimals) collateral in loan token units
        // scaled by 1e36 / 1e(collateralDecimals) = 1e(36 - collateralDecimals)
        // So: price of 1 SPYx (in raw units) in aUSD = oracle.price() * 1e(ausdDecimals) / 1e36
        uint256 oraclePrice = oracle.price();

        if (tokenIn == address(spyx)) {
            // SPYx → aUSD
            // amountOut = amountIn * oraclePrice / 1e36
            amountOut = amountIn * oraclePrice / 1e36;
        } else {
            // aUSD → SPYx
            // amountOut = amountIn * 1e36 / oraclePrice
            amountOut = amountIn * 1e36 / oraclePrice;
        }

        // Apply spread (user gets less)
        amountOut = amountOut * (BPS - spreadBps) / BPS;

        require(IERC20(tokenOut).balanceOf(address(this)) >= amountOut, "insufficient liquidity");

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);

        emit Swap(tokenIn, tokenOut, amountIn, amountOut);
    }

    function setSpread(uint256 _spreadBps) external onlyOwner {
        require(_spreadBps < BPS, "spread too high");
        spreadBps = _spreadBps;
    }

    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(msg.sender, amount);
    }

    function withdrawAll(address token) external onlyOwner {
        uint256 bal = IERC20(token).balanceOf(address(this));
        if (bal > 0) {
            IERC20(token).safeTransfer(msg.sender, bal);
        }
    }
}
