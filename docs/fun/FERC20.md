# FERC20 Contract

## Overview
The FERC20 contract implements the ERC20 standard token with additional features such as transaction limits.

## Public Functions (Without Access Restrictions)

### name
```solidity
function name() public view returns (string memory)
```
Returns the name of the token.
- **Return Value**
  - `string`: The token name

### symbol
```solidity
function symbol() public view returns (string memory)
```
Returns the symbol of the token.
- **Return Value**
  - `string`: The token symbol

### decimals
```solidity
function decimals() public pure returns (uint8)
```
Returns the number of decimals used by the token.
- **Return Value**
  - `uint8`: The token decimals (18)

### totalSupply
```solidity
function totalSupply() public view returns (uint256)
```
Returns the total token supply.
- **Return Value**
  - `uint256`: The total supply

### balanceOf
```solidity
function balanceOf(address account) public view returns (uint256)
```
Returns the token balance of an account.
- **Parameters**
  - `account`: The address to query
- **Return Value**
  - `uint256`: The balance of the specified address

### transfer
```solidity
function transfer(address recipient, uint256 amount) public returns (bool)
```
Transfers tokens to a recipient.
- **Parameters**
  - `recipient`: The address to transfer to
  - `amount`: The amount to transfer
- **Return Value**
  - `bool`: Whether the transfer was successful
- **Note**: This function enforces the maxTx limit unless the sender is excluded.

### allowance
```solidity
function allowance(address owner, address spender) public view returns (uint256)
```
Returns the allowance granted by an owner to a spender.
- **Parameters**
  - `owner`: The address that owns the tokens
  - `spender`: The address that can spend the tokens
- **Return Value**
  - `uint256`: The remaining allowance

### approve
```solidity
function approve(address spender, uint256 amount) public returns (bool)
```
Approves a spender to spend tokens.
- **Parameters**
  - `spender`: The address to approve
  - `amount`: The amount to approve
- **Return Value**
  - `bool`: Whether the approval was successful

### transferFrom
```solidity
function transferFrom(address sender, address recipient, uint256 amount) public returns (bool)
```
Transfers tokens from one address to another.
- **Parameters**
  - `sender`: The address to transfer from
  - `recipient`: The address to transfer to
  - `amount`: The amount to transfer
- **Return Value**
  - `bool`: Whether the transfer was successful
- **Note**: This function enforces the maxTx limit unless the sender is excluded.

### Note on Other Functions
Functions like `updateMaxTx`, `excludeFromMaxTx`, and `burnFrom` require owner permissions and are therefore not included in this public interface documentation.
