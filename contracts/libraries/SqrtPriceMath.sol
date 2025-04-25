// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./FullMath.sol";

library SqrtPriceMath {
    uint256 internal constant Q96 = 0x1000000000000000000000000; // 2^96
    uint256 internal constant ROUND_DEC = 100000000000;

    /**
     * @dev Calculate sqrtPriceX96 from token balances
     * @param amount1 The amount of token1
     * @param amount0 The amount of token0
     * @param decimals1 Decimals of token1
     * @param decimals0 Decimals of token0
     * @return sqrtPriceX96 The sqrt price as a Q64.96
     */
    function calculateSqrtPriceX96(
        uint256 amount0,
        uint256 amount1,
        uint8 decimals0,
        uint8 decimals1
    ) internal pure returns (uint160) {
        if (amount0 == 0 || amount1 == 0) {
            revert("SqrtPriceMath: INSUFFICIENT_AMOUNT");
        }

        // Normalize amounts based on decimals to get the true reserve ratio
        uint256 adjustedAmount0 = amount0;
        uint256 adjustedAmount1 = amount1;

        // Adjust for decimal differences
        if (decimals0 > decimals1) {
            adjustedAmount1 = adjustedAmount1 * (10 ** (decimals0 - decimals1));
        } else if (decimals1 > decimals0) {
            adjustedAmount0 = adjustedAmount0 * (10 ** (decimals1 - decimals0));
        }

        // Calculate ratio (reserve1/reserve0)
        uint256 ratio = FullMath.mulDiv(
            adjustedAmount1,
            10 ** 18,
            adjustedAmount0
        );

        // Calculate sqrt(ratio) * 2^96
        uint256 sqrtRatio = sqrt(ratio);
        uint256 sqrtPriceX96Value = FullMath.mulDiv(sqrtRatio, Q96, 10 ** 9);

        return uint160(sqrtPriceX96Value);
    }

    /**
     * @dev Square root function using Newton's method
     * @param x The input number
     * @return y The square root of x
     */
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
