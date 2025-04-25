# FFactory Contract

## Overview
The FFactory contract is responsible for creating and managing token pairs within the Gryphon Finance protocol.

## Public Functions (Without Access Restrictions)

### getPair
```solidity
function getPair(address tokenA, address tokenB) public view returns (address)
```
Returns the pair address for two tokens.
- **Parameters**
  - `tokenA`: The address of the first token
  - `tokenB`: The address of the second token
- **Return Value**
  - `address`: The address of the pair contract

### allPairsLength
```solidity
function allPairsLength() public view returns (uint)
```
Returns the total number of pairs created.
- **Return Value**
  - `uint`: The number of pairs

### Note on Other Functions
Functions like `createPair`, `setTaxParams`, and `setRouter` require specific roles (CREATOR_ROLE or ADMIN_ROLE) and are therefore not included in this public interface documentation.
