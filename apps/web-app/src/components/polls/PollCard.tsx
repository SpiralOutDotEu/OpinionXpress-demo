import React from "react"
import Link from "next/link"
import styles from "../../styles/PollCard.module.css"

interface PollCardProps {
    pollId: string
    text: string
}

const PollCard: React.FC<PollCardProps> = ({ pollId, text }) => (
    <div className={styles.card}>
        <div className={styles.cardContent}>
            <h2 className={styles.title}>{text}</h2>
        </div>
        <div className={styles.actions}>
            <Link className={styles.submitButton} href={`/demo/polls/${pollId}`}>
                Vote
            </Link>
            <Link className={styles.viewButton} href={`/demo/polls/results/${pollId}`}>
                View Results
            </Link>
        </div>
    </div>
)

export default PollCard
