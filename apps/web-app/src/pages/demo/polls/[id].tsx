import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"
import styles from "../../../styles/Poll.module.css"
import Modal from "../../../components/Modal"

const ListDetail = () => {
    const router = useRouter()
    const [identity, setIdentity] = useState<Identity | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [group, setGroup] = useState<Group | null>(null)
    const [log, setLog] = useState<string | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [status, setStatus] = useState<"success" | "error">("success")
    const [text, setText] = useState("")

    const setModal = (modalStatus: "success" | "error", message: string) => {
        setLog(message)
        setStatus(modalStatus)
        setModalOpen(true)
        setIsLoading(false)
    }

    const defaultGroup = process.env.NEXT_PUBLIC_DEFAULT_GROUP || 100

    const { id: pollId } = router.query

    useEffect(() => {
        // Retrieve the identity from local storage
        const storedIdentityJSON = localStorage.getItem("identity")
        if (storedIdentityJSON) {
            setIdentity(new Identity(storedIdentityJSON))
        }
    }, [])

    useEffect(() => {
        async function fetchPollData() {
            try {
                if (!pollId) return
                setIsLoading(true)
                const response = await fetch(`/api/polls/${pollId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

                if (!response.ok) {
                    throw new Error("Failed to get poll")
                }

                const data = await response.json()
                setText(data.text)
                setIsLoading(false)
            } catch (error) {
                if (error instanceof Error) setModal("error", error.message)
                else setModal("error", `Unknown error on fetching poll ${pollId}`)
                setIsLoading(false)
            }
        }

        fetchPollData()
    }, [pollId])

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
            setModal("error", "Failed to get groups")
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
            const pollIdBigInt = BigInt(pollId as string)
            fullProof = await generateProof(identity, newGroup, pollIdBigInt, vote, {
                wasmFilePath: "/snark-artifacts/semaphore.wasm",
                zkeyFilePath: "/snark-artifacts/semaphore.zkey"
            })
        } catch (error) {
            if (error instanceof Error) {
                const errorMessage = (error as Error).message
                setModal("error", errorMessage)
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

            if (!voteResponse.ok) {
                setLog("Failed to cast vote")
                const errorMessage = await voteResponse.json()
                setModal("error", JSON.stringify(errorMessage))
                return null
            }

            const voteData = await voteResponse.json()
            if (voteData.transactionHash) {
                setModal("success", `tx=${voteData.transactionHash} `)
            } else throw Error(voteData.message)
        } catch (error) {
            if (error instanceof Error) {
                const errorMessage = (error as Error).message
                setModal("error", errorMessage)
            } else {
                setModal("error", "Error on casting vote")
            }
        }
        setIsLoading(false)
        return null
    }

    return (
        <div className={styles.container}>
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <div className={styles.header}>
                <h1 className={styles.title}>Poll - {pollId}</h1>
                <h2 className={styles.subtitle}>{text}</h2>
            </div>
            <button className={`${styles.btn} ${styles.btnGreen}`} onClick={() => castVote(1)} disabled={isLoading}>
                Vote YES on poll {pollId}
            </button>
            <button className={`${styles.btn} ${styles.btnRed}`} onClick={() => castVote(0)} disabled={isLoading}>
                Vote NO on poll {pollId}
            </button>
            <Modal text={log as string} isOpen={modalOpen} status={status} onClose={() => setModalOpen(false)} />
        </div>
    )
}

export default ListDetail
