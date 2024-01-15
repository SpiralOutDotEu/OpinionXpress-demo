import { addMemberToContract } from "../../src/services/contractService"

// Mock Defender class
jest.mock("@openzeppelin/defender-sdk", () => ({
    Defender: jest.fn().mockImplementation(() => ({
        relaySigner: {
            getProvider: jest.fn().mockReturnValue({
                getNetwork: jest.fn().mockReturnValue({ chainId: 1 }) // Change chainId if needed
            }),
            getSigner: jest.fn().mockReturnValue({
                getAddress: jest.fn().mockReturnValue("mocked-signer-address")
            })
        }
    }))
}))

// Mock ethers.Contract class
jest.mock("ethers", () => ({
    ethers: {
        Contract: jest.fn().mockImplementation(() => ({
            addMember: jest.fn().mockReturnValue({
                wait: jest.fn().mockResolvedValue({ transactionHash: "mocked-transaction-hash" })
            })
        }))
    }
}))

describe("addMemberToContract", () => {
    it("should add a member to the contract and return transaction hash", async () => {
        // Mock process.env
        process.env.RELAYER_API_KEY = "mocked-relayer-api-key"
        process.env.RELAYER_API_SECRET = "mocked-relayer-api-secret"
        process.env.OPINION_X_PRESS_CONTRACT_ADDRESS = "mocked-contract-address"

        const groupId = "mocked-group-id"
        const commitment = "mocked-commitment"

        const transactionHash = await addMemberToContract(groupId, commitment)

        // Assert the overall behavior of the function
        expect(transactionHash).toBe("mocked-transaction-hash")
        // TODO: test also that 
    })
})

