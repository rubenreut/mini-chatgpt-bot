import React, { useState, useRef, useEffect, FormEvent } from 'react';

interface ConversationTitleProps {
  title: string | null;
  handleTitleChange: (title: string) => void;
  handleNewConversation: () => void;
}

const ConversationTitle = ({ 
  title, 
  handleTitleChange, 
  handleNewConversation 
}: ConversationTitleProps): React.ReactNode => {
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
    handleTitleChange(newTitle);
    setIsEditing(false);
  };

  const handleEditStart = (): void => {
    setEditedTitle(title || '');
    setIsEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEditedTitle(e.target.value);
  };

  const handleInputBlur = (): void => {
    handleSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>);
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
            onChange={handleInputChange}
            placeholder="Conversation title"
            onBlur={handleInputBlur}
          />
        </form>
      ) : (
        <div className="title-display">
          <h2 className="title-text" onClick={handleEditStart} title="Click to edit">
            {title || 'New Conversation'}
          </h2>
          <button 
            className="new-conversation-button" 
            onClick={handleNewConversation}
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