"use client"

import NotificationBar from "../../../components/NotificationBar"
import useIdentity from "../../../hooks/useIdentity"

export default function Upload() {
    const { isLoading, notification, resetIdentity } = useIdentity()

    return (
        <>
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <div className="flex flex-1 flex-col justify-center px-6 pt-8 lg:px-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">Discover OpinionTrust Beta</h1>
                <p className="text-lg text-gray-600 mb-4">
                    You've accessed an exclusive link for early testing of OpinionTrust. Here, you can influence
                    decisions with your feedback while staying anonymous.
                </p>
                <p className="text-lg text-gray-600 mb-4">
                    A unique identity is created for you, kept private in your browser. With it, you can participate in
                    votes, petitions, and surveys. This identity is yours to control - reset it anytime.
                </p>
                <p className="text-lg text-gray-600 mb-4">
                    Our 'zero knowledge' encryption ensures your anonymity is never compromised, and blockchain
                    technology transparently records your input.
                </p>
                <p className="text-lg text-green-600 font-semibold mb-4">
                    No crypto wallet or tokens needed! Engage with blockchain seamlessly - everything is managed in our
                    unique process.
                </p>
                <button
                    className="m-6 rounded bg-red-500 px-6 py-3 text-xl font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={resetIdentity}
                >
                    Reset My Identity
                </button>
            </div>
            {notification && <NotificationBar message={notification} />}
        </>
    )
}
