import React, { useState, FormEvent } from 'react';
import styles from './SystemPromptEditor.module.css';

interface SystemPromptEditorProps {
  systemPrompt: string;
  handleSave: (prompt: string) => void;
  handleCancel: () => void;
}

const SystemPromptEditor = ({ 
  systemPrompt, 
  handleSave, 
  handleCancel 
}: SystemPromptEditorProps): React.ReactNode => {
  const [editedPrompt, setEditedPrompt] = useState<string>(systemPrompt);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (editedPrompt.trim()) {
      handleSave(editedPrompt.trim());
    }
  };
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setEditedPrompt(e.target.value);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.editor}>
        <h2 className={styles.title}>Edit System Prompt</h2>
        <p className={styles.description}>
          The system prompt sets the behavior and capabilities of the assistant.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            className={styles.textarea}
            value={editedPrompt}
            onChange={handlePromptChange}
            rows={8}
            placeholder="You are a helpful assistant..."
            autoFocus
          />
          <div className={styles.actions}>
            <button 
              type="button" 
              className={styles.cancelButton} 
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={!editedPrompt.trim()}
            >
              Save Changes
            </button>
          </div>
        </form>
        <div className={styles.tips}>
          <h3>Tips:</h3>
          <ul>
            <li>Be specific about the assistant's role (e.g., "You are a helpful programming assistant")</li>
            <li>Define constraints (e.g., "Keep responses concise")</li>
            <li>Add personality traits (e.g., "You are friendly and casual in tone")</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SystemPromptEditor);