import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastContainer, ToastType, ToastPosition } from '../ui/Toast';

interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContextValue {
  addToast: (options: {
    title?: string;
    message: string;
    type?: ToastType;
    duration?: number;
  }) => void;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Add a new toast
  const addToast = useCallback(({
    title,
    message,
    type = 'info',
    duration = 5000,
  }: {
    title?: string;
    message: string;
    type?: ToastType;
    duration?: number;
  }) => {
    setToasts(currentToasts => {
      // Create the new toast
      const newToast: ToastItem = {
        id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title,
        message,
        type,
        duration,
      };
      
      // Add the new toast to the beginning of the array
      // and limit the number of toasts
      return [newToast, ...currentToasts].slice(0, maxToasts);
    });
  }, [maxToasts]);

  // Remove a toast by id
  const removeToast = useCallback((id: string) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);

  // Remove all toasts
  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Create the context value
  const value = {
    addToast,
    removeToast,
    removeAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      <ToastContainer position={position}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            position={position}
            onClose={removeToast}
          />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

// Hook to use the toast context
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

export default ToastContext;