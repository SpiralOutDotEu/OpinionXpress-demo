import type { NextApiRequest, NextApiResponse } from "next"
import { getSurveyCreatedEvents, submitSurveyResponse } from "../../../services/contractService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            const members = await getSurveyCreatedEvents()
            res.status(200).json(members)
        } catch (error) {
            console.error("Error is: ", error)
            if (error instanceof Error) {
                res.status(404).json({ message: error.message })
            } else {
                res.status(500).json({ message: "Internal server error" })
            }
        }
    } else if (req.method === "POST") {
        try {
            const { encodedResponses, merkleTreeRoot, nullifierHash, surveyId, proof, groupId } = req.body
            if (!encodedResponses || !merkleTreeRoot || !nullifierHash || !surveyId || !proof || !groupId) {
                res.status(400).json({ message: "Missing parameter" })
            }
            console.log("submitSurveyResponse data: ", surveyId, encodedResponses, merkleTreeRoot, nullifierHash, proof, groupId)
            try {
                const transactionHash = await submitSurveyResponse(
                    surveyId,
                    encodedResponses,
                    merkleTreeRoot,
                    nullifierHash,
                    proof,
                    groupId
                )
                res.status(200).json({ message: "Survey response submitted successfully: ", transactionHash })
            } catch (error) {
                if (error instanceof Error) throw new Error(error.message)
                else throw new Error("Error in transaction")
            }
        } catch (error) {
            console.error("Error is: ", error)
            if (error instanceof Error) {
                res.status(400).json({ message: error.message })
            } else {
                res.status(500).json({ message: "Internal server error" })
            }
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" })
    }
}
