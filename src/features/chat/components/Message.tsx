import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';
import { Message as MessageType } from '../../../shared/types';
import './Message.css';

interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
}

// Define correct types for ReactMarkdown components
interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Message: React.FC<MessageProps> = ({ message, isStreaming = false }) => {
  const codeRef = useRef<HTMLDivElement>(null);

  // Highlight code blocks when message content changes
  useEffect(() => {
    if (message.role === 'assistant' && codeRef.current) {
      Prism.highlightAllUnder(codeRef.current);
    }
  }, [message.content, message.role]);

  const renderContent = (content: string) => {
    return (
      <div ref={codeRef}>
        <ReactMarkdown
          className="markdown-content"
          remarkPlugins={[remarkGfm]}
          components={{
            code: ({ node, inline, className, children, ...props }: CodeProps) => {
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
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  // Create a typing indicator component
  const TypingIndicator = () => (
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );

  return (
    <div 
      className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'} ${message.error ? 'error-message' : ''} ${isStreaming ? 'streaming' : ''}`}
    >
      <div className="message-role">{message.role === 'user' ? 'You' : 'Assistant'}</div>
      <div className="message-content">
        {message.role === 'user' ? 
          message.content : 
          (message.content.length === 0 && isStreaming ? 
            <TypingIndicator /> : 
            renderContent(message.content))
        }
        {message.error && (
          <div className="message-error">
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