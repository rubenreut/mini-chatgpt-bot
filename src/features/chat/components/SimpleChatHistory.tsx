import React, { useRef, useEffect } from 'react';
import { Message as MessageType } from '../../../shared/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './SimpleChatHistory.module.css';

interface ChatHistoryProps {
  messages: MessageType[];
}

/**
 * Simplified chat history component that explicitly tracks user and assistant messages
 */
const SimpleChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // IMPORTANT: Only filter system messages, but keep ALL user and assistant messages
  const displayMessages = messages ? messages.filter(msg => msg.role !== 'system') : [];
  
  // Generate stable keys that don't cause remounting
  const getMessageKey = (message: MessageType, index: number) => {
    // Use a more stable key format that won't change during renders
    return `msg-${index}-${message.timestamp || Date.now()}-${message.role}`;
  };
  
  // Debug logging
  useEffect(() => {
    console.log("SimpleChatHistory - Total messages:", messages.length);
    console.log("SimpleChatHistory - Display messages:", displayMessages.length);
    
    // Count user and assistant messages
    const userMessages = displayMessages.filter(msg => msg.role === 'user').length;
    const assistantMessages = displayMessages.filter(msg => msg.role === 'assistant').length;
    console.log(`SimpleChatHistory - User messages: ${userMessages}, Assistant messages: ${assistantMessages}`);
    
    // Log message details for debugging
    displayMessages.forEach((msg, i) => {
      const preview = msg.content.substring(0, 20) + (msg.content.length > 20 ? '...' : '');
      console.log(`Message ${i}: ${msg.role} - ${preview}`);
    });
  }, [messages, displayMessages]);
  
  // Always scroll to bottom when messages change - remove timeout to ensure immediate scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages.length]);

  return (
    <div className={styles.container} data-testid="chat-history">
      {displayMessages.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Start a conversation by typing a message below.</p>
        </div>
      ) : (
        <div className={styles.messages}>
          {displayMessages.map((message, index) => {
            const isUser = message.role === 'user';
            return (
              <div 
                key={getMessageKey(message, index)}
                className={`${styles.message} ${isUser ? styles.userMessage : styles.assistantMessage}`}
                data-testid={isUser ? 'user-message' : 'assistant-message'}
                data-message-index={index}
              >
                <div className={styles.messageHeader}>
                  {isUser ? 'You' : 'AI'}
                </div>
                <div className={styles.messageContent}>
                  {isUser ? (
                    message.content || ''
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content || ''}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default SimpleChatHistory;