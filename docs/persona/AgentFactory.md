# AgentFactory Contract Documentation

The AgentFactory contract enables the creation and management of Agent tokens in the Gryphon Finance ecosystem.

## Public Functions

### getApplication

```solidity
function getApplication(uint256 proposalId) public view returns (Application memory)
```

Retrieves detailed information about an agent application.

**Parameters:**

- `proposalId`: The ID of the application to retrieve

**Returns:**

- `Application`: A struct containing all application details including name, symbol, status, and proposer

### proposeAgent

```solidity
function proposeAgent(
    string memory name,
    string memory symbol,
    string memory tokenURI,
    uint8[] memory cores
) public whenNotPaused returns (uint256)
```

Creates a new agent proposal by locking the required application threshold amount.

**Parameters:**

- `name`: The name for the new agent token
- `symbol`: The symbol for the new agent token
- `tokenURI`: The URI for token metadata
- `cores`: Array of core identifiers for the agent

**Returns:**

- `uint256`: The ID of the created application

**Requirements:**

- Contract must not be paused
- Caller must have sufficient asset tokens (equal to applicationThreshold)
- Caller must have approved the contract to spend asset tokens
- At least one core must be provided

### withdraw

```solidity
function withdraw(uint256 id) public noReentrant
```

Withdraws the locked assets from an application that hasn't been executed.

**Parameters:**

- `id`: The application ID to withdraw from

**Requirements:**

- Caller must be the original proposer or have WITHDRAW_ROLE
- Application status must be Active
- Application's end block must have been reached

### executeApplication

```solidity
function executeApplication(uint256 id) public noReentrant
```

Executes an application to create a new agent token and LP pool.

**Parameters:**

- `id`: The application ID to execute

**Requirements:**

- Caller must be the original proposer or have WITHDRAW_ROLE
- Application status must be Active

### totalAgents

```solidity
function totalAgents() public view returns (uint256)
```

Returns the total number of agent tokens created.

**Returns:**

- `uint256`: The total number of agents

### getTokenTaxParams

```solidity
function getTokenTaxParams() public view returns (bytes memory)
```

Returns the encoded token tax parameters used for new agent tokens.

**Returns:**

- `bytes`: Encoded token tax parameters

### getTokenSupplyParams

```solidity
function getTokenSupplyParams() public view returns (bytes memory)
```

Returns the encoded token supply parameters used for new agent tokens.

**Returns:**

- `bytes`: Encoded token supply parameters
