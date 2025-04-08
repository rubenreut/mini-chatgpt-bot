import React from 'react';
import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text = 'Loading...' }) => {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} aria-hidden="true"></div>
      {text && <span className={styles.text}>{text}</span>}
    </div>
  );
};

export default LoadingSpinner;