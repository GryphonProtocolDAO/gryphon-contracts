# Bonding Contract User Interface

The Bonding contract implements a bonding curve mechanism for token creation, trading and graduation to full agent
tokens. This document covers functions available to regular users.

## State Variables

| Variable        | Type                        | Description                                                                                                     |
|-----------------|-----------------------------|-----------------------------------------------------------------------------------------------------------------|
| `factory`       | FFactory                    | The factory contract for creating token pairs                                                                   |
| `router`        | FRouter                     | The router contract for handling token swaps                                                                    |
| `initialSupply` | uint256                     | The initial supply of tokens when launching                                                                     |
| `fee`           | uint256                     | The fee charged for launching tokens                                                                            |
| `assetRate`     | uint256                     | The rate used for asset valuation                                                                               |
| `gradThreshold` | uint256                     | Threshold for token graduation                                                                                  |
| `maxTx`         | uint256                     | Maximum transaction amount                                                                                      |
| `agentFactory`  | address                     | The address of the agent factory contract                                                                       |
| `profile`       | mapping(address => Profile) | Maps user addresses to their profile information, tracking users and their created tokens                       |
| `tokenInfo`     | mapping(address => Token)   | Maps token addresses to comprehensive token data, including creator, pair address, metadata, and trading status |

## Structures

### Profile

```solidity
struct Profile {
    address user;
    address[] tokens;
}
```

### Token

```solidity
struct Token {
    address creator;
    address token;
    address pair;
    address agentToken;
    Data data;
    string description;
    uint8[] cores;
    string image;
    string twitter;
    string telegram;
    string youtube;
    string website;
    bool trading;
    bool tradingOnUniswap;
}
```

### Data

```solidity
struct Data {
    address token;
    string name;
    string _name;
    string ticker;
    uint256 supply;
    uint256 price;
    uint256 marketCap;
    uint256 liquidity;
    uint256 volume;
    uint256 volume24H;
    uint256 prevPrice;
    uint256 lastUpdated;
}
```

## Events

| Event       | Parameters                                              | Description                                          |
|-------------|---------------------------------------------------------|------------------------------------------------------|
| `Launched`  | address indexed token, address indexed pair, uint       | Emitted when a new token is launched                 |
| `Deployed`  | address indexed token, uint256 amount0, uint256 amount1 | Emitted when a token is deployed                     |
| `Graduated` | address indexed token, address agentToken               | Emitted when a token graduates to a full agent token |

## User Functions

### getUserTokens

Returns the tokens created by a user.

```solidity
function getUserTokens(address account) public view returns (address[] memory)
```

**Parameters:**

- `account`: The user address to query

**Returns:**

- Array of token addresses created by the user

### launch

Launches a new token with bonding curve mechanism.

```solidity
function launch(
    string memory _name,
    string memory _ticker,
    uint8[] memory cores,
    string memory desc,
    string memory img,
    string[4] memory urls,
    uint256 purchaseAmount
) public nonReentrant returns (address, address, uint)
```

**Parameters:**

- `_name`: The name of the token
- `_ticker`: The ticker symbol of the token
- `cores`: Array of core IDs(0,1,2)
- `desc`: Description of the token
- `img`: Image URL for the token
- `urls`: Array of URLs [twitter, telegram, youtube, website]
- `purchaseAmount`: Amount of asset token to purchase (must be greater than fee)

**Returns:**

- Token address, pair address, and token index

**Events Emitted:**

- `Launched(address token, address pair, uint n)`

### sell

Sells tokens on the bonding curve.

```solidity
function sell(uint256 amountIn, address tokenAddress) public returns (bool)
```

**Parameters:**

- `amountIn`: Amount of tokens to sell
- `tokenAddress`: Address of the token to sell

**Returns:**

- Boolean indicating success

### buy

Buys tokens from the bonding curve.

```solidity
function buy(uint256 amountIn, address tokenAddress) public payable returns (bool)
```

**Parameters:**

- `amountIn`: Amount of asset token to spend
- `tokenAddress`: Address of the token to buy

**Returns:**

- Boolean indicating success

**Note:** If the reserve level reaches the graduation threshold, the token will be automatically graduated to a full
agent token.

### unwrapToken

Unwraps fun tokens to agent tokens after graduation.

```solidity
function unwrapToken(address srcTokenAddress, address[] memory accounts) public
```

**Parameters:**

- `srcTokenAddress`: The address of the source token
- `accounts`: Array of account addresses to unwrap tokens for

**Requirements:**

- Token must be graduated
- Accounts must have fun tokens to unwrap
- Sufficient agent token balance in the pair
