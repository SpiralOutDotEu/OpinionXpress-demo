import React, { useState } from "react"
import { Group } from "@semaphore-protocol/group"
import { SemaphoreEthers } from "@semaphore-protocol/data"
import { Identity } from "@semaphore-protocol/identity"
import { generateProof } from "@semaphore-protocol/proof"
import getNextConfig from "next/config"
import { BytesLike } from "ethers"
import { SEMAPHORE_ADDRESS_MUMBAI } from "../../../constants"

const { publicRuntimeConfig: env } = getNextConfig()

const ProofsComponent = () => {
    const [groupId, setGroupId] = useState("")
    const [group, setGroup] = useState<Group | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [signal, setSignal] = useState<BytesLike| number | bigint | string>(0)
    const [externalNullifier, setExternalNullifier] = useState<number | bigint | string>(0)
    const [trapdoor, setTrapdoor] = useState("")
    const [nullifier, setNullifier] = useState("")
    const [commitment, setCommitment] = useState("")
    const [proofResult, setProofResult] = useState("")

    const fetchGroupData = async () => {
        setLoading(true)
        setError(null)

        try {
            // const semaphoreSubgraph = new SemaphoreSubgraph(REQUIRED_NETWORK);
            // const groupData = await semaphoreSubgraph.getGroup(groupId, { members: true });
            const semaphoreEthers = new SemaphoreEthers(env.NETWORK_RPC, {
                address: SEMAPHORE_ADDRESS_MUMBAI,
                startBlock: 44511794
            })
            // const groupData = await semaphoreEthers.getGroup(groupId, { members: true });
            const members = await semaphoreEthers.getGroupMembers(groupId)

            if (members) {
                const newGroup = new Group(groupId, 20, members)
                setGroup(newGroup)
            } else {
                setError("Group not found")
            }
        } catch (err) {
            setError("An error occurred while fetching the group data.")
            console.error(err)
        }

        setLoading(false)
    }

    const handleSubmit = (e: { preventDefault: () => void }) => {
        e.preventDefault()
        fetchGroupData()
    }

    const generateProofHandler = async () => {
        if (!group || !trapdoor || !nullifier || !commitment || !externalNullifier || !signal) {
            setError("Missing group data or identity details.")
            return
        }

        try {
            const identityJson = JSON.stringify([trapdoor, nullifier, commitment])
            const identity = new Identity(identityJson)
            const fullProof = await generateProof(identity, group, externalNullifier, signal)
            setProofResult(JSON.stringify(fullProof))
        } catch (err) {
            setError("Failed to generate proof.")
            console.error(err)
        }
    }

        return (
        <div className="container">
            <h1>Proofs</h1>
            <div className="info-box">
                <form onSubmit={handleSubmit} className="input-group">
                    <input
                        type="text"
                        className="input-field"
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        placeholder="Enter Group ID"
                    />
                    <button type="submit" className="btn">
                        Retrieve Group
                    </button>
                </form>
            </div>
            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            {group && (
                <div className="info">
                    <p>Group ID: {group.id.toString()}</p>
                    <p>Group root: {group.root.toString()}</p>
                    <p>Group depth: {group.depth.toString()}</p>
                    <div className="info">
                        <p>Group members: </p>
                        <ul>
                            {group.members.map((member, index) => (
                                <li key={index}>Index = {group.indexOf(member)} , commitment = {member.toString()} </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {/* Group and identity details input fields */}
            <div className="info">
                <p>
                    Trapdoor:{" "}
                    <input
                        className="input-field"
                        type="text"
                        value={trapdoor}
                        onChange={(e) => setTrapdoor(e.target.value.toString())}
                    />
                </p>
                <p>
                    Nullifier:{" "}
                    <input
                        className="input-field"
                        type="text"
                        value={nullifier}
                        onChange={(e) => setNullifier(e.target.value.toString())}
                    />
                </p>
                <p>
                    Commitment:{" "}
                    <input
                        className="input-field"
                        type="text"
                        value={commitment}
                        onChange={(e) => setCommitment(e.target.value.toString())}
                    />
                </p>
                <p>
                    Signal:{" "}
                    <input
                        className="input-field"
                        type="text"
                        value={signal.toString()}
                        onChange={(e) => setSignal(e.target.value.toString())}
                        placeholder="Signal"
                    />
                </p>
                <p>
                    External Nullifier:{" "}
                    <input
                        className="input-field"
                        type="text"
                        value={externalNullifier.toString()}
                        onChange={(e) => setExternalNullifier(e.target.value.toString())}
                        placeholder="Signal"
                    />
                </p>
                <button className="btn" onClick={generateProofHandler}>
                    Generate Proof
                </button>
            </div>
            {proofResult && (
                <div className="success-message">
                    <p>Generated Proof:</p>
                    <pre className="success-message">{JSON.stringify(JSON.parse(proofResult), null, 2)}</pre>
                </div>
            )}
        </div>
    )
}

export default ProofsComponent
