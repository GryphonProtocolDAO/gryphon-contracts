import { DeployContractOptions } from "@nomicfoundation/hardhat-ethers/types";
import { ethers, upgrades } from "hardhat";
import { ethers as ethersJs } from "ethers";
import { verifyContracts } from "./verifier";
import { getContractDeployInfo, saveContractDeployInfo } from "./deployInfo";
import { getImplementationAddress } from "@openzeppelin/upgrades-core/dist/eip-1967";

export const deployContract = async (
    networkName: string,
    contractName: string,
    args: any[],
    verifyFlag?: boolean,
    proxyFlag?: boolean,
    deployName?: string,
    initializer?: string | false,
    signerOrOptions?: ethersJs.Signer | DeployContractOptions) => {
    const _deployName = deployName || contractName;

    let contractDeployInfo = await getContractDeployInfo(networkName, _deployName);
    let contract;
    if (!ethers.isAddress(contractDeployInfo.address) || !ethers.isHexString(contractDeployInfo.deployHash)) {
        if (proxyFlag) {
            const factory = await ethers.getContractFactory(contractName, signerOrOptions);
            // Pass initializer option to deployProxy
            contract = await upgrades.deployProxy(factory, args, {
                initializer: initializer === undefined ? "initialize" : initializer
            });
        } else {
            contract = await ethers.deployContract(contractName, args, signerOrOptions);
        }
        await contract.waitForDeployment();

        const address = await contract.getAddress();
        const txHash = contract.deploymentTransaction()?.hash;
        contractDeployInfo.contractName = contractName;
        contractDeployInfo.address = address;
        contractDeployInfo.deployHash = txHash || '';
        contractDeployInfo.isProxy = proxyFlag || false;
        console.log(`Contract ${contractName} deployed to ${address} with tx ${txHash}`);
    } else {
        contract = await ethers.getContractAt(contractName, contractDeployInfo.address);
        console.log(`Contract ${contractName} already deployed at address ${contractDeployInfo.address}`)
    }
    contractDeployInfo.verifyFlag = verifyFlag || false;

    if (!proxyFlag) {
        if (contractDeployInfo.verifyFlag && !contractDeployInfo.execVerifyFlag && !proxyFlag) {
            try {
                await verifyContracts(networkName, contractDeployInfo.address, args, verifyFlag);
            } catch (e) {
                console.error(`Failed to verify contract ${contractName} with address ${contractDeployInfo.address}`, e);
            } finally {
                contractDeployInfo.execVerifyFlag = true;
            }
        } else {
            console.log(`Skipping verification for contract ${contractName} with address ${contractDeployInfo.address}`)
        }
    } else {
        if (contractDeployInfo.verifyFlag && !contractDeployInfo.execVerifyFlag) {
            const [singer] = await ethers.getSigners();
            const implAddress = await getImplementationAddress(singer.provider, contractDeployInfo.address);

            try {
                await verifyContracts(networkName, implAddress, [], true);
            } catch (e) {
                console.error(`Failed to verify contract ${contractName} with address ${contractDeployInfo.address}`, e);
            } finally {
                contractDeployInfo.execVerifyFlag = true;
            }
        }
    }

    await saveContractDeployInfo(networkName, _deployName, contractDeployInfo);

    return contract;
}




