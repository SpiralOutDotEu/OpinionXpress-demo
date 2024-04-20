import { useState, useEffect } from "react"
import { Identity } from "@semaphore-protocol/identity"

const useIdentity = () => {
    const [identity, setIdentity] = useState<Identity | null>(null)
    const [notification, setNotification] = useState("")

    const createMember = async (commitment: string) => {
        const response = await fetch("/api/members", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                commitment,
                groupId: process.env.NEXT_PUBLIC_DEFAULT_GROUP
            })
        })
        if (response.ok) {
            setNotification("User identity created and member added.")
        } else {
            const errorText = await response.text()
            setNotification(`Failed to add member: ${errorText}`)
        }
    }

    const createNewIdentity = async () => {
        const newIdentity = new Identity()
        setIdentity(newIdentity)
        localStorage.setItem("identity", newIdentity.toString())
        await createMember(newIdentity.commitment.toString())
        return newIdentity
    }

    const resetIdentity = async () => {
        localStorage.removeItem("identity")
        setIdentity(null)
        await createNewIdentity()
        setNotification("Identity has been reset.")
    }

    // TODO: Workaround only for DEMO
    const loadIdentity = async () => {
        const storedIdentityJSON = localStorage.getItem("identity")
        if (storedIdentityJSON) {
            setIdentity(new Identity(storedIdentityJSON))
            setNotification("User identity loaded.")
        } else {
            await createNewIdentity()
        }
    }

    useEffect(() => {
        loadIdentity()
    }, [])

    return {
        identity,
        notification,
        resetIdentity,
        createNewIdentity
    }
}

export default useIdentity
