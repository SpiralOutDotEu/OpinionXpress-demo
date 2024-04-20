import { Defender } from "@openzeppelin/defender-sdk"
import { ethers } from "ethers"
import { SemaphoreEthers } from "@semaphore-protocol/data"
import opinionXpressABI from "../../ABIs/OpinionXpress.json"

const { RELAYER_API_KEY, RELAYER_API_SECRET, OPINION_X_PRESS_CONTRACT_ADDRESS, NETWORK_RPC, SEMAPHORE_ADDRESS } =
    process.env

// eslint-disable-next-line import/prefer-default-export
export async function addMemberToContract(groupId: string, commitment: string): Promise<string> {
    const credentials = {
        relayerApiKey: RELAYER_API_KEY,
        relayerApiSecret: RELAYER_API_SECRET
    }
    const client = new Defender(credentials)

    const provider = client.relaySigner.getProvider()
    const signer = client.relaySigner.getSigner(provider, { speed: "fast" })

    const opinionXpress = new ethers.Contract(OPINION_X_PRESS_CONTRACT_ADDRESS as string, opinionXpressABI.abi, signer)

    const tx = await opinionXpress.addMember(groupId, commitment)
    const mined = await tx.wait()
    return mined.transactionHash
}

export async function getGroupCreatedEvents() {
    // Connect to an Ethereum provider
    const provider = new ethers.providers.JsonRpcProvider(NETWORK_RPC)

    // Create a new instance of the contract
    const contract = new ethers.Contract(OPINION_X_PRESS_CONTRACT_ADDRESS as string, opinionXpressABI.abi, provider)

    // Fetch the PollCreated events
    const events = await contract.queryFilter("GroupCreated")

    return events.map((event) => ({
        groupId: event.args?.groupId.toString(),
        depth: event.args?.depth.toString()
    }))
}

export async function getPollsCreatedEvents() {
    // Connect to an Ethereum provider
    const provider = new ethers.providers.JsonRpcProvider(NETWORK_RPC)

    // Create a new instance of the contract
    const contract = new ethers.Contract(OPINION_X_PRESS_CONTRACT_ADDRESS as string, opinionXpressABI.abi, provider)

    // Fetch the PollCreated events
    const events = await contract.queryFilter("PollCreated")

    return events.map((event) => ({
        pollId: event.args?.pollId.toString(),
        text: event.args?.text.toString()
    }))
}

export async function getGroupMembers(groupId: string) {
    const semaphoreEthers = new SemaphoreEthers(NETWORK_RPC, {
        address: SEMAPHORE_ADDRESS,
        startBlock: process.env.NEXT_PUBLIC_STARTUP_BLOCK as unknown as number
    })

    const members = await semaphoreEthers.getGroupMembers(groupId)
    return members
}

export async function castVote(
    vote: number,
    merkleTreeRoot: number,
    nullifierHash: number,
    pollId: number,
    proof: number[],
    externalNullifier: number
) {
    const credentials = {
        relayerApiKey: RELAYER_API_KEY,
        relayerApiSecret: RELAYER_API_SECRET
    }
    const client = new Defender(credentials)

    const provider = client.relaySigner.getProvider()
    const signer = client.relaySigner.getSigner(provider, { speed: "fast" })

    const opinionXpress = new ethers.Contract(OPINION_X_PRESS_CONTRACT_ADDRESS as string, opinionXpressABI.abi, signer)

    try {
        const tx = await opinionXpress.castVote(vote, merkleTreeRoot, nullifierHash, pollId, proof, externalNullifier)
        const mined = await tx.wait()
        return mined.transactionHash
    } catch (error) {
        if (error instanceof Error) throw new Error(error.message)
        else throw new Error("Error in transaction")
    }
}

export async function getSurveyCreatedEvents() {
    // Connect to an Ethereum provider
    const provider = new ethers.providers.JsonRpcProvider(NETWORK_RPC)

    // Create a new instance of the contract
    const contract = new ethers.Contract(OPINION_X_PRESS_CONTRACT_ADDRESS as string, opinionXpressABI.abi, provider)

    // Fetch the PollCreated events
    const events = await contract.queryFilter("SurveyCreated")

    return events.map((event) => ({
        surveyId: event.args?.surveyId.toString(),
        ipfsLink: event.args?.ipfsLink.toString(),
        questionsCount: event.args?.questionsCount.toString(),
        optionsPerQuestion: event.args?.optionsPerQuestion.toString()
    }))
}

export async function getSurvey(surveyId: string) {
    // Connect to an Ethereum provider
    const provider = new ethers.providers.JsonRpcProvider(NETWORK_RPC)

    // Create a new instance of the contract
    const contract = new ethers.Contract(OPINION_X_PRESS_CONTRACT_ADDRESS as string, opinionXpressABI.abi, provider)

    // Fetch a survey
    const survey = await contract.getSurvey(BigInt(surveyId))

    return survey
}

export async function getSurveyResponses(surveyId: string) {
    // Connect to an Ethereum provider
    const provider = new ethers.providers.JsonRpcProvider(NETWORK_RPC)

    // Create a new instance of the contract
    const contract = new ethers.Contract(OPINION_X_PRESS_CONTRACT_ADDRESS as string, opinionXpressABI.abi, provider)

    // Fetch responses of a survey
    const surveyResponses = await contract.getSurvey(BigInt(surveyId))

    return surveyResponses
}

export async function submitSurveyResponse(
    surveyId: number,
    encodedResponses: BigInt,
    merkleTreeRoot: number,
    nullifierHash: number,
    proof: number[],
    groupId: number
) {
    const credentials = {
        relayerApiKey: RELAYER_API_KEY,
        relayerApiSecret: RELAYER_API_SECRET
    }
    const client = new Defender(credentials)

    const provider = client.relaySigner.getProvider()
    const signer = client.relaySigner.getSigner(provider, { speed: "fast" })

    const opinionXpress = new ethers.Contract(OPINION_X_PRESS_CONTRACT_ADDRESS as string, opinionXpressABI.abi, signer)
    try {
        const tx = await opinionXpress.submitSurveyResponse(
            surveyId,
            encodedResponses,
            merkleTreeRoot,
            nullifierHash,
            proof,
            groupId
        )
        const mined = await tx.wait()
        return mined.transactionHash
    } catch (error) {
        if (error instanceof Error) throw new Error(error.message)
        else throw new Error("Error in transaction")
    }
}
