import {ethers} from "hardhat";
import {ContractDeployConfig, DeploymentConfig, getDeployConfig} from "./config/deployConfig";
import {deployContract} from "./helper/deployments";
import {getAllContractDeployInfo, getContractDeployInfo} from "./helper/deployInfo";
import {ZeroAddress} from "ethers";


async function main() {
    // Get deployment configuration based on the current network
    const {chainId, networkName, config} = await getDeployConfig();

    const assetToken = config.sharedInitParams.assetToken;
    // Convert string ether values to BigNumber
    const minSwapThreshold = ethers.parseEther(config.sharedInitParams.minSwapThreshold);
    const maxSwapThreshold = ethers.parseEther(config.sharedInitParams.maxSwapThreshold);
    const maxTx = config.sharedInitParams.maxTx;
    const gradThreshold = ethers.parseEther(config.sharedInitParams.gradThreshold);
    const applicationThreshold = ethers.parseEther(config.sharedInitParams.applicationThreshold);

    // Get the signer (deployer)
    const [deployer] = await ethers.getSigners();

    console.log(`Deploying to network: ${networkName} (Chain ID: ${chainId}) as ${deployer.address}...`);


    // Deploy individual contracts
    const agentTokenImplConfig = await getContractConfig(config, "AgentToken");
    const agentTokenImpl = await deployAgentTokenImpl(networkName, agentTokenImplConfig);
    if (!agentTokenImpl) {
        throw new Error("Error deploying AgentTokenImpl");
    }
    const agentTokenImplAddress = await agentTokenImpl.getAddress();

    const agentFactoryConfig = await getContractConfig(config, "AgentFactory");
    agentFactoryConfig.args = [
        agentTokenImplAddress,
        assetToken,
        applicationThreshold,
        0,
        deployer.address,// tokenAdmin
        config.sharedInitParams.swapRouter,
    ];
    const agentFactory = await deployAgentFactory(networkName, agentFactoryConfig);
    if (!agentFactory) {
        throw new Error("Error deploying AgentFactory");
    }
    const agentFactoryAddress = await agentFactory.getAddress();


    const fFactoryConfig = await getContractConfig(config, "FFactory");
    fFactoryConfig.args = [ZeroAddress, config.sharedInitParams.buyTax, config.sharedInitParams.sellTax];
    const fFactory = await deployFFactory(networkName, fFactoryConfig);
    if (!fFactory) {
        throw new Error("Error deploying FFactory");
    }
    const fFactoryAddress = await fFactory.getAddress();

    const fRouterConfig = await getContractConfig(config, "FRouter");
    fRouterConfig.args = [fFactoryAddress, config.sharedInitParams.assetToken];
    const fRouter = await deployFRouter(networkName, fRouterConfig);
    if (!fRouter) {
        throw new Error("Error deploying FRouter");
    }
    const fRouterAddress = await fRouter.getAddress();


    const bondingTaxConfig = await getContractConfig(config, "BondingTax");
    bondingTaxConfig.args = [
        deployer.address, // defaultAdmin
        config.sharedInitParams.taxAssetToken, // tax token for buy assetToken
        assetToken,
        config.sharedInitParams.swapRouter,
        fRouterAddress,
        deployer.address, // treasury
        minSwapThreshold,
        maxSwapThreshold
    ];
    const bondingTax = await deployBondingTax(networkName, bondingTaxConfig);
    if (!bondingTax) {
        throw new Error("Error deploying BondingTax");
    }
    const bondingTaxAddress = await bondingTax.getAddress();


    const bondingConfig = await getContractConfig(config, "Bonding");
    bondingConfig.args = [
        fFactoryAddress,
        fRouterAddress,
        deployer.address,// feeTo
        config.sharedInitParams.fee,
        config.sharedInitParams.initialSupply,
        config.sharedInitParams.assetRate,
        maxTx,
        agentFactoryAddress,
        gradThreshold
    ];
    const bonding = await deployBonding(networkName, bondingConfig);
    if (!bonding) {
        throw new Error("Error deploying Bonding");
    }
    const bondingAddress = await bonding.getAddress();

    const factorAdminRole = await fFactory.ADMIN_ROLE();
    const hasAdminRole = await fFactory.hasRole(factorAdminRole, deployer.address);
    if(!hasAdminRole) {
        await fFactory.grantRole(factorAdminRole, deployer.address);
    }
    console.log("Setting router in FFactory...");
    const factoryRouter = await fFactory.router();
    if (factoryRouter === ZeroAddress) {
        await fFactory.setRouter(fRouterAddress);
    } else {
        console.log("Factory router already set... address: ", factoryRouter);
    }
    console.log("Setting tax params in FFactory...");
    const factoryTaxVault = await fFactory.taxVault();
    if (factoryTaxVault === ZeroAddress) {
        await fFactory.setTaxParams(
            bondingTaxAddress,
            config.sharedInitParams.buyTax,
            config.sharedInitParams.sellTax);
    } else {
        console.log("Factory tax params already set... address: ", factoryTaxVault);
    }

    console.log("Setting tax manager in FRouter...");
    const routerTaxManager = await fRouter.taxManager();
    if (routerTaxManager === ZeroAddress) {
        await fRouter.setTaxManager(bondingTaxAddress);
    } else {
        console.log("Router tax manager already set... address: ", routerTaxManager);
    }


    console.log("Granting CREATOR_ROLE to Bonding in FFactory...");
    const CREATOR_ROLE = await fFactory.CREATOR_ROLE();
    const fFactoryCreator = await fFactory.hasRole(CREATOR_ROLE, bondingAddress);
    if (!fFactoryCreator) {
        await fFactory.grantRole(CREATOR_ROLE, bondingAddress);
    } else {
        console.log("Bonding already has CREATOR_ROLE in FFactory...");
    }

    console.log("Granting EXECUTOR_ROLE to Bonding in FRouter...");
    const EXECUTOR_ROLE = await fRouter.EXECUTOR_ROLE();
    const fRouterExecutor = await fRouter.hasRole(EXECUTOR_ROLE, bondingAddress);
    if (!fRouterExecutor) {
        await fRouter.grantRole(EXECUTOR_ROLE, bondingAddress);
    } else {
        console.log("Bonding already has EXECUTOR_ROLE in FRouter...");
    }

    await agentFactory.setTokenSupplyParams(
        config.sharedInitParams.agentMaxSupply,            // maxSupply
        config.sharedInitParams.agentLpSupply,             // lpSupply
        config.sharedInitParams.agentMaxTokensPerWallet,   // maxTokensPerWallet
        config.sharedInitParams.agentMaxTokensPerTxn,      // maxTokensPerTxn
        config.sharedInitParams.agentBotProtectionDurationInSeconds, // botProtectionDurationInSeconds
        deployer.address                                   // vault
    );

    await agentFactory.setTokenTaxParams(
        config.sharedInitParams.agentProjectBuyTaxBasisPoints,    // projectBuyTaxBasisPoints
        config.sharedInitParams.agentProjectSellTaxBasisPoints,   // projectSellTaxBasisPoints
        config.sharedInitParams.agentTaxSwapThresholdBasisPoints, // taxSwapThresholdBasisPoints
        deployer.address                                          // projectTaxRecipient
    );


    console.log("\nAll deployments and initializations completed!");

    // Print summary of all deployed contracts
    console.log("\nDeployment Summary:");
    const deployInfo = await getAllContractDeployInfo(networkName);
    for (const [name, info] of Object.entries(deployInfo)) {
        console.log(`${name}: ${info.address}`);
    }
}

