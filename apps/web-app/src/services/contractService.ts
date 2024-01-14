import { Defender } from "@openzeppelin/defender-sdk"
import { ethers } from "ethers"
import opinionXpressABI from "../../ABIs/OpinionXpress.json"

// eslint-disable-next-line import/prefer-default-export
export async function addMemberToContract(groupId: string, commitment: string): Promise<string> {
    const { RELAYER_API_KEY, RELAYER_API_SECRET, OPINION_X_PRESS_CONTRACT_ADDRESS } = process.env
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
