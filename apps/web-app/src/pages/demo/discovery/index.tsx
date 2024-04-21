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
                    You've accessed an exclusive link for early testing of OpinionTrust. Here, you can influence
                    decisions with your feedback while staying anonymous.
                </p>
                <p className={styles.description}>
                    A unique identity is created for you, kept private in your browser. With it, you can participate in
                    votes, petitions, and surveys. This identity is yours to control - reset it anytime.
                </p>
                <p className={styles.description}>
                    Our 'zero knowledge' encryption ensures your anonymity is never compromised, and blockchain
                    technology transparently records your input.
                </p>
                <p className={styles.specialNote}>
                    No crypto wallet or tokens needed! Engage with blockchain seamlessly - everything is managed in our
                    unique process.
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
