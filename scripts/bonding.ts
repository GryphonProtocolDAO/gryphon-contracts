import hre from "hardhat";
import {ethers} from "hardhat";
import {getDeployConfig} from "./config/deployConfig";
import {getContractDeployInfo} from "./helper/deployInfo";
import {ContractTransactionResponse, formatEther, parseEther, ZeroAddress} from "ethers";
import {Bonding, FFactory, IERC20} from "../typechain-types";
import {BigNumberish, AddressLike} from "ethers";

// Define parameter interfaces based on Bonding contract's method signatures
interface LaunchParams {
    name: string;
    ticker: string;
    cores: BigNumberish[];
    description: string;
    imageUrl: string;
    urls: [string, string, string, string]; // [twitter, telegram, youtube, website]
    purchaseAmount: BigNumberish;
}

interface TokenOperationParams {
    amountIn: BigNumberish;
    tokenAddress: AddressLike;
}

async function main() {
    const networkName = hre.network.name;
    console.log(`Interacting with contracts on network: ${networkName}`);

    // Get deployment configuration
    const {chainId, config} = await getDeployConfig();
    console.log(`Using chain ID: ${chainId}`);

    // Get the signer
    const [deployer] = await ethers.getSigners();
    console.log(`Using account: ${deployer.address}`);
    const userAddress = deployer.address;
    // Load contract instances
    const bondingContract = await getContractDeployInfo(networkName, "Bonding");
    const bondingAddress = bondingContract.address;
    const bonding = await ethers.getContractAt("Bonding", bondingAddress);
    const factoryContract = await getContractDeployInfo(networkName, "FFactory");
    const factoryAddress = factoryContract.address;
    const factory = await ethers.getContractAt("FFactory", factoryAddress);


    const assetTokenAddress = config.sharedInitParams.assetToken;
    const assetToken = await ethers.getContractAt("IERC20", assetTokenAddress);

    console.log(`Bonding: ${bondingAddress}`);
    console.log(`Asset Token: ${assetTokenAddress}`);

    // Display contract parameters

    const fee = await bonding.fee();
    const initialSupply = await bonding.initialSupply();
    const assetRate = await bonding.assetRate();
    const gradThreshold = await bonding.gradThreshold();
    const maxTx = await bonding.maxTx();

    console.log("\nContract Parameters:");
    console.log(`Initial Supply: ${initialSupply}`);
    console.log(`Fee: ${formatEther(fee)} ETH`);
    console.log(`Asset Rate: ${assetRate}`);
    console.log(`Graduation Threshold: ${formatEther(gradThreshold)} ETH`);
    console.log(`Max Transaction: ${maxTx}`);

    // Use hardcoded values instead of command line arguments


    let tokenAddress = await getAllTokens(bonding);
    if (tokenAddress === ZeroAddress) {
        // Example: Launch a new token
        const launchParams: LaunchParams = {
            name: "Test Token",
            ticker: "TST",
            cores: [0, 1, 2],
            description: "A test token for demonstration",
            imageUrl: "https://example.com/image.png",
            urls: [
                "https://twitter.com/testtoken",
                "https://t.me/testtoken",
                "https://youtube.com/testtoken",
                "https://testtoken.com"
            ],
            purchaseAmount: parseEther("1000.0")
        };
        await launchToken(bonding, assetToken, launchParams);
        tokenAddress = await getAllTokens(bonding);
        return ;
    } else {
        console.log("Token already launched last token address: ", tokenAddress);
    }

    if (tokenAddress === ZeroAddress) {
        throw new Error("Token not launched");
    }


    const tokenInfo = await getTokenInfo(bonding, tokenAddress);
    if (tokenInfo && tokenInfo.agentToken && tokenInfo.agentToken !== ZeroAddress) {
        console.log("Agent token already set");
        await unwrapToken(bonding, tokenAddress, tokenInfo.agentToken, userAddress);
        return;
    }
    await getPairInfo(factory, tokenAddress, assetTokenAddress);
    // return;
    console.log("Buy before");
    // Example: Buy tokens
    const buyParams: TokenOperationParams = {
        tokenAddress: tokenAddress, // Replace with actual token address
        amountIn: parseEther("22000")
    };
    await buyToken(bonding, assetToken, buyParams);
    return;
    await getTokenInfo(bonding, tokenAddress);
    await getPairInfo(factory, tokenAddress, assetTokenAddress);
    console.log("Buy after and sell before");

    // Example: Sell tokens
    const sellParams: TokenOperationParams = {
        tokenAddress: tokenAddress, // Replace with actual token address
        amountIn: parseEther("1.25")
    };
    await sellToken(bonding, sellParams);

    // Example: Get token info
    await getTokenInfo(bonding, tokenAddress);
    await getPairInfo(factory, tokenAddress, assetTokenAddress);

    // Example: Get user info

    await getUserInfo(bonding, userAddress);

    // Example: Get all tokens
    await getAllTokens(bonding);
}

