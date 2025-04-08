import React, { useState, useCallback, useEffect } from 'react';
import { FiSend } from 'react-icons/fi';
import { MessageData, FileWithPreview } from '../../../shared/types';
import { useChatContext } from '../context/ChatContext';
import { useFileProcessor } from '../../file-handling/hooks/useFileProcessor';
import AnimatedPlusIcon from '../../../components/AnimatedPlusIcon';
import FileAttachments from './FileAttachments';
import FileUploadPanel from './FileUploadPanel';
import ToolbarControls from './ToolbarControls';
import MessageComposer from './MessageComposer';
import { debounce } from '../../../utils/debounce';

interface ChatInputProps {
  handleSendMessage: (messageData: MessageData) => Promise<void>;
  isLoading: boolean;
}

const ChatInput = ({ 
  handleSendMessage, 
  isLoading 
}: ChatInputProps): React.ReactNode => {
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
  useEffect(() => {
    if (isListening) {
      const handleTranscript = debounce((text: string) => {
        setUserInput(text);
      }, 300);
      
      window.handleVoiceTranscript = handleTranscript;
      
      return () => {
        window.handleVoiceTranscript = undefined;
      };
    }
  }, [isListening]);

  // Toggle file uploader visibility
  const handleToggleFileUploader = useCallback((): void => {
    setShowFileUploader(prev => !prev);
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((fileList: FileList): void => {
    const newFiles = Array.from(fileList);
    processFiles(newFiles).then(processedFiles => {
      setUploadedFiles(prev => [...prev, ...processedFiles]);
    });
    setShowFileUploader(false);
  }, [processFiles]);

  // Remove a file from the uploaded list
  const handleRemoveFile = useCallback((fileId: string): void => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  }, []);

  // Clear all files
  const clearFiles = useCallback((): void => {
    setUploadedFiles([]);
  }, []);

  // Submit the message with any uploaded files
  const handleSubmitMessage = async (): Promise<void> => {
    if ((!userInput.trim() && uploadedFiles.length === 0) || isLoading) return;

    try {
      await handleSendMessage({
        text: userInput.trim(),
        files: uploadedFiles.map(item => item.file)
      });
      
      // Reset state after sending
      setUserInput('');
      setUploadedFiles([]);
      setShowFileUploader(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

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
      
      {showFileUploader && <FileUploadPanel onFileSelect={handleFileSelect} />}
      
      <div className="input-container">
        <div className="input-box">
          <MessageComposer
            userInput={userInput}
            setUserInput={setUserInput}
            onSendMessage={handleSubmitMessage}
            disabled={isLoading || isListening || isSpeaking}
            isListening={isListening}
            placeholder={uploadedFiles.length > 0 
              ? `Add a message about your ${uploadedFiles.length} file(s)...` 
              : "Type your message here... (Shift+Enter for new line)"}
          />
          
          <button 
            className={`upload-button ${showFileUploader ? 'active' : ''}`} 
            onClick={handleToggleFileUploader}
            title="Upload files"
            aria-label="Upload files"
          >
            <AnimatedPlusIcon isActive={showFileUploader} />
            {uploadedFiles.length > 0 && (
              <span className="file-count">{uploadedFiles.length}</span>
            )}
          </button>
          
          <button 
            className={`send-button ${(isLoading || isListening) ? 'disabled' : ''}`} 
            onClick={handleSubmitMessage} 
            disabled={isLoading || (!userInput.trim() && uploadedFiles.length === 0) || isListening || isSpeaking}
          >
            {isLoading ? (
              <span className="loading-spinner"></span>
            ) : (
              <FiSend />
            )}
          </button>
        </div>
        
        {isLoading && <div className="thinking-text">AI is thinking...</div>}
        
        {uploadedFiles.length > 0 && (
          <FileAttachments 
            files={uploadedFiles}
            onRemoveFile={handleRemoveFile}
            onClearAll={clearFiles}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(ChatInput);