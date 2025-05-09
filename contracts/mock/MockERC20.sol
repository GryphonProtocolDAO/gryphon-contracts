// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract MockERC20 is ERC20, ERC20Permit {
    constructor() ERC20("DEV gryphon", "DGRYPHON") ERC20Permit("DEV gryphon") {
        _mint(msg.sender, 100_000_000_000_000 ether);
    }
}

