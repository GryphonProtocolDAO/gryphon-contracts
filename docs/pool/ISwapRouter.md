# ISwapRouter Interface Documentation

The `ISwapRouter` interface provides functionality for token swapping via PancakeSwap V3.

## Functions

### exactInputSingle

Swaps `amountIn` of one token for as much as possible of another token.

**Parameters:**
- `params` (ExactInputSingleParams): Parameters encoded as `ExactInputSingleParams` in calldata, including:
  - `tokenIn`: The address of the input token
  - `tokenOut`: The address of the output token
  - `fee`: The pool fee
  - `recipient`: The address that will receive the output tokens
  - `deadline`: The transaction deadline timestamp
  - `amountIn`: The input token amount
  - `amountOutMinimum`: The minimum output token amount
  - `sqrtPriceLimitX96`: The price limit

**Returns:**
- `amountOut` (uint256): The amount of the received output token

### exactInput

Swaps `amountIn` of one token for as much as possible of another along the specified path.

**Parameters:**
- `params` (ExactInputParams): Multi-hop swap parameters encoded as `ExactInputParams` in calldata, including:
  - `path`: The swap path
  - `recipient`: The address that will receive the output tokens
  - `deadline`: The transaction deadline timestamp
  - `amountIn`: The input token amount
  - `amountOutMinimum`: The minimum output token amount

**Returns:**
- `amountOut` (uint256): The amount of the received output token

### exactOutputSingle

Swaps as little as possible of one token for `amountOut` of another token.

**Parameters:**
- `params` (ExactOutputSingleParams): Parameters encoded as `ExactOutputSingleParams` in calldata, including:
  - `tokenIn`: The address of the input token
  - `tokenOut`: The address of the output token
  - `fee`: The pool fee
  - `recipient`: The address that will receive the output tokens
  - `deadline`: The transaction deadline timestamp
  - `amountOut`: The desired output token amount
  - `amountInMaximum`: The maximum input token amount
  - `sqrtPriceLimitX96`: The price limit

**Returns:**
- `amountIn` (uint256): The amount of the input token used

### exactOutput

Swaps as little as possible of one token for `amountOut` of another along the specified path (reversed).

**Parameters:**
- `params` (ExactOutputParams): Multi-hop swap parameters encoded as `ExactOutputParams` in calldata, including:
  - `path`: The swap path
  - `recipient`: The address that will receive the output tokens
  - `deadline`: The transaction deadline timestamp
  - `amountOut`: The desired output token amount
  - `amountInMaximum`: The maximum input token amount

**Returns:**
- `amountIn` (uint256): The amount of the input token used

## Structs

### ExactInputSingleParams

Parameter struct for the `exactInputSingle` function.

**Fields:**
- `tokenIn` (address): The address of the input token
- `tokenOut` (address): The address of the output token
- `fee` (uint24): The pool fee
- `recipient` (address): The address that will receive the output tokens
- `deadline` (uint256): The transaction deadline timestamp
- `amountIn` (uint256): The input token amount
- `amountOutMinimum` (uint256): The minimum output token amount
- `sqrtPriceLimitX96` (uint160): The price limit

### ExactInputParams

Parameter struct for the `exactInput` function.

**Fields:**
- `path` (bytes): The swap path
- `recipient` (address): The address that will receive the output tokens
- `deadline` (uint256): The transaction deadline timestamp
- `amountIn` (uint256): The input token amount
- `amountOutMinimum` (uint256): The minimum output token amount

### ExactOutputSingleParams

Parameter struct for the `exactOutputSingle` function.

**Fields:**
- `tokenIn` (address): The address of the input token
- `tokenOut` (address): The address of the output token
- `fee` (uint24): The pool fee
- `recipient` (address): The address that will receive the output tokens
- `deadline` (uint256): The transaction deadline timestamp
- `amountOut` (uint256): The desired output token amount
- `amountInMaximum` (uint256): The maximum input token amount
- `sqrtPriceLimitX96` (uint160): The price limit

### ExactOutputParams

Parameter struct for the `exactOutput` function.

**Fields:**
- `path` (bytes): The swap path
- `recipient` (address): The address that will receive the output tokens
- `deadline` (uint256): The transaction deadline timestamp
- `amountOut` (uint256): The desired output token amount
- `amountInMaximum` (uint256): The maximum input token amount
