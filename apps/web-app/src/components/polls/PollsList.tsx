import React, { useEffect, useState } from "react"
import PollCard from "./PollCard"
import styles from "../../styles/PollsList.module.css"

interface PollSummary {
    pollId: string
    text: string
}

const PollsList: React.FC = () => {
    const [polls, setPolls] = useState<PollSummary[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchPolls = async () => {
            const response = await fetch("/api/polls")
            const data: PollSummary[] = await response.json()
            setPolls(data)
            setIsLoading(false)
        }
        fetchPolls()
    }, [])

    return (
        <div className={styles.listContainer}>
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            {polls.map((poll) => (
                <PollCard key={poll.pollId} {...poll} />
            ))}
        </div>
    )
}

export default PollsList
