import React, { useState, useRef, useEffect, FormEvent } from 'react';
import styles from './ConversationTitle.module.css';

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
    <div className={styles.container}>
      {isEditing ? (
        <form onSubmit={handleSubmit} className={styles.editForm}>
          <input
            ref={inputRef}
            type="text"
            className={styles.editInput}
            value={editedTitle}
            onChange={handleInputChange}
            placeholder="Conversation title"
            onBlur={handleInputBlur}
          />
        </form>
      ) : (
        <div className={styles.titleDisplay}>
          <h2 className={styles.titleText} onClick={handleEditStart} title="Click to edit">
            {title || 'New Conversation'}
          </h2>
          <button 
            className={styles.newButton} 
            onClick={handleNewConversation}
            title="Start a new conversation"
            aria-label="Start a new conversation"
          >
            <span className={styles.plusIcon}>+</span> New Chat
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ConversationTitle);