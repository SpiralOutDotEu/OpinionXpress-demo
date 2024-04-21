import React, { useEffect, useRef, useState } from "react"
import { FaBars, FaShieldAlt } from "react-icons/fa"
import Link from "next/link"
import styles from "../styles/Header.module.css"

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const handleMenuClick = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    useEffect(() => {
        const handleClickOutside = (event: { target: any }) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                closeMenu()
            }
        }

        // Attach the listeners on component mount.
        document.addEventListener("mousedown", handleClickOutside)
        // Detach the listeners on component unmount.
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <header className={styles.header}>
            <div className={styles.brandContainer}>
                <FaShieldAlt className={styles.brandIcon} />
                <div className={styles.logo}>OpinionTrust</div>
            </div>
            <nav className={styles.navigation}>
                <button className={styles.menuButton} onClick={handleMenuClick}>
                    <FaBars size={24} />
                </button>
                <div className={`${styles.dropdownMenu} ${isMenuOpen ? styles.menuActive : ""}`} ref={dropdownRef}>
                    <Link className={styles.menuItem} href="/demo/discovery" onClick={closeMenu}>
                        Identity
                    </Link>
                    <Link className={styles.menuItem} href="/demo/polls" onClick={closeMenu}>
                        Polls
                    </Link>
                    <Link className={styles.menuItem} href="/demo/surveys" onClick={closeMenu}>
                        Surveys
                    </Link>
                </div>
            </nav>
        </header>
    )
}

export default Header
