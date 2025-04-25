// import hre, {ethers, upgrades} from "hardhat";
// import {AbiCoder} from "ethers";
// import {DeploymentConfig, getDeployConfig} from "../scripts/config/deployConfig";
// import {deployContract} from "../scripts/helper/deployments";
// import {getContractDeployInfo} from "../scripts/helper/deployInfo";
//
//
// async function main() {
//     const {chainId, networkName, config} = await getDeployConfig();
//     console.log(`Upgrading contracts on network: ${networkName}`);
//     // await deployAgentToken(networkName,config);
//
//     // await upgradeAgentToken(networkName);
//
//     await addInitialLiquidity(networkName);
//
//     // await calSqrtPriceX96(networkName);
//
// }
//
// async function calSqrtPriceX96(networkName: string) {
//     const contractInfo = await getContractDeployInfo(networkName, "AgentTokenTest");
//     const contract = await ethers.getContractAt("AgentToken",contractInfo.address);
//     const sqrtPriceX96 = await contract.calSqrtPriceX96();
//     console.log(`sqrtPriceX96: ${sqrtPriceX96}`);
// }
//
//
// async function addInitialLiquidity(networkName: string) {
//     const [deployer] = await ethers.getSigners();
//     const contractInfo = await getContractDeployInfo(networkName, "AgentTokenTest");
//     const contract = await ethers.getContractAt("AgentToken",contractInfo.address);
//     await contract.addInitialLiquidity(deployer.address);
// }
//
// async function upgradeAgentToken(networkName: string) {
//     const contractInfo = await getContractDeployInfo(networkName, "AgentTokenTest");
//     const contract = await ethers.getContractFactory("AgentToken");
//     await upgrades.upgradeProxy(contractInfo.address, contract);
//     console.log(`AgentTokenTest contract upgraded to: ${contractInfo.address}`);
//
// }
// async function deployAgentToken(networkName:string,config: DeploymentConfig) {
//     const [deployer] = await ethers.getSigners();
//     const contractName = "AgentToken";
//     const tokenAdmin = deployer.address;
//     const assetToken = config.sharedInitParams.assetToken;
//     const nonfungiblePositionManager = config.sharedInitParams.nonfungiblePositionManager;
//     const swapRouter = config.sharedInitParams.swapRouter;
//     const integrationAddresses: string[] = [tokenAdmin, assetToken, nonfungiblePositionManager, swapRouter];
//     const abiCoder = new AbiCoder();
//     const baseParams = abiCoder.encode(["string", "string"], ["Test Token", "TT"]);
//     // _tokenSupplyParams = abi.encode(
//     //     maxSupply,
//     //     lpSupply,
//     //     vaultSupply,
//     //     maxTokensPerWallet,
//     //     maxTokensPerTxn,
//     //     botProtectionDurationInSeconds,
//     //     vault
//     // );
//     const maxSupply = config.sharedInitParams.agentMaxSupply;
//     const lpSupply = config.sharedInitParams.agentLpSupply;
//     const vaultSupply = config.sharedInitParams.agentVaultSupply;
//     const maxTokensPerWallet =config.sharedInitParams.agentMaxTokensPerWallet;
//     const maxTokensPerTxn = config.sharedInitParams.agentMaxTokensPerTxn;
//     const botProtectionDurationInSeconds = config.sharedInitParams.agentBotProtectionDurationInSeconds;
//     const vault = deployer.address;
//     const supplyParams = abiCoder.encode(["uint256", "uint256", "uint256", "uint256", "uint256", "uint256", "address"], [maxSupply, lpSupply, vaultSupply, maxTokensPerWallet, maxTokensPerTxn, botProtectionDurationInSeconds, vault]);
//
//     // function setTokenTaxParams(
//     //     uint256 projectBuyTaxBasisPoints,
//     //     uint256 projectSellTaxBasisPoints,
//     //     uint256 taxSwapThresholdBasisPoints,
//     //     address projectTaxRecipient
//     const projectBuyTaxBasisPoints = config.sharedInitParams.agentProjectBuyTaxBasisPoints;
//     const projectSellTaxBasisPoints = config.sharedInitParams.agentProjectSellTaxBasisPoints;
//     const taxSwapThresholdBasisPoints = config.sharedInitParams.agentTaxSwapThresholdBasisPoints;
//     const projectTaxRecipient = deployer.address;
//     const tokenTaxParams = abiCoder.encode(["uint256", "uint256", "uint256", "address"], [projectBuyTaxBasisPoints, projectSellTaxBasisPoints, taxSwapThresholdBasisPoints, projectTaxRecipient]);
//     const args: any[] = [
//         integrationAddresses,
//         baseParams,
//         supplyParams,
//         tokenTaxParams
//     ];
//     await deployContract(networkName,contractName, args, true, true, "AgentTokenTest", "initialize", undefined);
// }
//
//
//
// // Execute the deployment
// main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//         console.error(error);
//         process.exit(1);
//     });
//
//
//
