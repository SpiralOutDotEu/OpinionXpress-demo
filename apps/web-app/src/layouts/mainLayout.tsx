import Head from "next/head"
import { useRouter } from "next/router"
import { useState } from "react"
import { Inter } from "@next/font/google"

const inter = Inter({ subsets: ["latin"] })

interface Props {
    children: React.ReactNode;
}

export const MainLayout: React.FC<Props> = ({
    children,
}: Props) => {
    const router = useRouter()
    const [_logs] = useState<string>("")

    return (
        <div className={inter.className}>
            <Head>
                <title>Semaphore template</title>
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#ebedff" />
            </Head>

            <div>
                <div className="container">
                    <div id="body">
                        {children}
                    </div>
                </div>

                <div className="footer">
                    {_logs.endsWith("...")}
                    <p>{_logs || `Current step: ${router.route}`}</p>
                </div>
            </div>
        </div>
    );
};

export default MainLayout;