import hre, {ethers} from "hardhat";
import {toNumber} from "ethers";


async function main() {
    const networkName = hre.network.name;
    console.log(`Upgrading contracts on network: ${networkName}`);
    const decimals0 = 18;
    const decimals1 = 18;
    const amount0 = ethers.parseUnits("42084.996664121670977877", decimals0);  // 1 token0
    const amount1 = ethers.parseUnits("1000000", decimals1);  // 2 token1
    console.log(amount0.toString());
    console.log(amount1.toString());
    const res = sqrtPriceX96(42084996664121670977877, 1000000000000000000000000);
    console.log(res);
    const SqrtPriceMathTestFactory = await ethers.getContractFactory("SqrtPriceMathTest");
    const sqrtPriceMathTest = await SqrtPriceMathTestFactory.deploy();

    const sqrtPriceX96Nu = await sqrtPriceMathTest.calculateSqrtPriceX96(
        amount0,
        amount1,
        decimals0,
        decimals1
    );

    console.log(sqrtPriceX96Nu);
}
// Execute the deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });



function sqrtPriceX96(reserve0: number, reserve1: number): bigint {
    const SqrtPriceX96 = BigInt(Math.sqrt(reserve1 / reserve0) * 2 ** 96);
    return SqrtPriceX96;
}

function calculateSqrtPriceX96Native(
    price: number,
    decimalsA: number,
    decimalsB: number
): bigint {
    // 1. 调整精度并放大为整数
    const decimalAdjustment = 10 ** (decimalsB - decimalsA);
    const adjustedPrice = price * decimalAdjustment;
    const SCALING_FACTOR = 10 ** 18;
    const adjustedPriceScaled = BigInt(Math.floor(adjustedPrice * SCALING_FACTOR));

    // 2. 计算平方根（手动实现）
    const sqrt = (n: bigint): bigint => {
        if (n < 0n) throw new Error("negative input");
        if (n < 2n) return n;
        let x = n;
        let y = (x + 1n) / 2n;
        while (y < x) {
            x = y;
            y = (x + n / x) / 2n;
        }
        return x;
    };

    // 3. 计算并调整精度
    const sqrtValue = sqrt(adjustedPriceScaled * (2n ** 192n)); // 放大后计算平方根
    return sqrtValue / BigInt(Math.sqrt(SCALING_FACTOR));
}

