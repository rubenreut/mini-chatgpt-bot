import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Toast.module.css';

export type ToastType = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastProps {
  id: string;
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  type = 'info',
  duration = 5000,
  position = 'top-right',
  onClose,
}) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  
  // Auto-close toast after duration
  useEffect(() => {
    if (duration <= 0) return;
    
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      
      if (remaining <= 0) {
        clearInterval(timer);
        setVisible(false);
        setTimeout(() => onClose(id), 300); // Allow exit animation to complete
      } else {
        setProgress((remaining / duration) * 100);
      }
    }, 100);
    
    return () => clearInterval(timer);
  }, [id, duration, onClose]);
  
  // Handle close button click
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(id), 300); // Allow exit animation to complete
  };
  
  const toastClasses = [
    styles.toast,
    styles[type],
    styles[position],
    visible ? styles.visible : styles.hidden
  ].filter(Boolean).join(' ');
  
  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case 'error':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'warning':
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case 'info':
      default:
        return (
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };
  
  return (
    <div
      className={toastClasses}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={styles.iconContainer}>
        {getIcon()}
      </div>
      
      <div className={styles.content}>
        {title && <h4 className={styles.title}>{title}</h4>}
        <p className={styles.message}>{message}</p>
        
        {duration > 0 && (
          <div className={styles.progressContainer}>
            <div 
              className={styles.progress} 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      
      <button
        type="button"
        className={styles.closeButton}
        onClick={handleClose}
        aria-label="Close toast"
      >
        &times;
      </button>
    </div>
  );
};

interface ToastContainerProps {
  position?: ToastPosition;
  children: React.ReactNode;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  children,
}) => {
  // Create a portal to render toasts at the end of the document body
  return createPortal(
    <div className={`${styles.container} ${styles[position]}`}>
      {children}
    </div>,
    document.body
  );
};

export default Toast;