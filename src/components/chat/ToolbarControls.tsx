import React from 'react';
import VoiceInput from '../VoiceInput';

interface ToolbarControlsProps {
  onSystemPromptClick: () => void;
  voiceEnabled: boolean;
  toggleVoiceFeatures: () => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  onVoiceTranscript: (text: string) => void;
}

const ToolbarControls: React.FC<ToolbarControlsProps> = ({
  onSystemPromptClick,
  voiceEnabled,
  toggleVoiceFeatures,
  isListening,
  setIsListening,
  onVoiceTranscript
}) => {
  return (
    <div className="input-toolbar">
      <button 
        onClick={onSystemPromptClick}
        className="toolbar-button system-prompt-button"
        title="Edit system prompt"
        aria-label="Edit system prompt"
      >
        <span role="img" aria-hidden="true">⚙️</span>
        <span className="button-label">System Prompt</span>
      </button>
      
      {voiceEnabled && (
        <VoiceInput 
          onTranscript={onVoiceTranscript}
          isListening={isListening}
          setIsListening={setIsListening}
        />
      )}
      
      <button 
        onClick={toggleVoiceFeatures}
        className={`toolbar-button voice-toggle ${voiceEnabled ? 'active' : ''}`}
        title={`${voiceEnabled ? 'Disable' : 'Enable'} voice features`}
        aria-label={`${voiceEnabled ? 'Disable' : 'Enable'} voice features`}
      >
        <span role="img" aria-hidden="true">{voiceEnabled ? '🔊' : '🔈'}</span>
        <span className="button-label">{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
      </button>
    </div>
  );
};

export default React.memo(ToolbarControls);