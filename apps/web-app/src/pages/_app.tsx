import "../styles/globals.css"
import '../styles/custom.css';
import type { AppProps } from "next/app"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"
import useSemaphore from "../hooks/useSemaphore"
import { Inter } from "@next/font/google"
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] })

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    const router = useRouter()
    const semaphore = useSemaphore()
    const [_logs, setLogs] = useState<string>("")

    useEffect(() => {
        semaphore.refreshUsers()
        semaphore.refreshFeedback()
    }, [])

    return (
        <SessionProvider session={session}>
            <SemaphoreContext.Provider value={semaphore}>
                <LogsContext.Provider
                    value={{
                        _logs,
                        setLogs
                    }}
                >
                    <Component {...pageProps} />
                </LogsContext.Provider>
            </SemaphoreContext.Provider>
        </SessionProvider>
    )
}
