import React, { useState } from "react"
import { FaBars, FaShieldAlt } from "react-icons/fa"
import Link from "next/link"
import styles from "../styles/Header.module.css"

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <header className={styles.header}>
            <div className={styles.brandContainer}>
                <FaShieldAlt className={styles.brandIcon} />
                <div className={styles.logo}>OpinionTrust</div>
            </div>
            <button className={styles.menuButton} onClick={handleMenuClick}>
                <FaBars size={24} />
            </button>
            {isMenuOpen && (
                <div className={styles.dropdownMenu}>
                    <Link href="/demo/identity" className={styles.menuItem}>
                        Identity
                    </Link>
                    <Link href="/demo/polls" className={styles.menuItem}>
                        Polls
                    </Link>
                </div>
            )}
        </header>
    )
}

export default Header
