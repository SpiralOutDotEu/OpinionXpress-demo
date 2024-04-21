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
            setShow(true)
            const timer = setTimeout(() => setShow(false), 2500) 
            return () => clearTimeout(timer)
        }
        return undefined
    }, [message])

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
