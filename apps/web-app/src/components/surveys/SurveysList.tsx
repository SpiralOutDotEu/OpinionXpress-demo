import React, { useEffect, useState } from "react"
import SurveyCard from "./SurveyCard"
import listStyles from "../../styles/SurveysList.module.css"

interface SurveySummary {
    surveyId: string
    ipfsLink: string
    questionsCount: string
    optionsPerQuestion: string
}

const SurveysList: React.FC = () => {
    const [surveys, setSurveys] = useState<SurveySummary[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    useEffect(() => {
        const fetchSurveys = async () => {
            setIsLoading(true)
            const response = await fetch("/api/surveys")
            const data: SurveySummary[] = await response.json()
            setSurveys(data)
            setIsLoading(false)
        }
        fetchSurveys()
    }, [])

    return (
        <div className={listStyles.listContainer}>
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}{" "}
            {surveys.map((survey) => (
                <SurveyCard key={survey.surveyId} {...survey} />
            ))}
        </div>
    )
}

export default SurveysList