async function unwrapToken(bonding: Bonding, tokenAddress: string, agentTokenAddress: string, userAddress: string) {
    const token = await ethers.getContractAt("FERC20", tokenAddress);
    const agentToken = await ethers.getContractAt("AgentToken", agentTokenAddress);
    const tokenOwner = await token.owner();
    console.log(`Token owner: ${tokenOwner}`);
    const agentTokenOwner = await agentToken.owner();
    console.log(`Agent Token owner: ${agentTokenOwner}`);
    let tokenBalance = await token.balanceOf(userAddress);
    let agentTokenBalance = await agentToken.balanceOf(userAddress);
    console.log(`Token balance: ${ethers.formatEther(tokenBalance.toString())}`);
    console.log(`Agent Token balance: ${ethers.formatEther(agentTokenBalance.toString())}`);
    if (tokenBalance > 0n) {

        // await token.approve(await bonding.getAddress(), tokenBalance);
        await bonding.unwrapToken(tokenAddress, [userAddress]);
        tokenBalance = await token.balanceOf(userAddress);
        agentTokenBalance = await agentToken.balanceOf(userAddress);
        console.log(`After Token balance: ${ethers.formatEther(tokenBalance.toString())}`);
        console.log(`After Agent Token balance: ${ethers.formatEther(agentTokenBalance.toString())}`);
    } else {
        console.log("No token to unwrap");
    }

}

async function launchToken(bonding: Bonding, assetToken: IERC20, params: LaunchParams) {
    console.log(`\nLaunching token "${params.name}" (${params.ticker})`);
    console.log(`Purchase amount: ${formatEther(params.purchaseAmount)} asset token`);

    try {
        // Approve tokens for bonding contract
        const approvalTx = await assetToken.approve(await bonding.getAddress(), params.purchaseAmount);
        console.log("Asset tokens approved for bonding contract");
        await approvalTx.wait();

        // Launch the token using structured parameters
        const tx = await bonding.launch(
            params.name,
            params.ticker,
            params.cores,
            params.description,
            params.imageUrl,
            params.urls,
            params.purchaseAmount
        );

        const receipt = await tx.wait();

        // Find the Launched event
        const launchedEvent = receipt?.logs
            .filter(log => log.topics[0] === ethers.id("Launched(address,address,uint256)"))
            .map(log => bonding.interface.parseLog(log))[0];

        if (launchedEvent) {
            const tokenAddress = launchedEvent.args[0];
            const pairAddress = launchedEvent.args[1];
            console.log(`Token successfully launched!`);
            console.log(`Token Address: ${tokenAddress}`);
            console.log(`Pair Address: ${pairAddress}`);
        }
    } catch (error) {
        console.error("Error launching token:", error);
    }
}

async function buyToken(bonding: Bonding, assetToken: IERC20, params: TokenOperationParams) {
    console.log(`\nBuying token at ${params.tokenAddress}`);
    console.log(`Amount: ${formatEther(params.amountIn)} asset token`);

    try {
        // Approve tokens for router contract
        const approvalTx = await assetToken.approve(await bonding.router(), params.amountIn);
        console.log("Asset tokens approved for bonding contract");
        await approvalTx.wait();

        // Buy tokens using structured parameters
        const tx = await bonding.buy(params.amountIn, params.tokenAddress);
        await tx.wait();
        console.log("Token purchase successful!");
    } catch (error) {
        console.error("Error buying token:", error);
    }
}

async function sellToken(bonding: Bonding, params: TokenOperationParams) {
    console.log(`\nSelling token at ${params.tokenAddress}`);
    console.log(`Amount: ${formatEther(params.amountIn)} asset token`);

    try {
        // Get the token contract
        const token = await ethers.getContractAt("IERC20", params.tokenAddress.toString());

        // Approve tokens for router contract
        const approvalTx = await token.approve(await bonding.router(), params.amountIn);
        await approvalTx.wait();
        console.log("Tokens approved for bonding contract");

        // Sell tokens using structured parameters
        const tx = await bonding.sell(params.amountIn, params.tokenAddress);
        await tx.wait();
        console.log("Token sale successful!");
    } catch (error) {
        console.error("Error selling token:", error);
    }
}

