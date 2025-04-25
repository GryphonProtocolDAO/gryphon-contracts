# AgentToken Contract Documentation

`AgentToken` is an ERC20-compatible token contract that implements advanced features like automatic tax collection,
liquidity pool management, and token swapping mechanisms.

## Constants

```solidity
uint256 internal constant BP_DENOM = 10000;              // Basis points denominator (100% = 10000)
uint256 internal constant CALL_GAS_LIMIT = 50000;        // Gas limit for external calls
uint256 internal constant MAX_SWAP_THRESHOLD_MULTIPLE = 20; // Maximum multiple for swap threshold
uint24 public constant SWAP_V3_FEE = 2500;               // 0.25% fee for Uniswap V3
```

## Public State Variables

```solidity
address public swapV3Pool;                     // Address of the Uniswap V3 pool
uint256 public botProtectionDurationInSeconds; // Duration of bot protection
INonfungiblePositionManager public _nonfungiblePositionManager; // Uniswap V3 position manager
ISwapRouter public _swapRouter;               // Uniswap V3 router
uint32 public fundedDate;                     // Timestamp when initial liquidity was added
uint16 public projectBuyTaxBasisPoints;       // Buy tax in basis points
uint16 public projectSellTaxBasisPoints;      // Sell tax in basis points
uint16 public swapThresholdBasisPoints;       // Threshold for auto-swapping taxes
address public pairToken;                     // Token paired in the liquidity pool
address public projectTaxRecipient;           // Recipient of collected taxes
uint128 public projectTaxPendingSwap;         // Amount of tax pending swap
address public vault;                         // Project supply vault
```

## Public Functions

### Basic Token Information

```solidity
function name() public view returns (string memory)
```

Returns the name of the token.

```solidity
function symbol() public view returns (string memory)
```

Returns the symbol of the token.

```solidity
function decimals() public view returns (uint8)
```

Returns the number of decimals used - always 18.

```solidity
function totalSupply() public view returns (uint256)
```

Returns the total supply of the token.

### Tax Information

```solidity
function totalBuyTaxBasisPoints() public view returns (uint256)
```

Returns the total buy tax in basis points.

```solidity
function totalSellTaxBasisPoints() public view returns (uint256)
```

Returns the total sell tax in basis points.

### Balance and Allowance

```solidity
function balanceOf(address account) public view returns (uint256)
```

Returns the amount of tokens owned by the specified address.

```solidity
function allowance(address owner, address spender) public view returns (uint256)
```

Returns the remaining number of tokens that `spender` is allowed to spend on behalf of `owner`.

### Transfer and Approval

```solidity
function transfer(address to, uint256 amount) public returns (bool)
```

Transfers the specified amount of tokens to the recipient address.

```solidity
function transferFrom(address from, address to, uint256 amount) public returns (bool)
```

Transfers tokens from one address to another using the allowance mechanism.

```solidity
function approve(address spender, uint256 amount) public returns (bool)
```

Sets the amount of allowance given to a spender.

```solidity
function increaseAllowance(address spender, uint256 addedValue) public returns (bool)
```

Increases the allowance granted to `spender` by the caller.

```solidity
function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool)
```

Decreases the allowance granted to `spender` by the caller.

### Burning Functions

```solidity
function burn(uint256 value) public
```

Destroys a specified amount of tokens from the caller's account.

```solidity
function burnFrom(address account, uint256 value) public
```

Destroys a specified amount of tokens from an account, deducting from the caller's allowance.

### Liquidity Pool Management

```solidity
function isLiquidityPool(address queryAddress_) public view returns (bool)
```

Checks if an address is a registered liquidity pool.

```solidity
function liquidityPools() external view returns (address[] memory liquidityPools_)
```

Returns an array of all registered liquidity pool addresses.

### Caller Validation

```solidity
function isValidCaller(bytes32 queryHash_) public view returns (bool)
```

Checks if a code hash is registered as a valid caller.

```solidity
function validCallers() external view returns (bytes32[] memory validCallerHashes_)
```

Returns an array of all registered valid caller code hashes.

### Tax Distribution

```solidity
function distributeTaxTokens() external
```

Manually distributes accumulated tax tokens to the designated recipient.

### Price Calculation

```solidity
function calSqrtPriceX96() external view returns (uint256)
```

Calculates the square root price for the token pair in X96 format.

## Events

```solidity
event LiquidityPoolCreated(address indexed poolAddress)
```

Emitted when a new liquidity pool is created.

```solidity
event InitialLiquidityAdded(uint256 tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)
```

Emitted when initial liquidity is added to the pool.

```solidity
event LiquidityPoolAdded(address indexed poolAddress)
```

Emitted when a liquidity pool is registered.

```solidity
event LiquidityPoolRemoved(address indexed poolAddress)
```

Emitted when a liquidity pool is removed from the registry.

```solidity
event ValidCallerAdded(bytes32 indexed callerHash)
```

Emitted when a valid caller is registered.

```solidity
event ValidCallerRemoved(bytes32 indexed callerHash)
```

Emitted when a valid caller is removed from the registry.

```solidity
event ProjectTaxRecipientUpdated(address indexed recipient)
```

Emitted when the project tax recipient is updated.

```solidity
event AutoSwapThresholdUpdated(uint256 oldThreshold, uint256 newThreshold)
```

Emitted when the auto-swap threshold is updated.

```solidity
event ProjectTaxBasisPointsChanged(uint16 oldBuyTax, uint16 newBuyTax, uint16 oldSellTax, uint16 newSellTax)
```

Emitted when the project tax rates are changed.

```solidity
event ExternalCallError(uint8 errorCode)
```

Emitted when an external call fails.
