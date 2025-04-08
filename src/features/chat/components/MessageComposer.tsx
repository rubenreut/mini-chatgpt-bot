import React, { useRef, useEffect } from 'react';

interface MessageComposerProps {
  userInput: string;
  setUserInput: (value: string) => void;
  onSendMessage: () => void;
  disabled: boolean;
  isListening?: boolean;
  placeholder: string;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  userInput,
  setUserInput,
  onSendMessage,
  disabled,
  isListening,
  placeholder
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to scrollHeight + border width
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [userInput]);

  // Focus textarea when not listening
  useEffect(() => {
    if (!isListening && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isListening]);

  // Handle Enter key (with Shift+Enter support for new lines)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      className="message-input"
      value={userInput}
      onChange={(e) => setUserInput(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      disabled={disabled}
      rows={1}
    />
  );
};

export default React.memo(MessageComposer);