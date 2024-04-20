import "../styles/globals.css"
import "../styles/custom.css"
import type { AppProps } from "next/app"

import Header from "../components/Header"
import BetaBanner from "../components/BetaBanner"

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
    return (
        <>
            <BetaBanner />
            <Header />
            <Component {...pageProps} />
        </>
    )
}
