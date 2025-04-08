import React from 'react';

interface ConversationControlsProps {
  onClear: () => void;
  onExport: () => void;
}

const ConversationControls: React.FC<ConversationControlsProps> = ({ onClear, onExport }) => {
  return (
    <div className="conversation-controls">
      <button 
        onClick={onClear} 
        className="control-button clear-button" 
        title="Clear conversation"
      >
        <span role="img" aria-label="Clear conversation">🗑️</span> Clear
      </button>
      <button 
        onClick={onExport} 
        className="control-button export-button" 
        title="Export conversation"
      >
        <span role="img" aria-label="Export conversation">💾</span> Export
      </button>
    </div>
  );
};

export default React.memo(ConversationControls);