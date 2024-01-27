'use client';

import { useSession } from 'next-auth/react';
import { Identity } from "@semaphore-protocol/identity"
import { useEffect, useState } from 'react';
import { MainLayout } from '../../../layouts/mainLayout';
import UploadForm from '../../../components/UploadForm';

export default function Upload() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [identity, setIdentity] = useState<Identity | null>(null)

    const createMember = async (commitment: string) => {
        fetch("/api/members", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
               commitment,
               groupId: 100
           })
       }).then((res) => {console.log(res)})
   }

    useEffect(() => {
        // Retrieve the identity from local storage
        const storedIdentityJSON = localStorage.getItem("identity")
        if (storedIdentityJSON) {
            setIdentity(new Identity(storedIdentityJSON))
        } else {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            const ident = createNewIdentity()
            if (ident) {
                createMember(ident.commitment.toString())
            }
        }
    }, [])
    
    const createNewIdentity = () => {
        const newIdentity = new Identity()
        setIdentity(newIdentity)
        localStorage.setItem("identity", newIdentity.toString())
        return newIdentity;
    }
    
    const session = useSession({
        required: true,
    });

    if (session.status === "loading") {
        return "Loading or not authenticated..."
    }

    return (
        <MainLayout>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                Upload {session?.data?.user?.email}
                <UploadForm/>
            </div>
        </MainLayout>
    );
}

Upload.requireAuth = true