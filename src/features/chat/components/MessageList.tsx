import React, { useRef, useEffect } from 'react';
import Message from './Message';
import { Message as MessageType } from '../../../shared/types';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: MessageType[];
  isStreaming?: boolean;
}

/**
 * Simple message list component (no virtualization)
 */
const MessageList: React.FC<MessageListProps> = ({ messages, isStreaming = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Filter out system messages
  const filteredMessages = messages.filter((msg) => msg.role !== 'system');
  
  // Scroll to bottom after messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    console.log("Messages updated, scrolling to bottom", filteredMessages.length);
  }, [messages, filteredMessages.length]);
  
  return (
    <div className={styles.messagesContainer} ref={containerRef}>
      {filteredMessages.length > 0 ? (
        <div className={styles.messageList}>
          {filteredMessages.map((message, index) => (
            <Message 
              key={index} 
              message={message} 
              isStreaming={isStreaming && index === filteredMessages.length - 1 && message.role === 'assistant'} 
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className={styles.emptyMessages}>Start a conversation by typing a message below.</div>
      )}
    </div>
  );
};

export default React.memo(MessageList);