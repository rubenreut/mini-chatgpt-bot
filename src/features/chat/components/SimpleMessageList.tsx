import React, { useRef, useEffect } from 'react';
import SimpleMessage from './SimpleMessage';
import { Message as MessageType } from '../../../shared/types';
import styles from './SimpleMessageList.module.css';

interface SimpleMessageListProps {
  messages: MessageType[];
}

const SimpleMessageList = ({ messages }: SimpleMessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Only filter system messages for display
  const displayMessages = messages.filter(msg => msg.role !== 'system');
  // Log all messages to help debug
  console.log("All messages:", messages.map(m => ({ role: m.role, content: m.content.substring(0, 20) })));
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    console.log(`Displaying ${displayMessages.length} messages`);
  }, [messages, displayMessages.length]);
  
  return (
    <div className={styles.messagesContainer}>
      {displayMessages.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Start a conversation by typing a message below.</p>
        </div>
      ) : (
        <div className={styles.messagesList}>
          {displayMessages.map((message, index) => (
            <SimpleMessage key={index} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default SimpleMessageList;