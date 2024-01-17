import { Defender } from "@openzeppelin/defender-sdk"
import { ethers } from "ethers"
import opinionXpressABI from "../../ABIs/OpinionXpress.json"

const { RELAYER_API_KEY, RELAYER_API_SECRET, OPINION_X_PRESS_CONTRACT_ADDRESS, NETWORK_RPC } = process.env

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
    const provider = new ethers.providers.JsonRpcProvider(NETWORK_RPC);

    // Create a new instance of the contract
    const contract = new ethers.Contract(OPINION_X_PRESS_CONTRACT_ADDRESS as string, opinionXpressABI.abi, provider);

    // Fetch the PollCreated events
    const events = await contract.queryFilter("GroupCreated");
    
    return events.map(event => ({
        groupId: event.args?.groupId.toString(),
        depth: event.args?.depth.toString(),
    }));
}
