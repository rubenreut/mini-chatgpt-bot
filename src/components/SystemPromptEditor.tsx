import React, { useState } from 'react';

interface SystemPromptEditorProps {
  systemPrompt: string;
  onSave: (prompt: string) => void;
  onCancel: () => void;
}

const SystemPromptEditor: React.FC<SystemPromptEditorProps> = ({ 
  systemPrompt, 
  onSave, 
  onCancel 
}) => {
  const [editedPrompt, setEditedPrompt] = useState<string>(systemPrompt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedPrompt.trim()) {
      onSave(editedPrompt.trim());
    }
  };

  return (
    <div className="system-prompt-editor-overlay">
      <div className="system-prompt-editor">
        <h2 className="prompt-editor-title">Edit System Prompt</h2>
        <p className="prompt-editor-description">
          The system prompt sets the behavior and capabilities of the assistant.
        </p>
        <form onSubmit={handleSubmit} className="prompt-editor-form">
          <textarea
            className="prompt-editor-textarea"
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            rows={8}
            placeholder="You are a helpful assistant..."
            autoFocus
          />
          <div className="prompt-editor-actions">
            <button 
              type="button" 
              className="prompt-editor-cancel" 
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="prompt-editor-save"
              disabled={!editedPrompt.trim()}
            >
              Save Changes
            </button>
          </div>
        </form>
        <div className="prompt-editor-tips">
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