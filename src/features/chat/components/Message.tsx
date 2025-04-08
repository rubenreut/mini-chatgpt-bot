import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import { Message as MessageType } from '../../../shared/types';
import styles from './Message.module.css';
import { Components } from 'react-markdown';

interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
  onHeightChange?: (height: number) => void;
  isAnimated?: boolean;
}

// Define correct types for ReactMarkdown components
interface CodeProps {
  node?: unknown;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Message: React.FC<MessageProps> = ({ 
  message, 
  isStreaming = false,
  onHeightChange,
  isAnimated = false
}) => {
  const codeRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(0);

  // Highlight code blocks when message content changes
  useEffect(() => {
    if (message.role === 'assistant' && codeRef.current) {
      Prism.highlightAllUnder(codeRef.current);
    }
  }, [message.content, message.role]);
  
  // Use ResizeObserver to detect height changes for virtualization
  useEffect(() => {
    if (!messageRef.current || !onHeightChange) return;
    
    // Get initial height
    const newHeight = messageRef.current.offsetHeight;
    setHeight(newHeight);
    onHeightChange(newHeight);
    
    // Set up resize observer to detect dynamic height changes (e.g. when images load)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        const newHeight = element.offsetHeight;
        if (newHeight !== height) {
          setHeight(newHeight);
          onHeightChange(newHeight);
        }
      }
    });
    
    resizeObserver.observe(messageRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [onHeightChange, height, message.content]);

  const renderContent = (content: string) => {
    // Define custom components for react-markdown
    const components: Components = {
      code: ({ inline, className, children, ...props }: CodeProps) => {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
          <pre className={`language-${match[1]}`}>
            <code className={`language-${match[1]}`} {...props}>
              {children}
            </code>
          </pre>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
    };
    
    return (
      <div ref={codeRef}>
        <ReactMarkdown
          className={styles.markdownContent}
          remarkPlugins={[remarkGfm]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  // Create a typing indicator component
  const TypingIndicator = () => (
    <div className={styles.typingIndicator}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );

  // Build className conditionally
  const messageClasses = [
    styles.message,
    message.role === 'user' ? styles.userMessage : styles.assistantMessage,
    message.error ? styles.errorMessage : '',
    isStreaming ? styles.streaming : ''
  ].filter(Boolean).join(' ');

  // Add animated class if needed
  const animatedClass = isAnimated ? styles.animated : '';
  const allClasses = `${messageClasses} ${animatedClass}`;

  return (
    <div ref={messageRef} className={allClasses}>
      <div className={styles.messageRole}>{message.role === 'user' ? 'You' : 'AI'}</div>
      <div className={styles.messageContent}>
        {message.role === 'user' ? 
          message.content : 
          (message.content.length === 0 && isStreaming ? 
            <TypingIndicator /> : 
            renderContent(message.content))
        }
        {message.error && (
          <div className={styles.messageError}>
            {message.errorType === 'auth' 
              ? 'API key error. Please check your OpenAI API key.' 
              : message.errorType === 'no_api_key'
              ? 'No API key provided. Please enter your OpenAI API key.'
              : 'Error sending message. Please try again.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(Message);