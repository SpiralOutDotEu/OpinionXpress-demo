import { addMemberToContract, getGroupCreatedEvents, getGroupMembers } from "../../src/services/contractService"

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
            }),
            queryFilter: jest.fn().mockResolvedValue([{ args: { groupId: "mocked-group-id", depth: "mocked-depth" } }]),
        })),
        providers: {
            JsonRpcProvider: jest.fn().mockImplementation(() => ({
                getNetwork: jest.fn().mockReturnValue({ chainId: 1 }), 
                getLogs: jest.fn().mockResolvedValue([{ args: { groupId: "mocked-group-id", depth: "mocked-depth" } }]) 
            }))
        },
    }
}))


jest.mock("@semaphore-protocol/data", () => ({
    SemaphoreEthers: jest.fn().mockImplementation(() => ({
        getGroupMembers: jest.fn().mockResolvedValue([123, 456, 789]) 
    }))
}));

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

    describe("getGroupCreatedEvents", () => {
        it("should fetch GroupCreated events and return them", async () => {
            // Mock process.env
            process.env.OPINION_X_PRESS_CONTRACT_ADDRESS = "mocked-contract-address"
            process.env.NETWORK_RPC = "mocked-network-rpc"

            const events = await getGroupCreatedEvents()

            // Assert the overall behavior of the function
            expect(events).toEqual([{ groupId: "mocked-group-id", depth: "mocked-depth" }])
        })
    })

    describe("getGroupMembers", () => {
        it("should fetch group members and return them", async () => {
            process.env.SEMAPHORE_ADDRESS = "mocked-semaphore-address"
            process.env.NETWORK_RPC = "mocked-network-rpc"
    
            const groupId = "mocked-group-id"
            const members = await getGroupMembers(groupId)
            
            // Assert the overall behavior of the function
            expect(members).toEqual([123, 456, 789])
        })
    })
})
