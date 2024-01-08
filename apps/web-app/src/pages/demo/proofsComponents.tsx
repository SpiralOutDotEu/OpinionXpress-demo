import React, { useState } from "react"
import { Group } from "@semaphore-protocol/group"
// import { SemaphoreSubgraph } from "@semaphore-protocol/data";
import { SemaphoreEthers } from "@semaphore-protocol/data"
import getNextConfig from "next/config"
import { SEMAPHORE_ADDRESS_MUMBAI } from "../../../constants"

const { publicRuntimeConfig: env } = getNextConfig()

const ProofsComponent = () => {
    const [groupId, setGroupId] = useState("")
    const [group, setGroup] = useState<Group | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

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
        </div>
    )
}

export default ProofsComponent
