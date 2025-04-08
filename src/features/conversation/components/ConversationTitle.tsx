import React, { useState, useRef, useEffect, FormEvent } from 'react';

interface ConversationTitleProps {
  title: string | null;
  onTitleChange: (title: string) => void;
  onNewConversation: () => void;
}

const ConversationTitle: React.FC<ConversationTitleProps> = ({ title, onTitleChange, onNewConversation }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>(title || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Update edited title when title prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditedTitle(title || '');
    }
  }, [title, isEditing]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const newTitle = editedTitle.trim() || 'New Conversation';
    onTitleChange(newTitle);
    setIsEditing(false);
  };

  const startEditing = (): void => {
    setEditedTitle(title || '');
    setIsEditing(true);
  };

  return (
    <div className="conversation-title-container">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="title-edit-form">
          <input
            ref={inputRef}
            type="text"
            className="title-edit-input"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Conversation title"
            onBlur={() => handleSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>)}
          />
        </form>
      ) : (
        <div className="title-display">
          <h2 className="title-text" onClick={startEditing} title="Click to edit">
            {title || 'New Conversation'}
          </h2>
          <button 
            className="new-conversation-button" 
            onClick={onNewConversation}
            title="Start a new conversation"
            aria-label="Start a new conversation"
          >
            <span className="plus-icon">+</span> New Chat
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ConversationTitle);