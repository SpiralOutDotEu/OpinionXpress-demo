"use client"

import { MainLayout } from "../../../layouts/mainLayout"
import useIdentity from "../../../hooks/useIdentity"

export default function Upload() {
    const { notification, resetIdentity } = useIdentity()

    return (
        <MainLayout>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                {/* UploadForm can be used here if needed */}
                <button className="mt-4 rounded bg-red-500 px-4 py-2 text-white" onClick={resetIdentity}>
                    Reset Identity
                </button>
            </div>
            {notification && (
                <div className="mb-4 p-4 text-sm text-white bg-blue-500 rounded-lg shadow-md">{notification}</div>
            )}
        </MainLayout>
    )
}
