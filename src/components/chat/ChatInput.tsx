import React, { useState, useCallback } from 'react';
import { useChatContext } from '../../context/ChatContext';
import { debounce } from '../../utils/debounce';
import AnimatedPlusIcon from '../AnimatedPlusIcon';
import MessageComposer from './MessageComposer';
import ToolbarControls from './ToolbarControls';
import FileUploadPanel from './FileUploadPanel';
import FileAttachments from './FileAttachments';
import { useFileProcessor, FileWithPreview } from '../../hooks/useFileProcessor';
import { MessageData } from '../../types';

interface ChatInputProps {
  onSendMessage: (messageData: MessageData) => void;
  loading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, loading }) => {
  const [userInput, setUserInput] = useState<string>('');
  const [showFileUploader, setShowFileUploader] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  
  const { 
    isListening, 
    setIsListening, 
    handleVoiceInput, 
    voiceEnabled, 
    toggleVoiceFeatures,
    isSpeaking,
    setShowSystemPromptEditor
  } = useChatContext();

  const { processFiles } = useFileProcessor();

  // Update input when voice recognition provides a transcript
  React.useEffect(() => {
    if (isListening) {
      const handleTranscript = debounce((text: string) => {
        setUserInput(text);
      }, 300);
      
      window.handleVoiceTranscript = (text: string) => handleTranscript(text);
      
      return () => {
        window.handleVoiceTranscript = undefined;
      };
    }
  }, [isListening]);

  const handleFileUpload = useCallback((fileList: FileList) => {
    const newFiles = Array.from(fileList);
    processFiles(newFiles).then(processedFiles => {
      setUploadedFiles(prevFiles => [...prevFiles, ...processedFiles]);
    });
    setShowFileUploader(false);
  }, [processFiles]);

  const toggleFileUploader = useCallback(() => {
    setShowFileUploader(prevState => !prevState);
  }, []);

  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(currentFiles => currentFiles.filter(f => f.id !== fileId));
  }, []);

  const sendMessage = useCallback(() => {
    if ((!userInput.trim() && uploadedFiles.length === 0) || loading) return;
    
    onSendMessage({
      text: userInput,
      files: uploadedFiles as unknown as File[]
    });
    
    setUserInput('');
    setUploadedFiles([]);
    setShowFileUploader(false);
  }, [userInput, uploadedFiles, loading, onSendMessage]);

  return (
    <div className="input-area">
      <ToolbarControls 
        onSystemPromptClick={() => setShowSystemPromptEditor(true)}
        voiceEnabled={voiceEnabled}
        toggleVoiceFeatures={toggleVoiceFeatures}
        isListening={isListening}
        setIsListening={setIsListening}
        onVoiceTranscript={handleVoiceInput}
      />
      
      {showFileUploader && (
        <FileUploadPanel onFileSelect={handleFileUpload} />
      )}
      
      <div className="input-container">
        <div className="input-box">
          <MessageComposer
            userInput={userInput}
            setUserInput={setUserInput}
            onSendMessage={sendMessage}
            disabled={loading || isListening || isSpeaking}
            isListening={isListening}
            placeholder={uploadedFiles.length > 0 
              ? `Add a message about your ${uploadedFiles.length} file(s)...` 
              : "Type your message here... (Shift+Enter for new line)"}
          />
          
          <button 
            className={`upload-button ${showFileUploader ? 'active' : ''}`} 
            onClick={toggleFileUploader}
            title="Upload files"
            aria-label="Upload files"
          >
            <AnimatedPlusIcon isActive={showFileUploader} />
            {uploadedFiles.length > 0 && (
              <span className="file-count">{uploadedFiles.length}</span>
            )}
          </button>
          
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
        
        {uploadedFiles.length > 0 && (
          <FileAttachments 
            files={uploadedFiles}
            onRemoveFile={removeFile}
            onClearAll={clearFiles}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(ChatInput);