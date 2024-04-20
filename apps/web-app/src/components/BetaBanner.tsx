import React from 'react';
import { FaTools } from 'react-icons/fa';
import styles from '../styles/BetaBanner.module.css'; // Path to your CSS module

const Banner: React.FC = () => (
      <div className={styles.banner}>
        <FaTools className={styles.icon} />
        <p className={styles.bannerText}>
          Beta Version - For Testing Purposes Only
        </p>
      </div>
    );
  
  export default Banner;
