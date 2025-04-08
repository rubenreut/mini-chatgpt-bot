import React, { useRef, useEffect } from 'react';
import Message from './Message';

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="messages-container">
      {messages
        .filter((msg) => msg.role !== "system")
        .map((msg, i) => (
          <Message key={i} message={msg} />
        ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default React.memo(MessageList);
