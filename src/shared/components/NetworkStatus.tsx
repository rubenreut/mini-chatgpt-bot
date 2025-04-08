import React, { useEffect } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useToast } from '../contexts/ToastContext';
import { Alert } from '../ui';
import styles from './NetworkStatus.module.css';

const NetworkStatus: React.FC = () => {
  const { isOnline, wasOffline } = useNetworkStatus();
  const { addToast } = useToast();

  // Show toast notifications when network status changes
  useEffect(() => {
    if (!isOnline) {
      addToast({
        title: 'You are offline',
        message: 'Your changes will be saved locally and synced when connection returns.',
        type: 'warning',
        duration: 0, // Don't auto-dismiss
      });
    } else if (wasOffline) {
      addToast({
        title: 'You are back online',
        message: 'Your changes have been synced.',
        type: 'success',
        duration: 5000,
      });
    }
  }, [isOnline, wasOffline, addToast]);

  // Show offline banner only when offline
  if (isOnline) return null;

  return (
    <div className={styles.container}>
      <Alert 
        variant="warning" 
        title="Offline Mode"
        icon={
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 1 1 5.82 2.44M5.45 5.11L8 7.66l6.8 6.8"></path>
          </svg>
        }
      >
        You are currently offline. Limited functionality is available.
      </Alert>
    </div>
  );
};

export default NetworkStatus;