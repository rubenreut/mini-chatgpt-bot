import React from 'react';
import VoiceInput from '../../../components/VoiceInput';
import styles from './ToolbarControls.module.css';

interface ToolbarControlsProps {
  onSystemPromptClick: () => void;
  voiceEnabled: boolean;
  toggleVoiceFeatures: () => void;
  isListening: boolean;
  setIsListening: (value: boolean) => void;
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
  // Build voice toggle button classNames
  const voiceToggleClasses = [
    styles.toolbarButton,
    voiceEnabled ? styles.active : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.inputToolbar}>
      <button 
        onClick={onSystemPromptClick}
        className={styles.toolbarButton}
        title="Edit system prompt"
        aria-label="Edit system prompt"
      >
        <span role="img" aria-hidden="true">⚙️</span>
        <span className={styles.buttonLabel}>System Prompt</span>
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
        className={voiceToggleClasses}
        title={`${voiceEnabled ? 'Disable' : 'Enable'} voice features`}
        aria-label={`${voiceEnabled ? 'Disable' : 'Enable'} voice features`}
      >
        <span role="img" aria-hidden="true">{voiceEnabled ? '🔊' : '🔈'}</span>
        <span className={styles.buttonLabel}>{voiceEnabled ? 'Voice On' : 'Voice Off'}</span>
      </button>
    </div>
  );
};

export default React.memo(ToolbarControls);