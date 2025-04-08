import React from 'react';
import styles from './Alert.module.css';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: AlertVariant;
  icon?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  children,
  variant = 'info',
  icon,
  onClose,
  className,
}) => {
  const alertClasses = [
    styles.alert,
    styles[variant],
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={alertClasses} 
      role="alert"
    >
      <div className={styles.content}>
        {icon && <div className={styles.icon}>{icon}</div>}
        
        <div className={styles.message}>
          {title && <h4 className={styles.title}>{title}</h4>}
          <div className={styles.description}>{children}</div>
        </div>
      </div>
      
      {onClose && (
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          aria-label="Close alert"
          type="button"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;