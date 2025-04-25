import {deployContract} from "../helper/deployments";

export async function mockAssetToken(networkName:string){
    const gryphonContract = await deployContract(
        networkName,
        "MockERC20",
        [],
        false,
        false,
        "DGRYPHON",
        false
    );

    const gryphonContractAddress = await gryphonContract.getAddress();
    console.log(`DGRYPHON deployed successfully at: ${gryphonContractAddress}`);

    return gryphonContractAddress;
}
