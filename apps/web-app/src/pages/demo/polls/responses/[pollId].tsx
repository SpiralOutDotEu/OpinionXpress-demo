import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import styles from "../../../../styles/SurveyForm.module.css"

interface PollResponse {
    state: number
    yesCounter: number
    noCounter: number
    text: string
}

const PollResponsesComponent: React.FC = () => {
    const router = useRouter()
    const { pollId } = router.query
    const [pollResponse, setPollResponse] = useState<PollResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPollResponses = async () => {
            try {
                if (!pollId) return
                const response = await fetch(`/api/polls/${pollId}`)
                if (!response.ok) {
                    throw new Error("Failed to fetch poll responses")
                }
                const data: PollResponse = await response.json()
                setPollResponse(data)
            } catch (error) {
                console.error("Failed to fetch poll responses: ", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPollResponses()
    }, [pollId])

    if (isLoading) return <div>Loading...</div>

    const totalVotes = pollResponse ? pollResponse.yesCounter + pollResponse.noCounter : 0
    const yesPercentage = totalVotes > 0 ? ((pollResponse?.yesCounter || 0) / totalVotes) * 100 : 0
    const noPercentage = totalVotes > 0 ? ((pollResponse?.noCounter || 0) / totalVotes) * 100 : 0

    return (
        <div className={styles.surveyContainer}>
            <h1 className={styles.title}>Poll Results - {pollId}</h1>
            <p className={styles.description}>{pollResponse?.text}</p>

            <div className={styles.questionText}>Votes YES</div>
            <div className={styles.barContainer}>
                <div className={styles.bar}>
                    <div className={styles.barFill} style={{ width: `${yesPercentage}%` }}></div>
                </div>
                <span className={styles.responseCount}>{pollResponse?.yesCounter}</span>
            </div>

            <div className={styles.questionText}>Votes NO</div>
            <div className={styles.barContainer}>
                <div className={styles.bar}>
                    <div
                        className={styles.barFill}
                        style={{ width: `${noPercentage}%`, backgroundColor: "red" }} // You can adjust the color if needed
                    ></div>
                </div>
                <span className={styles.responseCount}>{pollResponse?.noCounter}</span>
            </div>
        </div>
    )
}

export default PollResponsesComponent
