import React, { useState, useEffect } from "react"
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"

const IdentityComponent: React.FC = () => {
    const [identity, setIdentity] = useState<Identity | null>(null)
    const [seed, setSeed] = useState<string>("")
    const [log, setLog] = useState<string>("")
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [group, setGroup] = useState<Group | null>(null)

    useEffect(() => {
        // Retrieve the identity from local storage
        const storedIdentityJSON = localStorage.getItem("identity")
        if (storedIdentityJSON) {
            setIdentity(new Identity(storedIdentityJSON))
        }
    }, [])

    const createNewIdentity = () => {
        const newIdentity = new Identity()
        setIdentity(newIdentity)
        localStorage.setItem("identity", newIdentity.toString())
    }

    const createIdentityFromSeed = () => {
        const newIdentity = new Identity(seed)
        setIdentity(newIdentity)
        localStorage.setItem("identity", newIdentity.toString())
    }

    const clearIdentity = () => {
        localStorage.removeItem("identity")
        setIdentity(null)
    }

    const handleSeedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSeed(event.target.value)
    }

    const addCommitmentToGroup = async () => {
        if (!identity?.commitment) {
            console.error("No identity or commitment found")
            setLog("No identity or commitment found")
            return
        }

        setIsLoading(true)

        const payload = {
            commitment: identity.commitment.toString(),
            groupId: 100
        }

        setLog((prevLog) => `${prevLog}\n Sending to contract this: ${JSON.stringify(payload)}`)

        try {
            const response = await fetch("api/members", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()
            // setLog(`${log}\n${JSON.stringify(data)}`)
            const newLogEntry = data.transactionHash
                ? `<a href="https://mumbai.polygonscan.com/tx/${data.transactionHash}" target="_blank" rel="noopener noreferrer"> Click here to see your Transaction: ${data.transactionHash}</a>`
                : JSON.stringify(data)

            setLog((prevLog) => `${prevLog}\n${newLogEntry}`)
        } catch (error) {
            console.error("Error adding commitment to group:", error)
            setLog(`${log}\n Error adding commitment to group: ${error}`)
        }
        setIsLoading(false)
    }

    const castVote = async (vote: number) => {
        if (!identity) {
            setLog((prevLog) => `${prevLog}\n ERROR! Missing parameter`)
            return
        }

        setIsLoading(true)

        // get members
        setLog((prevLog) => `${prevLog}\n Trying to get the members (GET api/groups/100)...`)
        const response = await fetch("api/groups/100", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        if (!response.ok) {
            setLog((prevLog) => `${prevLog}\n ERROR! cannot get the members`)
            setIsLoading(false)
            return
        }
        const data = await response.json()
        setLog((prevLog) => `${prevLog}\n Ok! I got the members`)
        // recreate the group
        let newGroup
        if (data) {
            newGroup = new Group(100, 20, data)
            setGroup(newGroup)
        } else {
            setLog((prevLog) => `${prevLog}\n ERROR! creating the group`)
            setIsLoading(false)
            return
        }

        // generate proofs
        let fullProof
        try {
            fullProof = await generateProof(identity, newGroup, 1, vote)
        } catch (error) {
            if (error instanceof Error) {
                const errorMessage = (error as Error).message
                setLog((prevLog) => `${prevLog}\n ERROR! generating the proof: ${errorMessage}`)
            } else {
                // Handle non-Error types
                setLog((prevLog) => `${prevLog}\n ERROR! generating the proof: An unknown error occurred`)
            }
            setIsLoading(false)
            return
        }

        const payload = {
            vote,
            merkleTreeRoot: fullProof.merkleTreeRoot,
            nullifierHash: fullProof.nullifierHash,
            pollId: 1,
            proof: fullProof.proof,
            groupId: 100
        }

        setLog((prevLog) => `${prevLog}\n Sending to contract this: ${JSON.stringify(payload)}`)
        try {
            const voteResponse = await fetch("api/votes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${voteResponse.status}`)
            }

            const voteData = await voteResponse.json()
            // setLog(`${log}\n${JSON.stringify(data)}`)
            const newLogEntry = voteData.transactionHash
                ? `<a href="https://mumbai.polygonscan.com/tx/${voteData.transactionHash}" target="_blank" rel="noopener noreferrer"> Click here to see your Transaction: ${voteData.transactionHash}</a>`
                : JSON.stringify(voteData)

            setLog((prevLog) => `${prevLog}\n Your vote casted on blockchain! 🎉 See it here: ${newLogEntry}`)
        } catch (error) {
            setLog(`${log}\n Error casting vote: ${error}`)
        }

        setIsLoading(false)
    }

    return (
        <div className="container">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <h1>Identity Management</h1>
            <p className="explanation">
                {" "}
                Identities are triplets of keys called `Trapdoor`, `Nullifier` and `Commitment`. The first two should be
                kept private while commitment can be publicly shared. In this example, an identity can be generated,
                stored and retrieved from browsers storage{" "}
            </p>
            {identity ? (
                <div className="info">
                    <p className="success-message">Identity Loaded</p>
                    <p>
                        Trapdoor: <span className="value">{identity.trapdoor.toString()}</span>
                    </p>
                    <p>
                        Nullifier: <span className="value">{identity.nullifier.toString()}</span>
                    </p>
                    <p>
                        Commitment: <span className="value">{identity.commitment.toString()}</span>
                    </p>
                </div>
            ) : (
                <p className="no-identity">No identity found. Generate one and it will be stored in browser storage</p>
            )}
            <div className="actions">
                <button className="btn" onClick={createNewIdentity}>
                    Create New Identity
                </button>
                <div className="input-group">
                    <input
                        type="text"
                        className="input-field"
                        value={seed}
                        onChange={handleSeedChange}
                        placeholder="Enter secret seed"
                    />
                    <button className="btn" onClick={createIdentityFromSeed}>
                        Create Identity From Seed
                    </button>
                </div>
                <button className="btn clear-btn" onClick={clearIdentity}>
                    Clear Identity
                </button>
                <button className="btn" onClick={addCommitmentToGroup} disabled={isLoading}>
                    Add Commitment to Group 100
                </button>
                <br></br>
                <button className="btn-green" onClick={() => castVote(1)} disabled={isLoading}>
                    Vote YES on poll 1
                </button>
                <button className="btn-red" onClick={() => castVote(0)} disabled={isLoading}>
                    Vote NO on poll 1
                </button>
                {/* Log display */}
                <div className="log">
                    <h2>Log:</h2>
                    <div
                        className="log-textarea"
                        dangerouslySetInnerHTML={{ __html: log }}
                        style={{ whiteSpace: "pre-wrap" }} // To preserve line breaks and spaces
                    ></div>
                </div>
            </div>
        </div>
    )
}

export default IdentityComponent
