import * as dotenv from "dotenv";
import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";
import '@openzeppelin/hardhat-upgrades';

dotenv.config();
const accounts = process.env.PRIVATE_KEYS ? process.env.PRIVATE_KEYS.split(',') : [];
const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.28",
        settings: {
            viaIR: true,
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    sourcify: {
        enabled: true,
    },
    networks: {
        bsc: {
            url: "https://bsc-rpc.publicnode.com",
            accounts: accounts,
        },
        bsc_testnet: {
            url: "https://bsc-testnet.publicnode.com",
            accounts: accounts,
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337
        }
    },
    etherscan: {
        apiKey: {
            bsc: process.env.BSCSCAN_API_KEY || '',
            bsc_testnet: process.env.BSCSCAN_API_KEY || '',
        },
        customChains: [
            {
                network: "bsc",
                chainId: 56,
                urls: {
                    apiURL: "https://api.bscscan.com/api/",
                    browserURL: "https://bscscan.com/"
                }
            },
            {
                network: "bsc_testnet",
                chainId: 97,
                urls: {
                    apiURL: "https://api-testnet.bscscan.com/api",
                    browserURL: "https://testnet.bscscan.com/"
                }
            }
        ]
    }
};

export default config;
