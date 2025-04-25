// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "../libraries/SqrtPriceMath.sol";

contract SqrtPriceMathTest {
    /**
     * @dev Wrapper for the calculateSqrtPriceX96 function in the SqrtPriceMath library
     */
    function calculateSqrtPriceX96(
        uint256 amount0,
        uint256 amount1,
        uint8 decimals0,
        uint8 decimals1
    ) external pure returns (uint160) {
        return
            SqrtPriceMath.calculateSqrtPriceX96(
                amount0,
                amount1,
                decimals0,
                decimals1
            );
    }

    /**
     * @dev Wrapper for the sqrt function in the SqrtPriceMath library
     */
    function sqrt(uint256 x) external pure returns (uint256) {
        return SqrtPriceMath.sqrt(x);
    }
}
