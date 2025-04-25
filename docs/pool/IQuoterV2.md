# IQuoterV2 Interface Documentation

The `IQuoterV2` interface provides functionality to calculate exact input or exact output swap amounts without executing actual swaps.

> Note: These functions are not marked as view functions because they rely on calling non-view functions and reverting to compute the result. They are also not gas efficient and should not be called on-chain.

## Functions

### quoteExactInput

Returns the output amount for a given exact input swap without executing the swap.

**Parameters:**
- `path` (bytes): The path of the swap, i.e., each token pair and pool fee
- `amountIn` (uint256): The amount of the first token to swap

**Returns:**
- `amountOut` (uint256): The amount of the last token that would be received
- `sqrtPriceX96AfterList` (uint160[]): List of sqrt prices after the swap for each pool in the path
- `initializedTicksCrossedList` (uint32[]): List of initialized ticks crossed during the swap for each pool in the path
- `gasEstimate` (uint256): The estimated gas consumption for the swap

### quoteExactInputSingle

Returns the output amount for a given exact input swap but for a single pool.

**Parameters:**
- `params` (QuoteExactInputSingleParams): Parameter structure containing:
  - `tokenIn`: The address of the input token
  - `tokenOut`: The address of the output token
  - `amountIn`: The desired input amount
  - `fee`: The pool fee to consider for the token pair
  - `sqrtPriceLimitX96`: The price limit that cannot be exceeded by the swap

**Returns:**
- `amountOut` (uint256): The amount of `tokenOut` that would be received
- `sqrtPriceX96After` (uint160): The sqrt price of the pool after the swap
- `initializedTicksCrossed` (uint32): The number of initialized ticks crossed during the swap
- `gasEstimate` (uint256): The estimated gas consumption for the swap

### quoteExactOutput

Returns the input amount required for a given exact output swap without executing the swap.

**Parameters:**
- `path` (bytes): The path of the swap, i.e., each token pair and pool fee. Path must be provided in reverse order
- `amountOut` (uint256): The amount of the last token to receive

**Returns:**
- `amountIn` (uint256): The amount of the first token required to be paid
- `sqrtPriceX96AfterList` (uint160[]): List of sqrt prices after the swap for each pool in the path
- `initializedTicksCrossedList` (uint32[]): List of initialized ticks crossed during the swap for each pool in the path
- `gasEstimate` (uint256): The estimated gas consumption for the swap

### quoteExactOutputSingle

Returns the input amount required to receive the given exact output amount, but for a swap of a single pool.

**Parameters:**
- `params` (QuoteExactOutputSingleParams): Parameter structure containing:
  - `tokenIn`: The address of the input token
  - `tokenOut`: The address of the output token
  - `amount`: The desired output amount
  - `fee`: The pool fee to consider for the token pair
  - `sqrtPriceLimitX96`: The price limit that cannot be exceeded by the swap

**Returns:**
- `amountIn` (uint256): The amount required as input to receive `amountOut`
- `sqrtPriceX96After` (uint160): The sqrt price of the pool after the swap
- `initializedTicksCrossed` (uint32): The number of initialized ticks crossed during the swap
- `gasEstimate` (uint256): The estimated gas consumption for the swap

## Structs

### QuoteExactInputSingleParams

Parameter struct for the `quoteExactInputSingle` function.

**Fields:**
- `tokenIn` (address): The address of the input token
- `tokenOut` (address): The address of the output token
- `amountIn` (uint256): The desired input amount
- `fee` (uint24): The pool fee to consider for the token pair
- `sqrtPriceLimitX96` (uint160): The price limit that cannot be exceeded by the swap

### QuoteExactOutputSingleParams

Parameter struct for the `quoteExactOutputSingle` function.

**Fields:**
- `tokenIn` (address): The address of the input token
- `tokenOut` (address): The address of the output token
- `amount` (uint256): The desired output amount
- `fee` (uint24): The pool fee to consider for the token pair
- `sqrtPriceLimitX96` (uint160): The price limit that cannot be exceeded by the swap
