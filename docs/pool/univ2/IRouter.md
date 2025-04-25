# IRouter Interface

The `IRouter` interface defines the standard functions used for token swapping operations within the Gryphon Finance protocol. This interface is designed to be compatible with Uniswap V2-style decentralized exchanges.

## Functions

### swapExactTokensForTokens

```solidity
function swapExactTokensForTokens(
    uint amountIn,
    uint amountOutMin,
    address[] calldata path,
    address to,
    uint deadline
) external returns (uint[] memory amounts);
```

Executes a swap with an exact input amount of tokens.

#### Parameters:
- `amountIn`: The exact amount of input tokens to send
- `amountOutMin`: The minimum amount of output tokens that must be received, or the transaction will revert
- `path`: An array of token addresses representing the swap path. The first element is the input token and the last element is the output token
- `to`: The address that will receive the output tokens
- `deadline`: The Unix timestamp after which the transaction will revert

#### Returns:
- `amounts`: An array of amounts for each step in the path. The first element is the input amount and the last element is the output amount

### swapExactTokensForTokensSupportingFeeOnTransferTokens

```solidity
function swapExactTokensForTokensSupportingFeeOnTransferTokens(
    uint amountIn,
    uint amountOutMin,
    address[] calldata path,
    address to,
    uint deadline
) external;
```

Identical to `swapExactTokensForTokens`, but designed to handle tokens that take a fee on transfer (deflationary tokens).

#### Parameters:
- `amountIn`: The exact amount of input tokens to send
- `amountOutMin`: The minimum amount of output tokens that must be received, or the transaction will revert
- `path`: An array of token addresses representing the swap path
- `to`: The address that will receive the output tokens
- `deadline`: The Unix timestamp after which the transaction will revert

#### Returns:
- None

### getAmountsOut

```solidity
function getAmountsOut(
    uint amountIn,
    address[] calldata path
) external view returns (uint[] memory amounts);
```

Calculates the expected output amounts for a given input amount and path.

#### Parameters:
- `amountIn`: The amount of input tokens
- `path`: An array of token addresses representing the swap path

#### Returns:
- `amounts`: An array of amounts corresponding to each step in the path. The first element is the input amount and the last element is the expected output amount
