# FRouter Contract

## Overview
The FRouter contract is responsible for handling token swaps and liquidity operations within the Gryphon Finance protocol.

## Public Functions (Without Access Restrictions)

### getAmountsOut
```solidity
function getAmountsOut(address token, address assetToken_, uint256 amountIn) public view returns (uint256 _amountOut)
```
Calculates the expected output amount for a given input amount.
- **Parameters**
  - `token`: The address of the input token
  - `assetToken_`: The address of the output token (or address(0) if calculating for a sell transaction)
  - `amountIn`: The input amount
- **Return Value**
  - `_amountOut`: The expected output amount

### Note on Other Functions
All other functions in the FRouter contract require specific roles (EXECUTOR_ROLE or ADMIN_ROLE) and are therefore not included in this public interface documentation.
