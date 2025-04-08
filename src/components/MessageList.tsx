import React, { useRef, useEffect, useState, useCallback } from 'react';
import { VariableSizeList as List, ListChildComponentProps } from 'react-window';
import Message from './Message';
import { Message as MessageType } from '../shared/types';

interface MessageListProps {
  messages: MessageType[];
}

interface MessageSizes {
  [key: number]: number;
}

interface MessageItemComponentProps {
  index: number;
  style: React.CSSProperties;
  message: MessageType;
  onHeightChange: (index: number, height: number) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const [listHeight, setListHeight] = useState<number>(window.innerHeight - 200); // Approximate space for input and header
  const [messageSizes, setMessageSizes] = useState<MessageSizes>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const filteredMessages = messages.filter((msg) => msg.role !== "system");
  
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
      listRef.current.scrollToItem(filteredMessages.length - 1, "end");
    }
  }, [filteredMessages.length]);

  // Update list when messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.resetAfterIndex(0);
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);
  
  // Record message size after render
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
  
  // Create a separate component for message items to properly use hooks
  const MessageItemComponent = React.memo<MessageItemComponentProps>(({ index, style, message, onHeightChange }) => {
    const messageRef = useRef<HTMLDivElement>(null);
    
    // Measure message height after render
    useEffect(() => {
      if (messageRef.current) {
        const height = messageRef.current.offsetHeight;
        onHeightChange(index, height);
      }
    }, [index, message.content, onHeightChange]);
    
    return (
      <div style={style}>
        <div ref={messageRef}>
          <Message message={message} />
        </div>
      </div>
    );
  });
  
  // Function to render message items using the component
  const MessageItem = useCallback(({ index, style }: ListChildComponentProps) => {
    return (
      <MessageItemComponent 
        index={index}
        style={style}
        message={filteredMessages[index]}
        onHeightChange={setMessageSize}
      />
    );
  }, [filteredMessages, setMessageSize]);
  
  return (
    <div className="messages-container" ref={containerRef}>
      {filteredMessages.length > 0 ? (
        <List
          ref={listRef}
          height={listHeight}
          width="100%"
          itemCount={filteredMessages.length}
          itemSize={getItemSize}
          overscanCount={3}
        >
          {MessageItem}
        </List>
      ) : (
        <div className="empty-messages">Start a conversation by typing a message below.</div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default React.memo(MessageList);