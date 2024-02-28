/** @type {import('next').NextConfig} */

const fs = require("fs")
const withPWA = require("next-pwa")

if (!fs.existsSync("./.env")) {
    // eslint-disable-next-line global-require
    require("dotenv").config({ path: "../../.env" })
}

const nextConfig = withPWA({
    dest: "public",
    disable: process.env.NODE_ENV === "development"
})({
    eslint: {
        ignoreDuringBuilds: true
    },
    reactStrictMode: true,
    swcMinify: true,
    env: {
        DEFAULT_NETWORK: process.env.DEFAULT_NETWORK,
        INFURA_API_KEY: process.env.INFURA_API_KEY,
        ETHEREUM_PRIVATE_KEY: process.env.ETHEREUM_PRIVATE_KEY,
        FEEDBACK_CONTRACT_ADDRESS: process.env.FEEDBACK_CONTRACT_ADDRESS,
        SEMAPHORE_CONTRACT_ADDRESS: process.env.SEMAPHORE_CONTRACT_ADDRESS,
        NETWORK_RPC: process.env.NETWORK_RPC,
        OPINION_X_PRESS_CONTRACT_ADDRESS: process.env.OPINION_X_PRESS_CONTRACT_ADDRESS,
        NETWORK_ID: process.env.NETWORK_ID,
        SEMAPHORE_ADDRESS: process.env.SEMAPHORE_ADDRESS,
        RELAYER_API_KEY: process.env.RELAYER_API_KEY,
        RELAYER_SECRET_KEY: process.env.RELAYER_API_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET

    },
    publicRuntimeConfig: {
        DEFAULT_NETWORK: process.env.DEFAULT_NETWORK,
        FEEDBACK_CONTRACT_ADDRESS: process.env.FEEDBACK_CONTRACT_ADDRESS,
        SEMAPHORE_CONTRACT_ADDRESS: process.env.SEMAPHORE_CONTRACT_ADDRESS,
        OPENZEPPELIN_AUTOTASK_WEBHOOK: process.env.OPENZEPPELIN_AUTOTASK_WEBHOOK,
        GROUP_ID: process.env.GROUP_ID,
        NETWORK_RPC: process.env.NETWORK_RPC,
        OPINION_X_PRESS_CONTRACT_ADDRESS: process.env.OPINION_X_PRESS_CONTRACT_ADDRESS,
        NETWORK_ID: process.env.NETWORK_ID,
        SEMAPHORE_ADDRESS: process.env.SEMAPHORE_ADDRESS,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                fs: false
            }
        }

        return config
    }
})

module.exports = nextConfig
