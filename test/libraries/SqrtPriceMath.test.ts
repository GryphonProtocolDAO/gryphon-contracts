import { expect } from "chai";
import { ethers } from "hardhat";
import {Contract, ContractTransactionResponse} from "ethers";
import {SqrtPriceMathTest} from "../../typechain-types";

describe("SqrtPriceMath", function () {
    let sqrtPriceMathTest: SqrtPriceMathTest & {deploymentTransaction(): ContractTransactionResponse};

    before(async function () {
        // Deploy the test helper contract that exposes SqrtPriceMath library functions
        const SqrtPriceMathTestFactory = await ethers.getContractFactory("SqrtPriceMathTest");
        sqrtPriceMathTest = await SqrtPriceMathTestFactory.deploy();
    });

    describe("calculateSqrtPriceX96", function () {
        it("should calculate sqrtPriceX96 for equal decimals", async function () {
            const amount0 = ethers.parseUnits("1", 18);  // 1 token0
            const amount1 = ethers.parseUnits("2", 18);  // 2 token1
            const decimals0 = 18;
            const decimals1 = 18;

            const sqrtPriceX96 = await sqrtPriceMathTest.calculateSqrtPriceX96(
                amount0,
                amount1,
                decimals0,
                decimals1
            );

            // Expected: sqrt(2/1) * 2^96 = sqrt(2) * 2^96
            const expectedSqrtPrice = (BigInt('1414213562373095048801689') * (BigInt(2) ** BigInt(96))) / (BigInt(10) ** BigInt(18));
            expect(sqrtPriceX96).to.be.closeTo(expectedSqrtPrice, expectedSqrtPrice / BigInt(1000)); // Allow 0.1% tolerance
        });

        it("should calculate sqrtPriceX96 with different decimals (token0 has more decimals)", async function () {
            const amount0 = ethers.parseUnits("1", 18);  // 1 token0 with 18 decimals
            const amount1 = ethers.parseUnits("5", 6);   // 5 token1 with 6 decimals
            const decimals0 = 18;
            const decimals1 = 6;

            const sqrtPriceX96 = await sqrtPriceMathTest.calculateSqrtPriceX96(
                amount0,
                amount1,
                decimals0,
                decimals1
            );

            // Expected: sqrt(5*10^18/(1*10^18)) * 2^96 = sqrt(5) * 2^96
            const expectedSqrtPrice = (BigInt('2236067977499789696409') * (BigInt(2) ** BigInt(96))) / (BigInt(10) ** BigInt(18));
            expect(sqrtPriceX96).to.be.closeTo(expectedSqrtPrice, expectedSqrtPrice / BigInt(1000)); // Allow 0.1% tolerance
        });

        it("should calculate sqrtPriceX96 with different decimals (token1 has more decimals)", async function () {
            const amount0 = ethers.parseUnits("3", 6);   // 3 token0 with 6 decimals
            const amount1 = ethers.parseUnits("12", 18); // 12 token1 with 18 decimals
            const decimals0 = 6;
            const decimals1 = 18;

            const sqrtPriceX96 = await sqrtPriceMathTest.calculateSqrtPriceX96(
                amount0,
                amount1,
                decimals0,
                decimals1
            );

            // Expected: sqrt(12/(3*10^12)) * 2^96 = sqrt(4*10^-12) * 2^96
            const expectedSqrtPrice = (BigInt('2000000000000') * (BigInt(2) ** BigInt(96))) / (BigInt(10) ** BigInt(18));
            expect(sqrtPriceX96).to.be.closeTo(expectedSqrtPrice, expectedSqrtPrice / BigInt(1000)); // Allow 0.1% tolerance
        });

        it("should revert when amount0 is zero", async function () {
            const amount0 = 0;
            const amount1 = ethers.parseUnits("1", 18);
            const decimals0 = 18;
            const decimals1 = 18;

            await expect(
                sqrtPriceMathTest.calculateSqrtPriceX96(
                    amount0,
                    amount1,
                    decimals0,
                    decimals1
                )
            ).to.be.revertedWith("SqrtPriceMath: INSUFFICIENT_AMOUNT");
        });

        it("should revert when amount1 is zero", async function () {
            const amount0 = ethers.parseUnits("1", 18);
            const amount1 = 0;
            const decimals0 = 18;
            const decimals1 = 18;

            await expect(
                sqrtPriceMathTest.calculateSqrtPriceX96(
                    amount0,
                    amount1,
                    decimals0,
                    decimals1
                )
            ).to.be.revertedWith("SqrtPriceMath: INSUFFICIENT_AMOUNT");
        });
    });

    describe("sqrt", function () {
        it("should calculate the square root of a number", async function () {
            const testCases = [
                { input: 0, expected: 0 },
                { input: 1, expected: 1 },
                { input: 4, expected: 2 },
                { input: 9, expected: 3 },
                { input: 16, expected: 4 },
                { input: 100, expected: 10 },
                { input: 10000, expected: 100 },
                { input: BigInt(10) ** BigInt(18), expected: BigInt(10) ** BigInt(9) }
            ];

            for (const testCase of testCases) {
                const result = await sqrtPriceMathTest.sqrt(testCase.input);
                expect(result).to.equal(testCase.expected);
            }
        });
    });
});
