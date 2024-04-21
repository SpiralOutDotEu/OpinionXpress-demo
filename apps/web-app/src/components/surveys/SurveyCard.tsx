import React, { useEffect, useState } from "react"
import Link from "next/link"
import styles from "../../styles/SurveyCard.module.css"

interface SurveyCardProps {
    surveyId: string
    ipfsLink: string
}

const SurveyCard: React.FC<SurveyCardProps> = ({ surveyId, ipfsLink }) => {
    const [title, setTitle] = useState<string>("")
    const [description, setDescription] = useState<string>("")

    useEffect(() => {
        const fetchSurveyDetails = async () => {
            const response = await fetch(`/api/ipfs/${ipfsLink}`)
            const surveyData = await response.json()
            setTitle(surveyData.title)
            setDescription(surveyData.description)
        }

        fetchSurveyDetails()
    }, [ipfsLink])

    return (
        <div className={styles.card}>
            <div className={styles.cardContent}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.description}>{description}</p>
            </div>
            <div className={styles.actions}>
                <Link className={styles.submitButton} href={`/demo/surveys/${surveyId}`}>
                    Submit Response
                </Link>
                <Link className={styles.viewButton} href={`/demo/surveys/responses/${surveyId}`}>
                    View Responses
                </Link>
            </div>
        </div>
    )
}

export default SurveyCard
