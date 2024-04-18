import type { NextApiRequest, NextApiResponse } from "next"
import { getIpfsFile } from "../../../services/ipfsService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            const { cid } = req.query

            const file = await getIpfsFile(cid as string)

            res.status(200).json(file)
        } catch (error) {
            console.error(error)

            res.status(500).json({ message: "Internal server error" })
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" })
    }
}
