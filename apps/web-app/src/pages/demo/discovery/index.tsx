"use client"

import Link from "next/link"
import NotificationBar from "../../../components/NotificationBar"
import useIdentity from "../../../hooks/useIdentity"
import styles from "../../../styles/DiscoverySection.module.css"

export default function Discovery() {
    const { isLoading, notification, resetIdentity } = useIdentity()

    return (
        <>
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <div className={styles.discoverySection}>
                <h1 className={styles.title}>Discover OpinionTrust Beta</h1>
                <p className={styles.description}>
                    Welcome to the exclusive early access of OpinionTrust. During this beta phase, your feedback
                    directly shapes the decisions of tomorrow while maintaining complete anonymity.
                </p>
                <p className={styles.description}>
                    In this demo, you are provided with a temporary digital identity stored privately in your browser,
                    allowing you to participate in votes, petitions, and surveys. This identity is fully under your
                    control and can be reset at any moment.
                </p>
                <p className={styles.description}>
                    Please note: This process is designed solely for demonstration purposes. When OpinionTrust
                    transitions to the mainnet, securing an identity will require a formal KYC verification to ensure
                    each identity corresponds to a unique, verified citizen.
                </p>
                <p className={styles.description}>
                    Leveraging 'zero knowledge' encryption, we guarantee that your anonymity remains intact.
                    Simultaneously, blockchain technology provides a transparent, immutable record of your
                    contributions.
                </p>
                <p className={styles.specialNote}>
                    No crypto wallet or tokens are required for this demo. Experience the power of blockchain without
                    complexity—every aspect is streamlined via our unique platform.
                </p>
                <div className={styles.linksContainer}>
                    <p className={styles.linkDescription}>Start making an impact now:</p>
                    <div className={styles.links}>
                        <Link className={styles.linkButton} href="/demo/polls">
                            Participate in Polls
                        </Link>
                        <Link className={styles.linkButton} href="/demo/surveys">
                            Engage in Surveys
                        </Link>
                    </div>
                </div>
                <button className={styles.resetButton} onClick={resetIdentity}>
                    Reset My Identity
                </button>
            </div>
            {notification && <NotificationBar message={notification} />}
        </>
    )
}
