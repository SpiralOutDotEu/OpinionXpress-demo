import React from "react"
import { FaTools } from "react-icons/fa"
import Link from "next/link"
import styles from "../styles/UnderConstruction.module.css"

const UnderConstruction: React.FC = () => (
    <div className={styles.hero}>
        <FaTools className={styles.workingIcon} />
        <h1 className={styles.title}>We're Building Something Great!</h1>
        <p className={styles.description}>
            Our website is currently under construction, but we're working hard to create an outstanding experience for
            you. In the meantime, you can get a taste of what's to come:
        </p>
        <Link className={styles.demoLink} href="/demo/discovery" passHref>
            Try Our Early Demo
        </Link>
    </div>
)

export default UnderConstruction
