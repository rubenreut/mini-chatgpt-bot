import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  since: Date | null;
}

export const useNetworkStatus = (): NetworkStatus => {
  // Initialize with the current online status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  // Track if the user was offline during this session
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  
  // Track when the last offline event occurred
  const [since, setSince] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setSince(new Date());
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline, since };
};

export default useNetworkStatus;