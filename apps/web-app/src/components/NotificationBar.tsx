import React, { useState, useEffect } from "react"
import { AiOutlineInfoCircle, AiOutlineClose } from "react-icons/ai"
import styles from "../styles/NotificationBar.module.css"

interface NotificationBarProps {
    message: string
}

const NotificationBar: React.FC<NotificationBarProps> = ({ message }) => {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (message) {
            setShow(true) // Show notification
            const timer = setTimeout(() => setShow(false), 15000) // Auto-hide after 5 seconds
            return () => clearTimeout(timer)
        }
        return undefined
    }, [message]) // Depend on message to trigger effect

    return (
        <div className={`${styles.notificationBar} ${show ? styles.visible : ""}`}>
            <AiOutlineInfoCircle className={styles.icon} />
            {message}
            <button onClick={() => setShow(false)} className={styles.closeButton}>
                <AiOutlineClose />
            </button>
        </div>
    )
}

export default NotificationBar
