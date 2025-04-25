// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/governance/IGovernor.sol";

interface IAgentFactory {
    function proposeAgent(
        string memory name,
        string memory symbol,
        string memory tokenURI,
        uint8[] memory cores
    ) external returns (uint256);

    function withdraw(uint256 id) external;

    function totalAgents() external view returns (uint256);

    function initFromBondingCurve(
        string memory name,
        string memory symbol,
        uint8[] memory cores,
        uint256 applicationThreshold_,
        address creator
    ) external returns (uint256);

    function executeBondingCurveApplication(
        uint256 id,
        uint256 totalSupply,
        uint256 lpSupply,
        address vault
    ) external returns (address);
}
