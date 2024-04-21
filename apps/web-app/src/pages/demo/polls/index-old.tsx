import React, { useEffect, useState } from "react"
import LinksList from "../../../components/PollList"

export interface Poll {
    pollId: number
    text: string
}

export default function Polls() {
    const [polls, setPolls] = useState<Poll[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const getPolls = async () => {
        setIsLoading(true)
        try {
            fetch("/api/polls", {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            })
                .then((resp) => resp.json())
                .then((response) => {
                    console.info("fetch()", response)
                    setPolls(response)
                    setIsLoading(false)
                })
        } catch (error) {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (polls.length === 0) {
            getPolls()
        }
    }, [])

    return (
        <div>
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <h1 className="text-3xl font-bold text-center mt-8">Polls</h1>
            <LinksList items={polls} />
        </div>
    )
}
