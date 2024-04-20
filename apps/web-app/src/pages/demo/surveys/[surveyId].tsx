import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import fetch from "isomorphic-unfetch"
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"
import styles from "../../../styles/SurveyForm.module.css"
import { encodeResponses } from "../../../utils/responses"

interface Question {
    questionText: string
    options: string[]
}

interface Survey {
    title: string
    description: string
    questions: Question[]
}

const SurveyComponent: React.FC = () => {
    const router = useRouter()
    const { surveyId } = router.query
    const [identity, setIdentity] = useState<Identity | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [log, setLog] = useState<string | null>(null)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [group, setGroup] = useState<Group | null>(null)

    const [survey, setSurvey] = useState<Survey | null>(null)
    const [responses, setResponses] = useState<number[]>([])

    const defaultGroup = process.env.NEXT_PUBLIC_DEFAULT_GROUP || 100

    useEffect(() => {
        // Retrieve the identity from local storage
        const storedIdentityJSON = localStorage.getItem("identity")
        if (storedIdentityJSON) {
            setIdentity(new Identity(storedIdentityJSON))
        }
    }, [])

    useEffect(() => {
        const fetchSurveyDetails = async () => {
            if (!surveyId) return
            const surveyResponse = await fetch(`/api/surveys/${surveyId}`)
            const surveyData = await surveyResponse.json()

            // Fetch the IPFS data
            const ipfsId = surveyData[0].split("://")[1] || surveyData[0]
            const ipfsResponse = await fetch(`/api/ipfs/${ipfsId}`)
            const ipfsData: Survey = await ipfsResponse.json()

            setSurvey(ipfsData)
            setResponses(new Array(ipfsData.questions.length).fill(-1))
        }

        fetchSurveyDetails()
    }, [surveyId])

    const handleOptionChange = (questionIndex: number, optionIndex: number) => {
        const newResponses = [...responses]
        newResponses[questionIndex] = optionIndex
        setResponses(newResponses)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!identity) {
            alert("missing identity")
            return
        }

        setIsLoading(true)

        // get members
        const membersResponse = await fetch(`/api/groups/${defaultGroup}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (!membersResponse.ok) {
            setLog("Failed to get groups.")
            setIsLoading(false)
            return
        }
        const membersData = await membersResponse.json()
        // recreate the group
        let newGroup
        if (membersData) {
            newGroup = new Group(defaultGroup, 20, membersData)
            setGroup(newGroup)
        } else {
            setLog("Failed to get group members.")
            setIsLoading(false)
            return
        }

        const encodedResponses = encodeResponses(responses)

        // generate proofs
        let fullProof
        try {
            const surveyIdBigInt = BigInt(surveyId as string)
            fullProof = await generateProof(identity, newGroup, surveyIdBigInt, encodedResponses, {
                wasmFilePath: "/snark-artifacts/semaphore.wasm",
                zkeyFilePath: "/snark-artifacts/semaphore.zkey"
            })
        } catch (error) {
            if (error instanceof Error) {
                const errorMessage = (error as Error).message
                setLog(errorMessage)
            }
            setIsLoading(false)
            return
        }

        const payload = {
            surveyId,
            encodedResponses,
            merkleTreeRoot: fullProof.merkleTreeRoot,
            nullifierHash: fullProof.nullifierHash,
            proof: fullProof.proof,
            groupId: defaultGroup
        }

        const submitResponse = await fetch("/api/surveys", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
        if (!submitResponse.ok) {
            setLog("Failed to cast vote")
            setIsLoading(false)
            throw new Error(`HTTP error! status: ${submitResponse.status}`)
        }
        const submitData = await submitResponse.json()
        if (submitData.transactionHash) {
            const transactionLink = `https://sepolia.arbiscan.io/tx/${submitData.transactionHash}`
            setLog(
                `<span>Success! Click here to see your Transaction in blockchain explorer: </span> <a href="${transactionLink}" target="_blank" rel="noopener noreferrer"> ${transactionLink}</a>`
            )
            setIsLoading(false)
        }
    }

    if (!survey) return <div>Loading...</div>

    return (
        <div className="container mx-auto mt-8">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <form onSubmit={handleSubmit} className={styles.surveyContainer}>
                <h1 className={styles.title}>{survey.title}</h1>
                <p className={styles.description}>{survey.description}</p>
                {survey.questions.map((question, qIndex) => (
                    <div key={qIndex} className={styles.question}>
                        <h2 className={styles.questionText}>{question.questionText}</h2>
                        {question.options.map((option, oIndex) => (
                            <div key={oIndex} className={styles.radioContainer}>
                                <input
                                    type="radio"
                                    name={`question-${qIndex}`}
                                    id={`question-${qIndex}-option-${oIndex}`}
                                    value={oIndex}
                                    onChange={() => handleOptionChange(qIndex, oIndex)}
                                    checked={responses[qIndex] === oIndex}
                                    style={{ cursor: "pointer", marginRight: "10px" }} // Inline style for radio input
                                />
                                <label htmlFor={`question-${qIndex}-option-${oIndex}`} className={styles.optionLabel}>
                                    {option}
                                </label>
                            </div>
                        ))}
                    </div>
                ))}
                <button type="submit" className={styles.submitButton}>
                    Submit Survey
                </button>
            </form>
            {log && <div dangerouslySetInnerHTML={{ __html: log }} />}
        </div>
    )
}

export default SurveyComponent
