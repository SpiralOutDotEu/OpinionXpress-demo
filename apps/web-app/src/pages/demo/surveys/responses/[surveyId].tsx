import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import styles from "../../../../styles/SurveyForm.module.css"

interface Question {
    questionText: string
    options: string[]
}

interface SurveyDetails {
    title: string
    description: string
    questions: Question[]
}

interface BigNumber {
    type: string
    hex: string
}

// Helper function to parse BigNumber
const parseBigNumber = (bn: BigNumber): number => parseInt(bn.hex, 16)

const SurveyResponsesComponent: React.FC = () => {
    const router = useRouter()
    const { surveyId } = router.query
    const [surveyDetails, setSurveyDetails] = useState<SurveyDetails | null>(null)
    const [responses, setResponses] = useState<number[][] | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchSurveyDetails = async () => {
            try {
                if (!surveyId) return
                // Fetch the survey details
                const surveyResponse = await fetch(`/api/surveys/responses/${surveyId}`)
                const responseData: (string | BigNumber | BigNumber[][])[] = await surveyResponse.json()

                // Parse the survey ID and responses
                const ipfsId = responseData[0] as string
                const ipfsResponse = await fetch(`/api/ipfs/${ipfsId.split("://")[1] || ipfsId}`)
                const ipfsData: SurveyDetails = await ipfsResponse.json()
                setSurveyDetails(ipfsData)

                // Parse the response counts
                const responseCounts: BigNumber[][] = responseData[3] as BigNumber[][]
                const parsedResponses = responseCounts.map((row) => row.map(parseBigNumber))
                setResponses(parsedResponses)
            } catch (error) {
                console.error("Failed to fetch survey data: ", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSurveyDetails()
    }, [surveyId])

    if (isLoading) return <div>Loading...</div>

    return (
        <div className="container mx-auto mt-8">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            {!isLoading && surveyDetails && (
                <div className={styles.surveyContainer}>
                    <h1 className={styles.superTitle}>Responses</h1>
                    <h1 className={styles.title}>{surveyDetails.title}</h1>
                    <p className={styles.description}>{surveyDetails.description}</p>
                    {surveyDetails.questions.map((question, questionIndex) => {
                        const maxResponses = responses ? Math.max(...responses[questionIndex]) : 0
                        return (
                            <div key={questionIndex} className={styles.card}>
                                <h2 className={styles.questionText}>{question.questionText}</h2>
                                <div className={styles.barChart}>
                                    {question.options.map((option, optionIndex) => {
                                        const responseCount = responses ? responses[questionIndex][optionIndex] : 0
                                        const widthPercent = maxResponses > 0 ? (responseCount / maxResponses) * 100 : 0
                                        return (
                                            <div key={optionIndex} className={styles.optionContainer}>
                                                <span className={styles.optionText}>{option}</span>
                                                <div className={styles.barContainer}>
                                                    <div className={styles.bar}>
                                                        <div
                                                            className={styles.barFill}
                                                            style={{ width: `${widthPercent}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={styles.responseCount}>{responseCount}</span>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default SurveyResponsesComponent
