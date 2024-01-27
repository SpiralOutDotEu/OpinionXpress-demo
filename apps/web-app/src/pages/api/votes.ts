import type { NextApiRequest, NextApiResponse } from "next"
import { castVote } from "../../services/contractService"

type Data = {
    message: string
    transactionHash?: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    if (req.method === "POST") {
        try {
            const { vote, merkleTreeRoot, nullifierHash, pollId, proof, groupId} = req.body

            if (vote === null || !merkleTreeRoot || !nullifierHash || !pollId || !proof || !groupId) {
                res.status(400).json({ message: "Missing parameter" })
                return
            }

            try {
                const transactionHash = await castVote(vote, merkleTreeRoot, nullifierHash, pollId, proof, groupId)
                res.status(200).json({ message: "Vote casted successfully: ", transactionHash })
            } catch (error) {
                if (error instanceof Error) throw new Error(error.message)
                else throw new Error("Error in transaction")
            }
        } catch (error) {
            console.error(error)
            if (error instanceof Error) res.status(400).json({ message: error.message })
            res.status(500).json({ message: "Internal server error" })
        }
    } else {
        res.setHeader("Allow", ["GET"])
        res.status(405).json({ message: "Method Not Allowed" })
    }
}