async function getUserInfo(bonding: Bonding, userAddress: string) {
    console.log(`\nFetching user info for ${userAddress}`);

    try {
        // Get user profile
        const profile = await bonding.profile(userAddress);
        console.log(`User: ${profile}`);

        // Get user tokens
        const tokens = await bonding.getUserTokens(userAddress);
        console.log(`Number of tokens: ${tokens.length}`);

        if (tokens.length > 0) {
            console.log("\nToken Addresses:");
            for (let i = 0; i < tokens.length; i++) {
                console.log(`${i + 1}: ${tokens[i]}`);
            }
        }
    } catch (error) {
        console.error("Error fetching user info:", error);
    }
}

async function getPairInfo(factory: FFactory, tokenAddress: string, assetTokenAddress: string) {
    console.log(`\nFetching pair info for ${tokenAddress}`);

    try {
        // Get pair address
        const pairAddress = await factory.getPair(tokenAddress, assetTokenAddress);
        console.log(`Pair Address: ${pairAddress}`);

        // Get pair data
        const pair = await ethers.getContractAt("FPair", pairAddress);
        const reserves = await pair.getReserves();
        console.log("\nPair Data:");
        console.log(`TokenA: ${await pair.tokenA()}`);
        console.log(`TokenB: ${await pair.tokenB()}`);
        console.log(`ReserveA: ${formatEther(reserves[0])}`);
        console.log(`ReserveB: ${formatEther(reserves[1])}`);
        console.log('kLast:', await pair.kLast());
        console.log('priceALast: ', await pair.priceALast());
        console.log('priceBLast: ', await pair.priceBLast());
    } catch (error) {
        console.error("Error fetching pair info:", error);
    }

}

async function getTokenInfo(bonding: Bonding, tokenAddress: string) {
    console.log(`\nFetching token info for ${tokenAddress}`);
    let tokenInfo;
    try {
        // Get token info
        tokenInfo = await bonding.tokenInfo(tokenAddress);

        console.log("\nToken Details:");
        console.log(`Creator: ${tokenInfo.creator}`);
        console.log(`Token Address: ${tokenInfo.token}`);
        console.log(`Pair Address: ${tokenInfo.pair}`);
        console.log(`Agent Token: ${tokenInfo.agentToken}`);
        console.log(`Description: ${tokenInfo.description}`);
        console.log(`Trading Enabled: ${tokenInfo.trading}`);
        console.log(`Trading On Uniswap: ${tokenInfo.tradingOnUniswap}`);

        // Get token data
        const data = tokenInfo.data;
        console.log("\nToken Data:");
        console.log(`Name: ${data.name}`);
        console.log(`Ticker: ${data.ticker}`);
        console.log(`Supply: ${data.supply.toString()}`);
        console.log(`Price: ${data.price} multiple(token/asset)`);
        console.log(`Market Cap: ${formatEther(data.marketCap)} `);
        console.log(`Liquidity: ${formatEther(data.liquidity)} `);
        console.log(`Volume: ${formatEther(data.volume)} `);
        console.log(`24h Volume: ${formatEther(data.volume24H)} `);
        console.log(`Last Updated: ${new Date(Number(data.lastUpdated) * 1000).toLocaleString()}`);
    } catch (error) {
        console.error("Error fetching token info:", error);
    }
    return tokenInfo;
}

async function getAllTokens(bonding: Bonding) {
    console.log("\nFetching all tokens");
    let lastToken = ZeroAddress;
    try {
        // Get the number of tokens
        let index = 0;
        const tokens = [];

        while (true) {
            try {
                const tokenAddress = await bonding.tokenInfos(index);
                tokens.push(tokenAddress);
                index++;
            } catch (error) {
                break;
            }
        }

        console.log(`Found ${tokens.length} tokens`);

        if (tokens.length > 0) {
            console.log("\nToken Addresses:");
            for (let i = 0; i < tokens.length; i++) {
                const tokenInfo = await bonding.tokenInfo(tokens[i]);
                console.log(`${i + 1}: ${tokens[i]} (${tokenInfo.data.name} - ${tokenInfo.data.ticker})`);
                lastToken = tokens[i];
            }
        }
    } catch (error) {
        console.error("Error fetching all tokens:", error);
    }

    return lastToken;
}

// Execute the script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
