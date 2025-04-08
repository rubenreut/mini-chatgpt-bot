import React, { useState, useRef, useEffect } from 'react';

const ConversationTitle = ({ title, onTitleChange, onNewConversation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTitle = editedTitle.trim() || 'New Conversation';
    onTitleChange(newTitle);
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditedTitle(title);
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
            onBlur={handleSubmit}
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
