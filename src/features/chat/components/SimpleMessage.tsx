import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message as MessageType } from '../../../shared/types';
import styles from './SimpleMessage.module.css';

interface SimpleMessageProps {
  message: MessageType;
}

/**
 * A simplified message component without virtualization and complex styling
 */
const SimpleMessage = ({ message }: SimpleMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={`${styles.message} ${isUser ? styles.userMessage : styles.assistantMessage}`}>
      <div className={styles.messageHeader}>
        <div className={styles.messageRole}>
          {isUser ? 'You' : 'AI'}
        </div>
      </div>
      <div className={styles.messageContent}>
        {isUser ? (
          message.content
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default SimpleMessage;