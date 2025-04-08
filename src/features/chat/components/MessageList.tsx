import React, { useRef, useEffect, useState, useCallback } from 'react';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import Message from './Message';
import { Message as MessageType } from '../../../shared/types';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: MessageType[];
  isStreaming?: boolean;
}

interface MessageSizes {
  [key: number]: number;
}

interface MessageItemProps {
  index: number;
  style: React.CSSProperties;
  message: MessageType;
  onHeightChange: (index: number, height: number) => void;
  isLastMessage: boolean;
  isStreaming: boolean;
}

/**
 * Virtualized message list component with optimized height calculations
 */
const MessageList: React.FC<MessageListProps> = ({ messages, isStreaming = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const [listHeight, setListHeight] = useState<number>(window.innerHeight - 200); // Approximate space for input and header
  const [messageSizes, setMessageSizes] = useState<MessageSizes>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const filteredMessages = messages.filter((msg) => msg.role !== 'system');
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setListHeight(containerRef.current.offsetHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Scroll to bottom after messages update
  const scrollToBottom = useCallback(() => {
    if (filteredMessages.length > 0 && listRef.current) {
      listRef.current.scrollToItem(filteredMessages.length - 1, 'end');
    }
  }, [filteredMessages.length]);

  // Update list when messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);
  
  // Record message size - using useCallback to prevent recreation
  const setMessageSize = useCallback((index: number, size: number) => {
    setMessageSizes(prev => {
      if (prev[index] === size) return prev;
      return { ...prev, [index]: size };
    });
  }, []);
  
  // Get item size for virtualized list
  const getItemSize = useCallback((index: number) => {
    return messageSizes[index] || 100; // Default height
  }, [messageSizes]);
  
  // Create a separate component for message items with ResizeObserver
  const MessageItemComponent = React.memo<MessageItemProps>(
    ({ index, style, message, onHeightChange, isLastMessage, isStreaming }) => {
      const messageRef = useRef<HTMLDivElement>(null);
      
      // Use ResizeObserver to detect size changes without causing re-render loops
      useEffect(() => {
        if (!messageRef.current) return;
        
        // Initialize with current height
        const currentHeight = messageRef.current.offsetHeight;
        onHeightChange(index, currentHeight);
        
        // Create ResizeObserver to track height changes
        const resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            const height = entry.contentRect.height;
            onHeightChange(index, height);
          }
        });
        
        resizeObserver.observe(messageRef.current);
        
        // Cleanup
        return () => resizeObserver.disconnect();
      }, [index, onHeightChange]);
      
      // Only show streaming indicator for the last assistant message
      const showStreamingIndicator = isLastMessage && isStreaming && message.role === 'assistant';
      
      return (
        <div style={style}>
          <div ref={messageRef}>
            <Message 
              message={message} 
              isStreaming={showStreamingIndicator} 
            />
          </div>
        </div>
      );
    }
  );
  
  // Function to render message items using the component - memoized to prevent recreation
  const MessageItem = useCallback(({ index, style }: ListChildComponentProps) => {
    const isLastMessage = index === filteredMessages.length - 1;
    
    return (
      <MessageItemComponent 
        index={index}
        style={style}
        message={filteredMessages[index]}
        onHeightChange={setMessageSize}
        isLastMessage={isLastMessage}
        isStreaming={isStreaming}
      />
    );
  }, [filteredMessages, setMessageSize, isStreaming, MessageItemComponent]);
  
  return (
    <div className={styles.messagesContainer} ref={containerRef}>
      {filteredMessages.length > 0 ? (
        <List
          ref={listRef}
          height={listHeight}
          width="100%"
          itemCount={filteredMessages.length}
          itemSize={getItemSize}
          overscanCount={3}
          className={styles.messageList}
        >
          {MessageItem}
        </List>
      ) : (
        <div className={styles.emptyMessages}>Start a conversation by typing a message below.</div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default React.memo(MessageList);