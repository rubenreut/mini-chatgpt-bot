import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Prism from 'prismjs';

const Message = ({ message }) => {
  const codeRef = useRef(null);

  // Highlight code blocks when message content changes
  useEffect(() => {
    if (message.role === 'assistant' && codeRef.current) {
      Prism.highlightAllUnder(codeRef.current);
    }
  }, [message.content, message.role]);

  const renderContent = (content) => {
    return (
      <div ref={codeRef}>
        <ReactMarkdown
          className="markdown-content"
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
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

  return (
    <div className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}>
      <div className="message-role">{message.role === "user" ? "You" : "Assistant"}</div>
      <div className="message-content">
        {message.role === "user" ? message.content : renderContent(message.content)}
      </div>
    </div>
  );
};

export default React.memo(Message);