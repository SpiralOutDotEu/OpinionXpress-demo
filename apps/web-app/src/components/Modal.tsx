import React from "react"
import styles from "../styles/Modal.module.css"

interface ModalProps {
    text: string
    isOpen: boolean
    status: "success" | "error"
    onClose: () => void
}

function parseMessage(text: string, status: string) {
    if (status === "error") { 
        // Regex to extract the reason from an error message
        const match =  /error=\{\\"reason\\":\\"([^"]*)\\",/.exec(text);
        return match ? `Error: ${match[1]}` : text
    }
    if (status === "success") {
        // Regex to extract the transaction hash from a success message
        const match = /tx=([A-Za-z0-9]+)/.exec(text)
        if (match) {
            const txHash = match[1]
            const link = `https://sepolia.arbiscan.io/tx/${txHash}`
            return (
                <span>
                    Your opinion has been permanently minted to the blockchain, while your anonymity is guaranteed. You
                    can see your blockchain transaction{" "}
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        here
                    </a>
                    .
                </span>
            )
        }
        return `This is strange. Your transaction has been successfully processed, but no transaction hash was found.${text}`
    }
    return text
}

const Modal: React.FC<ModalProps> = ({ text, isOpen, status, onClose }) => {
    if (!isOpen) return null

    const parsedText = parseMessage(text, status)

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2 className={styles.title}>{status === "success" ? "Success" : "Error"}</h2>
                <div className={styles.modalContent}>
                    <p className={status === "success" ? styles.successText : styles.errorText}>{parsedText}</p>
                </div>
                <button className={styles.closeButton} onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    )
}

export default Modal
