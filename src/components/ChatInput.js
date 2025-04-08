import React, { useState, useRef, useEffect } from 'react';
import VoiceInput from './VoiceInput';
import FileUploader from './FileUploader';
import { useChatContext } from '../context/ChatContext';
import { debounce } from '../utils/debounce';

const ChatInput = ({ onSendMessage, loading }) => {
  const [userInput, setUserInput] = useState('');
  const [showFileUploader, setShowFileUploader] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const textareaRef = useRef(null);
  const { 
    isListening, 
    setIsListening, 
    handleVoiceInput, 
    voiceEnabled, 
    toggleVoiceFeatures,
    isSpeaking,
    systemPrompt,
    setShowSystemPromptEditor
  } = useChatContext();

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = 'auto';
      // Set the height to scrollHeight + border width
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [userInput]);

  // Focus textarea when not listening
  useEffect(() => {
    if (!isListening && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isListening]);

  // Handle Enter key (with Shift+Enter support for new lines)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Update input when voice recognition provides a transcript
  useEffect(() => {
    if (isListening) {
      const handleTranscript = debounce((text) => {
        setUserInput(text);
      }, 300);
      
      window.handleVoiceTranscript = handleTranscript;
      
      return () => {
        delete window.handleVoiceTranscript;
      };
    }
  }, [isListening]);

  const handleFileUpload = (newFiles) => {
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const toggleFileUploader = () => {
    setShowFileUploader(prev => !prev);
  };

  const clearFiles = () => {
    setUploadedFiles([]);
  };

  const sendMessage = () => {
    if ((!userInput.trim() && uploadedFiles.length === 0) || loading) return;
    
    // Create FormData for files if needed
    let messageData = {
      text: userInput,
      files: uploadedFiles
    };
    
    onSendMessage(messageData);
    setUserInput('');
    setUploadedFiles([]);
    setShowFileUploader(false);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="input-area">
      <div className="input-toolbar">
        <button 
          onClick={() => setShowSystemPromptEditor(true)}
          className="toolbar-button system-prompt-button"
          title="Edit system prompt"
          aria-label="Edit system prompt"
        >
          <span role="img" aria-hidden="true">⚙️</span>
          <span className="button-label">System Prompt</span>
        </button>
        
        <button 
          onClick={toggleFileUploader}
          className={`toolbar-button file-upload-button ${showFileUploader ? 'active' : ''}`}
          title="Upload files"
          aria-label="Upload files"
        >
          <span role="img" aria-hidden="true">📎</span>
          <span className="button-label">Upload Files</span>
          {uploadedFiles.length > 0 && (
            <span className="file-count">{uploadedFiles.length}</span>
          )}
        </button>
        
        {voiceEnabled && (
          <VoiceInput 
            onTranscript={handleVoiceInput}
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
      
      {showFileUploader && (
        <FileUploader onFileUpload={handleFileUpload} loading={loading} />
      )}
      
      <div className="input-container">
        <div className="input-box">
          <textarea
            ref={textareaRef}
            className="message-input"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={uploadedFiles.length > 0 
              ? `Add a message about your ${uploadedFiles.length} file(s)...` 
              : "Type your message here... (Shift+Enter for new line)"}
            disabled={loading || isListening || isSpeaking}
            rows={3}
          />
          <button 
            className={`send-button ${(loading || isListening) ? 'disabled' : ''}`} 
            onClick={sendMessage} 
            disabled={loading || (!userInput.trim() && uploadedFiles.length === 0) || isListening || isSpeaking}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
        {loading && <div className="thinking-text">AI is thinking...</div>}
        
        {uploadedFiles.length > 0 && !showFileUploader && (
          <div className="files-summary">
            <span>{uploadedFiles.length} file(s) attached</span>
            <button onClick={toggleFileUploader} className="files-view-button">
              View
            </button>
            <button onClick={clearFiles} className="files-clear-button">
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ChatInput);