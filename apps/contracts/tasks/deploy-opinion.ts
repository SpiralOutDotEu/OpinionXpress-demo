import { task, types } from "hardhat/config"

task("deploy-opinion", "Deploy a OpinionXpress contract")
    .addOptionalParam("semaphore", "Semaphore contract address", undefined, types.string)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .addOptionalParam("verify", "Verify contract in etherscan", false, types.boolean)
    .setAction(async ({ logs, semaphore: semaphoreAddress, verify }, { ethers, run }) => {
        if (!semaphoreAddress) {
            const { semaphore } = await run("deploy:semaphore", {
                logs
            })

            semaphoreAddress = semaphore.address
        }

        const OpinionXpressFactory = await ethers.getContractFactory("OpinionXpress")

        const opinionXpressContract = await OpinionXpressFactory.deploy(semaphoreAddress)

        await opinionXpressContract.deployed()

        if (logs) {
            console.info(`opinionXpress contract has been deployed to: ${opinionXpressContract.address}`)
        }

        if (verify) {
            // Verify the contract on Mumbai Scan
            try {
                await run("verify:verify", {
                    address: opinionXpressContract.address,
                    constructorArguments: [semaphoreAddress],
                    network: "mumbai"
                })
                console.info(`OpinionXpress contract verified on Mumbai Scan at: ${opinionXpressContract.address}`)
            } catch (error) {
                console.error("Contract verification failed:", error)
            }
        }

        return opinionXpressContract
    })
