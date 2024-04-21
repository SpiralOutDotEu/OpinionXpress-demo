import "@nomicfoundation/hardhat-chai-matchers"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-etherscan"
import "@semaphore-protocol/hardhat"
import "@typechain/hardhat"
import { config as dotenvConfig } from "dotenv"
import "hardhat-gas-reporter"
import { HardhatUserConfig } from "hardhat/config"
import { NetworksUserConfig } from "hardhat/types"
import { resolve } from "path"
import "solidity-coverage"
import { config } from "./package.json"
import "./tasks/deploy"
import "./tasks/deploy-opinion"

dotenvConfig({ path: resolve(__dirname, "../../.env") })

function getNetworks(): NetworksUserConfig {
    if (!process.env.INFURA_API_KEY || !process.env.ETHEREUM_PRIVATE_KEY) {
        return {}
    }

    const accounts = [`0x${process.env.ETHEREUM_PRIVATE_KEY}`]
    const infuraApiKey = process.env.INFURA_API_KEY

    return {
        goerli: {
            url: `https://goerli.infura.io/v3/${infuraApiKey}`,
            chainId: 5,
            accounts
        },
        sepolia: {
            url: `https://sepolia.infura.io/v3/${infuraApiKey}`,
            chainId: 11155111,
            accounts
        },
        mumbai: {
            url: `https://polygon-mumbai.g.alchemy.com/v2/${infuraApiKey}`,
            chainId: 80001,
            accounts
        },
        "optimism-goerli": {
            url: `https://optimism-goerli.infura.io/v3/${infuraApiKey}`,
            chainId: 420,
            accounts
        },
        "arbitrum-sepolia": {
            url: `https://arbitrum-sepolia.infura.io/v3/${infuraApiKey}`,
            chainId: 421614,
            accounts
        },
        arbitrum: {
            url: "https://arb1.arbitrum.io/rpc",
            chainId: 42161,
            accounts
        }
    }
}

const hardhatConfig: HardhatUserConfig = {
    solidity: {
        compilers: [
            { version: "0.8.20" },
            {
                version: "0.8.4",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000
                    }
                }
            }
        ]
    },
    paths: {
        sources: config.paths.contracts,
        tests: config.paths.tests,
        cache: config.paths.cache,
        artifacts: config.paths.build.contracts
    },
    networks: {
        hardhat: {
            chainId: 1337
        },
        ...getNetworks()
    },
    gasReporter: {
        currency: "USD",
        enabled: process.env.REPORT_GAS === "true",
        coinmarketcap: process.env.COINMARKETCAP_API_KEY
    },
    typechain: {
        outDir: config.paths.build.typechain,
        target: "ethers-v5"
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
        customChains: [
            {
              network: "arbitrum-sepolia",
              chainId: 421614,
              urls: {
                apiURL: "https://api-sepolia.arbiscan.io/api",
                browserURL: "https://sepolia.etherscan.io"
              }
            }
          ]
    },
    mocha: {
        timeout: 10000
    }
}

export default hardhatConfig
