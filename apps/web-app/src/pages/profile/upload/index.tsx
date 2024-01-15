'use client';
import { useSession } from 'next-auth/react';
import { MainLayout } from '../../../layouts/mainLayout';

export default function Upload() {
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
            </div>
        </MainLayout>
    );
}

Upload.requireAuth = true