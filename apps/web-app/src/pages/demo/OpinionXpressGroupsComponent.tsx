import React, { useState, useEffect } from "react"
import { ethers } from "ethers"
import { OPINIONXPRESS_ADDRESS, REQUIRED_NETWORK_ID } from "../../../constants"
import OpinionXpressAbi from "./OpinionXpress.json"

const OpinionXpressGroupsComponent = () => {
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null)
    const [groupId, setGroupId] = useState<string>("")
    const [membersGroupId, setMembersGroupId] = useState<string>("")
    const [commitment, setCommitment] = useState<string>("")
    const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(false)
    const groupDepth = 20

    const checkNetwork = async () => {
        const network = await provider?.getNetwork()
        setIsCorrectNetwork(network?.chainId === REQUIRED_NETWORK_ID)
    }

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                await (window as any).ethereum?.request({ method: "eth_requestAccounts" })
                const newProvider = new ethers.providers.Web3Provider(window.ethereum)
                setProvider(newProvider)
                checkNetwork()
            } catch (error) {
                console.error(error)
                alert("Failed to connect wallet")
            }
        } else {
            alert("MetaMask is not installed. Please install it to use this feature.")
        }
    }

    useEffect(() => {
        if (window.ethereum) {
            const newProvider = new ethers.providers.Web3Provider(window.ethereum)
            setProvider(newProvider)
            checkNetwork()
        }
    }, [])

    const createGroup = async () => {
        if (!provider || !isCorrectNetwork) return

        const contract = new ethers.Contract(OPINIONXPRESS_ADDRESS, OpinionXpressAbi.abi, provider.getSigner())
        try {
            const tx = await contract.createGroup(parseInt(groupId, 10), groupDepth, { gasLimit: 5000000 })
            const receipt = await tx.wait()
            alert(
                `Group created successfully! View on Mumbai Scan: https://mumbai.polygonscan.com/tx/${receipt.transactionHash}`
            )
        } catch (error: any) {
            alert(`Failed to create group: ${error.message}`)
        }
    }

    const addMember = async () => {
        if (!provider || !isCorrectNetwork) return

        const contract = new ethers.Contract(OPINIONXPRESS_ADDRESS, OpinionXpressAbi.abi, provider.getSigner())
        try {
            const tx = await contract.addMember(parseInt(membersGroupId, 10), BigInt(commitment), { gasLimit: 5000000 })
            const receipt = await tx.wait() // Wait for the transaction to be mined
            alert(
                `Transaction successful! View on Mumbai Scan: https://mumbai.polygonscan.com/tx/${receipt.transactionHash}`
            )
        } catch (error: any) {
            alert(`Transaction failed: ${error.message}`)
        }
    }

    return (
        <div className="container">
            <h1>Group Management</h1>
            <button className="btn" onClick={connectWallet}>
                Connect to Wallet
            </button>
            {isCorrectNetwork ? (
                <p className="success-message">Correct network.</p>
            ) : (
                <p className="error-message">Please connect to the correct network.</p>
            )}

            <div className="info-box">
                <div className="input-group">
                    <input
                        type="text"
                        className="input-field"
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        placeholder="Group ID"
                    />
                    <button className="btn" onClick={createGroup}>
                        Create Group
                    </button>
                </div>
            </div>

            <div className="info-box">
                <div className="input-group">
                    <input
                        type="text"
                        className="input-field"
                        value={membersGroupId}
                        onChange={(e) => setMembersGroupId(e.target.value)}
                        placeholder="Group ID to Add Member"
                    />
                    <input
                        type="text"
                        className="input-field"
                        value={commitment}
                        onChange={(e) => setCommitment(e.target.value)}
                        placeholder="Commitment"
                    />
                    <button className="btn" onClick={addMember}>
                        Add Member
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OpinionXpressGroupsComponent
