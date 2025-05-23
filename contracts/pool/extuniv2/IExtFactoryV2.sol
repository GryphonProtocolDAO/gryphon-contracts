// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IExtFactoryV2 {
    function getPair(address tokenA, address tokenB, bool stable) external view returns (address pair);

    function createPair(address tokenA, address tokenB, bool stable) external returns (address pair);
}
