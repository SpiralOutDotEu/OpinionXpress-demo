// pages/list/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { generateProof } from '@semaphore-protocol/proof';
import CenteredForm from '../../components/CenteredForm';

const ListDetail = () => {
  const router = useRouter();
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [group, setGroup] = useState<Group | null>(null)

  const { id: pollId } = router.query;

  useEffect(() => {
    // Retrieve the identity from local storage
    const storedIdentityJSON = localStorage.getItem("identity")
    if (storedIdentityJSON) {
        setIdentity(new Identity(storedIdentityJSON))
    }
}, [])

  const castVote = async (vote: number) => {
    if (!identity) {
        return null
    }

    setIsLoading(true)

    // get members
    const response = await fetch("/api/groups/100", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    })
    if (!response.ok) {
        setIsLoading(false)
        return null
    }
    const data = await response.json()

    // recreate the group
    let newGroup
    if (data) {
        newGroup = new Group(100, 20, data)
        setGroup(newGroup)
    } else {
        setIsLoading(false)
        return null
    }

    // generate proofs
    let fullProof
    try {
        fullProof = await generateProof(identity, newGroup, 1, vote)
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
        groupId: 100
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
            throw new Error(`HTTP error! status: ${voteResponse.status}`)
        }

        const voteData = await voteResponse.json()

        const newLogEntry = voteData.transactionHash
            ? `<a href="https://mumbai.polygonscan.com/tx/${voteData.transactionHash}" target="_blank" rel="noopener noreferrer"> Click here to see your Transaction: ${voteData.transactionHash}</a>`
            : JSON.stringify(voteData)

      console.log(newLogEntry)

    } catch (error) {
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
      <h1 className="text-3xl font-bold text-center">Poll - {pollId}</h1>
      {/* <CenteredForm /> */}
      <button className="btn-green" onClick={() => castVote(1)} disabled={isLoading}>
        Vote YES on poll {pollId}
    </button>
    <button className="btn-red" onClick={() => castVote(0)} disabled={isLoading}>
        Vote NO on poll {pollId}
    </button>
    </div>
  );
};

export default ListDetail;