async function getContractConfig(config: DeploymentConfig, contractName: string) {
    const contractConfig = config.contracts.find(c => c.contractName === contractName);
    if (!contractConfig) {
        throw new Error("FRouter configuration not found");
    }
    return contractConfig;
}

// Deploy FFactory contract
async function deployFFactory(networkName: string, contractConfig: ContractDeployConfig) {

    console.log("\nDeploying FFactory...");
    const contract = await deployContract(
        networkName,
        contractConfig.contractName,
        contractConfig.args,
        contractConfig.verify,
        contractConfig.proxy,
        contractConfig.deployName
    );

    const contractAddress = await contract.getAddress();
    console.log(`FFactory deployed successfully at: ${contractAddress}`);
    return await ethers.getContractAt("FFactory", contractAddress);

}

// Deploy FRouter contract
async function deployFRouter(networkName: string, contractConfig: ContractDeployConfig) {

    console.log("\nDeploying FRouter...");
    const contract = await deployContract(
        networkName,
        contractConfig.contractName,
        contractConfig.args,
        contractConfig.verify,
        contractConfig.proxy,
        contractConfig.deployName
    );

    const contractAddress = await contract.getAddress();
    console.log(`FRouter deployed successfully at: ${contractAddress}`);
    return await ethers.getContractAt("FRouter", contractAddress);

}

// Deploy BondingTax contract
async function deployBondingTax(networkName: string, contractConfig: ContractDeployConfig) {

    console.log("\nDeploying BondingTax...");
    const contract = await deployContract(
        networkName,
        contractConfig.contractName,
        contractConfig.args,
        contractConfig.verify,
        contractConfig.proxy,
        contractConfig.deployName
    );

    const contractAddress = await contract.getAddress();
    console.log(`BondingTax deployed successfully at: ${contractAddress}`);
    return await ethers.getContractAt("BondingTax", contractAddress);

}

// Deploy Bonding contract
async function deployBonding(networkName: string, contractConfig: ContractDeployConfig) {

    console.log("\nDeploying Bonding...");
    const contract = await deployContract(
        networkName,
        contractConfig.contractName,
        contractConfig.args,
        contractConfig.verify,
        contractConfig.proxy,
        contractConfig.deployName
    );

    const contractAddress = await contract.getAddress();
    console.log(`Bonding deployed successfully at: ${contractAddress}`);
    return await ethers.getContractAt("Bonding", contractAddress);

}

// Deploy AgentFactory contract
async function deployAgentFactory(networkName: string, contractConfig: ContractDeployConfig) {

    console.log("\nDeploying AgentFactory...");
    const contract = await deployContract(
        networkName,
        contractConfig.contractName,
        contractConfig.args,
        contractConfig.verify,
        contractConfig.proxy,
        contractConfig.deployName
    );

    const contractAddress = await contract.getAddress();
    console.log(`AgentFactory deployed successfully at: ${contractAddress}`);
    return await ethers.getContractAt("AgentFactory", contractAddress);

}

// Deploy AgentTokenImpl contract
async function deployAgentTokenImpl(networkName: string, contractConfig: ContractDeployConfig) {

    console.log("\nDeploying AgentToken as AgentTokenImpl...");
    const contract = await deployContract(
        networkName,
        contractConfig.contractName,
        contractConfig.args,
        contractConfig.verify,
        contractConfig.proxy,
        contractConfig.deployName
    );

    const contractAddress = await contract.getAddress();
    console.log(`AgentTokenImpl deployed successfully at: ${contractAddress}`);
    return await ethers.getContractAt("AgentToken", contractAddress);

}


// Execute the deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
