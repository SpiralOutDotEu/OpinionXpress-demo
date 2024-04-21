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
            <button className={styles.menuButton} onClick={handleMenuClick}>
                <FaBars size={24} />
            </button>
            {isMenuOpen && (
                <div className={styles.dropdownMenu} ref={dropdownRef}>
                    <Link className={styles.menuItem} href="/demo/identity" onClick={closeMenu}>
                        Identity
                    </Link>
                    <Link className={styles.menuItem} href="/demo/polls" onClick={closeMenu}>
                        Polls
                    </Link>
                    <Link className={styles.menuItem} href="/demo/surveys" onClick={closeMenu}>
                        Surveys
                    </Link>
                </div>
            )}
        </header>
    )
}

export default Header
