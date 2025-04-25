# FPair Contract

## Overview
The FPair contract is responsible for managing a token pair, handling reserves, and facilitating swaps between the two tokens.

## Public Functions (Without Access Restrictions)

### getReserves
```solidity
function getReserves() public view returns (uint256, uint256)
```
Returns the reserves of both tokens in the pair.
- **Return Values**
  - `uint256`: Amount of token0 (tokenA) in the pair
  - `uint256`: Amount of token1 (tokenB) in the pair

### kLast
```solidity
function kLast() public view returns (uint256)
```
Returns the constant product value of the pair.
- **Return Value**
  - `uint256`: The product of reserve0 and reserve1 (k = x * y)

### priceALast
```solidity
function priceALast() public view returns (uint256)
```
Calculates the price of token A in terms of token B.
- **Return Value**
  - `uint256`: The price of token A (reserve1 / reserve0)

### priceBLast
```solidity
function priceBLast() public view returns (uint256)
```
Calculates the price of token B in terms of token A.
- **Return Value**
  - `uint256`: The price of token B (reserve0 / reserve1)

### balance
```solidity
function balance() public view returns (uint256)
```
Returns the balance of token A in this pair.
- **Return Value**
  - `uint256`: The amount of token A held by the pair

### assetBalance
```solidity
function assetBalance() public view returns (uint256)
```
Returns the balance of token B (asset) in this pair.
- **Return Value**
  - `uint256`: The amount of token B held by the pair

### Note on Other Functions
Functions like `mint`, `swap`, `approval`, `transferAsset`, and `transferTo` are restricted to the router only and are therefore not included in this public interface documentation.
