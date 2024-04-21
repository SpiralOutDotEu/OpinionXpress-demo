import type { NextApiRequest, NextApiResponse } from "next"
import { getSurveyResponses } from "../../../../services/contractService"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            const { surveyId } = req.query
            // Call the service function to fetch GroupCreated events

            const surveyResponses = await getSurveyResponses(surveyId as string)

            // Return the file with a 200 status code
            res.status(200).json(surveyResponses)
        } catch (error) {
            console.error(error)

            // Handle errors appropriately
            res.status(500).json({ message: "Internal server error" })
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" })
    }
}
