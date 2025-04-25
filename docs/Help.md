# Gryphon Finance API Usage Documentation

## Internal Market Operations

1. For internal market buying and selling, call the `Bonding` contract's `sell` and `buy` methods.
2. To launch a new internal token, call the `launch` method.
3. To estimate exchange rates, call the `FRouter` contract's `getAmountsOut` method.

## External Market Operations

1. For external market buying and selling, use PancakeSwap V2 contract `IRouter` call
   the `swapExactTokensForTokensSupportingFeeOnTransferTokens` method.

# contracts address

| Contract Name | Address                                    | Network  |
|---------------|--------------------------------------------|----------|
| Bonding       | 0xA4977734679B89f4669C3C1DBA91cc327615dE22 | BSC Test |
| FRouter       | 0x8022b0361C2060125857Cc945D5Bc6bca79b0f6f | BSC Test |
| FFactory      | 0x1a4AE3C87bEeFa8413Df8C62246A388E148c1815 | BSC Test |
| AgentFactory  | 0xb616AC29F66abD8CFf5a3c2d9b0A548128cd1F45 | BSC Test |
| IRouter       | 0xD99D1c33F9fC3444f8101754aBC46c52416550D1 | BSC Test |
