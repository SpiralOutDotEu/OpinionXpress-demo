import "../styles/globals.css"
import '../styles/custom.css';
import type { AppProps } from "next/app"
import { useEffect, useState } from "react"
import LogsContext from "../context/LogsContext"
import SemaphoreContext from "../context/SemaphoreContext"
import useSemaphore from "../hooks/useSemaphore"

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    const semaphore = useSemaphore()
    const [_logs, setLogs] = useState<string>("")

    useEffect(() => {
        semaphore.refreshUsers()
        semaphore.refreshFeedback()
    }, [])

    return (
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
    )
}
