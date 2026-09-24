// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IPriceOracleGetter} from "./interfaces/IPriceOracleGetter.sol";

/// @title MockSwapRouter
/// @notice Simulates a DEX for USDC <-> wSPYx swaps using Tydro oracle prices.
///         Must be pre-funded with both tokens. For testnet use only.
contract MockSwapRouter is Ownable {
    using SafeERC20 for IERC20;

    IPriceOracleGetter public immutable oracle;
    IERC20 public immutable usdc;
    IERC20 public immutable wspyx;

    uint8 public immutable usdcDecimals;
    uint8 public immutable wspyxDecimals;

    uint256 public spreadBps; // e.g. 30 = 0.30%
    uint256 public constant BPS = 10_000;

    event Swap(address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);

    constructor(
        address _oracle,
        address _usdc,
        address _wspyx,
        uint8 _usdcDecimals,
        uint8 _wspyxDecimals,
        uint256 _spreadBps
    ) Ownable(msg.sender) {
        oracle = IPriceOracleGetter(_oracle);
        usdc = IERC20(_usdc);
        wspyx = IERC20(_wspyx);
        usdcDecimals = _usdcDecimals;
        wspyxDecimals = _wspyxDecimals;
        spreadBps = _spreadBps;
    }

    /// @notice Swap tokenIn for tokenOut at oracle price minus spread
    /// @param tokenIn Address of input token (must be usdc or wspyx)
    /// @param tokenOut Address of output token (must be usdc or wspyx)
    /// @param amountIn Amount of tokenIn to swap
    /// @return amountOut Amount of tokenOut received
    function swap(address tokenIn, address tokenOut, uint256 amountIn) external returns (uint256 amountOut) {
        require(
            (tokenIn == address(usdc) && tokenOut == address(wspyx))
                || (tokenIn == address(wspyx) && tokenOut == address(usdc)),
            "invalid pair"
        );

        uint256 priceIn = oracle.getAssetPrice(tokenIn);
        uint256 priceOut = oracle.getAssetPrice(tokenOut);

        uint8 decimalsIn = tokenIn == address(usdc) ? usdcDecimals : wspyxDecimals;
        uint8 decimalsOut = tokenIn == address(usdc) ? wspyxDecimals : usdcDecimals;

        // amountOut = amountIn * priceIn / priceOut, adjusted for decimals
        amountOut = amountIn * priceIn * (10 ** decimalsOut) / (priceOut * (10 ** decimalsIn));

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
}
