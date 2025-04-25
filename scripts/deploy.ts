import {ethers} from "hardhat";
import {getDeployConfig} from "./config/deployConfig";
import {deployContract} from "./helper/deployments";
import {getAllContractDeployInfo, getContractDeployInfo} from "./helper/deployInfo";
import {ZeroAddress} from "ethers";

async function main() {

    // Get deployment configuration based on the current network
    const {chainId, networkName, config} = await getDeployConfig();

    // Get the signer (deployer)
    const [deployer] = await ethers.getSigners();

    console.log(`Deploying to network: ${networkName} (Chain ID: ${chainId}) as ${deployer.address}...`);

    // Use asset token from config or set it to a specific address if needed
    const assetToken = config.sharedInitParams.assetToken;

    for (const contractConfig of config.contracts) {
        const {contractName, args, verify, proxy, deployName} = contractConfig;
        const name = deployName || contractName;

        console.log(`\nDeploying ${contractName} as ${name}...`);

        try {
            const contract = await deployContract(
                networkName,
                contractName,
                args,
                verify,
                proxy,
                deployName,
                false
            );
            const contractAddress = await contract.getAddress();


            console.log(`${name} deployed successfully at: ${contractAddress}`);
        } catch (error) {
            console.error(`Error deploying ${contractName}:`, error);
            // Continue with other deployments even if one fails
        }


    }

    // Initialize the deployed contracts
    console.log("\nInitializing contracts...");

    try {
        const fFactoryAddress = (await getContractDeployInfo(networkName, "FFactory")).address;
        const fFactory = await ethers.getContractAt("FFactory", fFactoryAddress);
        const fRouterAddress = (await getContractDeployInfo(networkName, "FRouter")).address;
        const fRouter = await ethers.getContractAt("FRouter", fRouterAddress);
        let bondingTaxName = "BondingTax";
        if (config.extContract) {
            bondingTaxName = bondingTaxName + "Ext";
        }
        const bondingTaxAddress = (await getContractDeployInfo(networkName, bondingTaxName)).address;
        const bondingTax = await ethers.getContractAt(bondingTaxName, bondingTaxAddress);
        const bondingAddress = (await getContractDeployInfo(networkName, "Bonding")).address;
        const bonding = await ethers.getContractAt("Bonding", bondingAddress);
        const agentFactoryAddress = (await getContractDeployInfo(networkName, "AgentFactory")).address;
        const agentFactory = await ethers.getContractAt("AgentFactory", agentFactoryAddress);
        let agentTokenImplName = "AgentTokenImpl";
        if (config.extContract) {
            agentTokenImplName = agentTokenImplName + "Ext";
        }
        const agentTokenImplAddress = (await getContractDeployInfo(networkName, agentTokenImplName)).address;


        // Convert string ether values to BigNumber
        const minSwapThreshold = ethers.parseEther(config.sharedInitParams.minSwapThreshold);
        const maxSwapThreshold = ethers.parseEther(config.sharedInitParams.maxSwapThreshold);
        const maxTx = config.sharedInitParams.maxTx;
        const gradThreshold = ethers.parseEther(config.sharedInitParams.gradThreshold);
        const applicationThreshold = ethers.parseEther(config.sharedInitParams.applicationThreshold);

        console.log("Initializing FFactory...");
        let txAwait;
        const fFactoryTaxVault = await fFactory.taxVault();
        if (fFactoryTaxVault === ZeroAddress) {
            let taxVault = bondingTaxAddress;
            if (config.sharedInitParams.taxVault) {
                taxVault = config.sharedInitParams.taxVault;
            }
            txAwait = await fFactory.initialize(
                taxVault, // taxVault
                config.sharedInitParams.buyTax, // buyTax (from config)
                config.sharedInitParams.sellTax  // sellTax (from config)
            );
            await txAwait.wait();
        } else {
            console.log("FFactory already initialized");
        }

        console.log("Initializing FRouter...");
        const fRouterFactoryAddress = await fRouter.factory();
        if (fRouterFactoryAddress === ZeroAddress) {
            txAwait = await fRouter.initialize(
                fFactoryAddress, // factory
                assetToken // assetToken
            );
            await txAwait.wait();
        } else {
            console.log("FRouter already initialized");
        }


        console.log("Initializing BondingTax...");
        const bondingTaxAssetToken = await bondingTax.treasury();
        if (bondingTaxAssetToken === ZeroAddress) {
            txAwait = await bondingTax.initialize(
                deployer.address, // defaultAdmin
                config.sharedInitParams.taxAssetToken, // tax token for buy assetToken
                assetToken, // taxToken
                config.sharedInitParams.swapRouter, // swap router
                fRouterAddress, // fRouter
                deployer.address, // treasury
                minSwapThreshold, // minSwapThreshold
                maxSwapThreshold // maxSwapThreshold
            );
            await txAwait.wait();
        } else {
            console.log("BondingTax already initialized");
        }

        console.log("Initializing Bonding...");
        const bondingFactoryAddress = await bonding.factory();
        if (bondingFactoryAddress === ZeroAddress) {
            txAwait = await bonding.initialize(
                fFactoryAddress, // factory
                fRouterAddress, // router
                deployer.address, // feeTo
                config.sharedInitParams.fee, // fee
                config.sharedInitParams.initialSupply, // initialSupply
                config.sharedInitParams.assetRate, // assetRate
                maxTx, // maxTx
                agentFactoryAddress, // agentFactory
                gradThreshold // gradThreshold
            );
            await txAwait.wait();
        } else {
            console.log("Bonding already initialized");
        }

        console.log("Initializing AgentFactory...");
        if (await agentFactory.tokenImplementation() === ZeroAddress) {
            txAwait = await agentFactory.initialize(
                agentTokenImplAddress, // tokenImplementation
                assetToken, // assetToken
                applicationThreshold, // applicationThreshold
                0, // nextId
                deployer.address,// tokenAdmin
                config.sharedInitParams.swapRouter,
            );
            await txAwait.wait();
        } else {
            console.log("AgentFactory already initialized");
        }


        console.log("Granting ADMIN_ROLE to deployer in FFactory...");
        const ADMIN_ROLE = await fFactory.ADMIN_ROLE();
        console.log("ADMIN_ROLE", ADMIN_ROLE);
        if (!(await fFactory.hasRole(ADMIN_ROLE, deployer.address))) {
            txAwait = await fFactory.grantRole(ADMIN_ROLE, deployer.address);
            await txAwait.wait();
        } else {
            console.log("deployer already has ADMIN_ROLE in FFactory");
        }
        const ADMIN_ROLE_ROUTER = await fRouter.ADMIN_ROLE();
        console.log("ADMIN_ROLE_ROUTER", ADMIN_ROLE_ROUTER);
        if (!(await fRouter.hasRole(ADMIN_ROLE_ROUTER, deployer.address))) {
            txAwait = await fRouter.grantRole(ADMIN_ROLE_ROUTER, deployer.address);
            await txAwait.wait();
        } else {
            console.log("deployer already has ADMIN_ROLE in FRouter");
        }


        console.log("Granting CREATOR_ROLE to Bonding in FFactory...");
        const CREATOR_ROLE = await fFactory.CREATOR_ROLE();
        console.log("CREATOR_ROLE", CREATOR_ROLE);
        if (!(await fFactory.hasRole(CREATOR_ROLE, bondingAddress))) {
            txAwait = await fFactory.grantRole(CREATOR_ROLE, bondingAddress);
            await txAwait.wait();
        } else {
            console.log("Bonding already has CREATOR_ROLE in FFactory");
        }


        console.log("Granting EXECUTOR_ROLE to Bonding in FRouter...");
        const EXECUTOR_ROLE = await fRouter.EXECUTOR_ROLE();
        console.log("EXECUTOR_ROLE", EXECUTOR_ROLE);
        if (!(await fRouter.hasRole(EXECUTOR_ROLE, bondingAddress))) {
            txAwait = await fRouter.grantRole(EXECUTOR_ROLE, bondingAddress);
            await txAwait.wait();
        } else {
            console.log("Bonding already has EXECUTOR_ROLE in FRouter");
        }

        console.log("Granting BONDING_ROLE to Bonding in AgentFactory...");
        const BONDING_ROLE = await agentFactory.BONDING_ROLE();
        console.log("BONDING_ROLE", BONDING_ROLE);
        if (!(await agentFactory.hasRole(BONDING_ROLE, bondingAddress))) {
            txAwait = await agentFactory.grantRole(BONDING_ROLE, bondingAddress);
            await txAwait.wait();
        } else {
            console.log("Bonding already has BONDING_ROLE in AgentFactory");
        }


        console.log("Setting router in FFactory...");
        if (await fFactory.router() === ZeroAddress) {
            txAwait = await fFactory.setRouter(fRouterAddress);
            await txAwait.wait();
        } else {
            console.log("FRouter already set in FFactory");
        }

        console.log("Setting tax manager in FRouter...");
        if (await fRouter.taxManager() === ZeroAddress) {
            txAwait = await fRouter.setTaxManager(bondingTaxAddress);
            await txAwait.wait();
        } else {
            console.log("BondingTax already set in FRouter");
        }


        const agentFactoryTokenSupplyParams = await agentFactory.getTokenTaxParams();
        console.log("Setting token supply params in AgentFactory... previous params:", agentFactoryTokenSupplyParams);
        if (agentFactoryTokenSupplyParams === "0x") {
            txAwait = await agentFactory.setTokenSupplyParams(
                config.sharedInitParams.agentMaxSupply,            // maxSupply
                config.sharedInitParams.agentLpSupply,             // lpSupply
                config.sharedInitParams.agentVaultSupply,          // vaultSupply
                config.sharedInitParams.agentMaxTokensPerWallet,   // maxTokensPerWallet
                config.sharedInitParams.agentMaxTokensPerTxn,      // maxTokensPerTxn
                config.sharedInitParams.agentBotProtectionDurationInSeconds, // botProtectionDurationInSeconds
                deployer.address                                   // vault
            );
            await txAwait.wait();
        } else {
            console.log("AgentFactory token supply params already set");
        }

        const agentFactoryTokenTaxParams = await agentFactory.getTokenTaxParams();
        console.log("Setting token tax params in AgentFactory... previous params:", agentFactoryTokenTaxParams);
        if (agentFactoryTokenTaxParams === "0x") {
            txAwait = await agentFactory.setTokenTaxParams(
                config.sharedInitParams.agentProjectBuyTaxBasisPoints,    // projectBuyTaxBasisPoints
                config.sharedInitParams.agentProjectSellTaxBasisPoints,   // projectSellTaxBasisPoints
                config.sharedInitParams.agentTaxSwapThresholdBasisPoints, // taxSwapThresholdBasisPoints
                bondingTaxAddress                                          // projectTaxRecipient
            );
            await txAwait.wait();
        } else {
            console.log("AgentFactory token tax params already set");
        }

    } catch (error) {
        console.error("Error during contract initialization:", error);
    }

    console.log("\nAll deployments and initializations completed!");

    // Print summary of all deployed contracts
    console.log("\nDeployment Summary:");
    const deployInfo = await getAllContractDeployInfo(networkName);
    for (const [name, info] of Object.entries(deployInfo)) {
        console.log(`${name}: ${info.address}`);
    }
}

// Execute the deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
