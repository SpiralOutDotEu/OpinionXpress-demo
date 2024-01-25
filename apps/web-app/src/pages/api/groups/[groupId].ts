import type { NextApiRequest, NextApiResponse } from "next"
import { getGroupMembers } from "../../../services/contractService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            const { groupId } = req.query
            const members = await getGroupMembers(groupId as string)
            res.status(200).json(members)
        } catch (error) {
            console.error("Error is: ", error)
            if (error instanceof Error) {
                res.status(404).json({ message: error.message })
            } else {
                // For non-Error types, you might not have a message property
                res.status(500).json({ message: "Internal server error" })
            }
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" })
    }
}
