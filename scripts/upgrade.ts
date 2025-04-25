import hre, {ethers, upgrades} from "hardhat";
import {getContractDeployInfo} from "./helper/deployInfo";

async function main() {
    const networkName = hre.network.name;
    console.log(`Upgrading contracts on network: ${networkName}`);

    // await upgradeBonding(networkName);
    // await upgradeAgentFactory(networkName);
    // await upgradeFRouter(networkName);
    // await upgradeBondingTax(networkName);
}

async function upgradeBondingTax(networkName: string) {
    const contractInfo = await getContractDeployInfo(networkName, "BondingTax");
    const contract = await ethers.getContractFactory("BondingTax");
    await upgrades.upgradeProxy(contractInfo.address, contract);
    console.log(`FRouter contract upgraded to: ${contractInfo.address}`);

}
async function upgradeFRouter(networkName: string) {
    const contractInfo = await getContractDeployInfo(networkName, "FRouter");
    const contract = await ethers.getContractFactory("FRouter");
    await upgrades.upgradeProxy(contractInfo.address, contract);
    console.log(`FRouter contract upgraded to: ${contractInfo.address}`);

}
async function upgradeAgentFactory(networkName: string) {
    const contractInfo = await getContractDeployInfo(networkName, "AgentFactory");
    const contract = await ethers.getContractFactory("AgentFactory");
    await upgrades.upgradeProxy(contractInfo.address, contract);
    console.log(`AgentFactory contract upgraded to: ${contractInfo.address}`);

}
async function upgradeBonding(networkName: string) {
    const contractInfo = await getContractDeployInfo(networkName, "Bonding");
    const contract = await ethers.getContractFactory("Bonding");
    await upgrades.upgradeProxy(contractInfo.address, contract);
    console.log(`Bonding contract upgraded to: ${contractInfo.address}`);

}

// Execute the deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
