import React, { forwardRef } from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
  autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  helperText,
  error,
  fullWidth = false,
  autoResize = false,
  className,
  id,
  onChange,
  ...props
}, ref) => {
  // Generate a unique ID if not provided
  const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
  
  const textareaClasses = [
    styles.textarea,
    error ? styles.error : '',
    autoResize ? styles.autoResize : '',
    fullWidth ? styles.fullWidth : '',
    className
  ].filter(Boolean).join(' ');

  // Handle auto-resizing
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
    
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''}`}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}
      
      <textarea
        id={textareaId}
        ref={ref}
        className={textareaClasses}
        aria-invalid={!!error}
        aria-describedby={`${textareaId}-helper ${textareaId}-error`}
        onChange={handleChange}
        {...props}
      />
      
      {helperText && !error && (
        <p id={`${textareaId}-helper`} className={styles.helperText}>
          {helperText}
        </p>
      )}
      
      {error && (
        <p id={`${textareaId}-error`} className={styles.errorText} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;