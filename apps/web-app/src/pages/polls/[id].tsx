// pages/list/[id].js
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"

const ListDetail = () => {
    const router = useRouter()
    const [identity, setIdentity] = useState<Identity | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [group, setGroup] = useState<Group | null>(null)
    const [log, setLog] = useState<string | null>(null)
    
    const defaultGroup = process.env.NEXT_PUBLIC_DEFAULT_GROUP || 100

    const { id: pollId, text } = router.query

    useEffect(() => {
        // Retrieve the identity from local storage
        const storedIdentityJSON = localStorage.getItem("identity")
        if (storedIdentityJSON) {
            setIdentity(new Identity(storedIdentityJSON))
        }
    }, [])

    const castVote = async (vote: number) => {
        if (!identity) {
            setLog("Identity is required to cast a vote.")
            return null
        }

        setIsLoading(true)

        // get members
        const response = await fetch(`/api/groups/${defaultGroup}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (!response.ok) {
            setLog("Failed to get groups.")
            setIsLoading(false)
            return null
        }
        const data = await response.json()
        // recreate the group
        let newGroup
        if (data) {
            newGroup = new Group(defaultGroup, 20, data)
            setGroup(newGroup)
        } else {
            setIsLoading(false)
            return null
        }
        // generate proofs
        let fullProof
        try {
            const pollIdBigInt = BigInt(pollId as string);
            fullProof = await generateProof(identity, newGroup, pollIdBigInt, vote)
        } catch (error) {
            if (error instanceof Error) {
                const errorMessage = (error as Error).message
                console.log(errorMessage)
            }
            setIsLoading(false)
            return null
        }

        const payload = {
            vote,
            merkleTreeRoot: fullProof.merkleTreeRoot,
            nullifierHash: fullProof.nullifierHash,
            pollId,
            proof: fullProof.proof,
            groupId: defaultGroup
        }

        try {
            const voteResponse = await fetch("/api/votes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                setLog("Failed to cast vote")
                throw new Error(`HTTP error! status: ${voteResponse.status}`)
            }

            const voteData = await voteResponse.json()
            if(voteData.transactionHash){
            const transactionLink = `https://sepolia.arbiscan.io/tx/${voteData.transactionHash}`
            setLog(
                `<span>Success! Click here to see your Transaction in blockchain explorer: </span> <a href="${transactionLink}" target="_blank" rel="noopener noreferrer"> ${transactionLink}</a>`
            )
            }
            else throw Error(voteData.message)
        } catch (error) {
            if (error instanceof Error) setLog(`Failed to cast vote: ${error.message}`)
            console.log(error)
        }

        setIsLoading(false)
        return null
    }

    return (
        <div className="container mx-auto mt-8">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <div className="flex flex-col items-center">
                <h1 className="text-3xl font-bold">Poll - {pollId}</h1>
                <br />
                <h2 className="text-2xl font-bold">{text}</h2>
            </div>
            {/* <CenteredForm /> */}
            <button className="btn-green" onClick={() => castVote(1)} disabled={isLoading}>
                Vote YES on poll {pollId}
            </button>
            <button className="btn-red" onClick={() => castVote(0)} disabled={isLoading}>
                Vote NO on poll {pollId}
            </button>
            {log && <div dangerouslySetInnerHTML={{ __html: log }} />}
        </div>
    )
}

export default ListDetail
