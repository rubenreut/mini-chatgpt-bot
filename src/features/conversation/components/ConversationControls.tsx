import React from 'react';

interface ConversationControlsProps {
  handleClear: () => void;
  handleExport: () => void;
}

const ConversationControls = ({ handleClear, handleExport }: ConversationControlsProps): React.ReactNode => {
  return (
    <div className="conversation-controls">
      <button 
        onClick={handleClear} 
        className="control-button clear-button" 
        title="Clear conversation"
      >
        <span role="img" aria-label="Clear conversation">🗑️</span> Clear
      </button>
      <button 
        onClick={handleExport} 
        className="control-button export-button" 
        title="Export conversation"
      >
        <span role="img" aria-label="Export conversation">💾</span> Export
      </button>
    </div>
  );
};

export default React.memo(ConversationControls);