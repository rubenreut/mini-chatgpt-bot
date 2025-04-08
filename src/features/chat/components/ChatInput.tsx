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
import styles from './ChatInput.module.css';

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

  // Build upload button classname
  const uploadButtonClasses = [
    styles.uploadButton,
    showFileUploader ? styles.active : ''
  ].filter(Boolean).join(' ');

  // Build send button classname
  const sendButtonClasses = [
    styles.sendButton,
    (isLoading || isListening) ? styles.disabled : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.inputArea}>
      <ToolbarControls
        onSystemPromptClick={() => setShowSystemPromptEditor(true)}
        voiceEnabled={voiceEnabled}
        toggleVoiceFeatures={toggleVoiceFeatures}
        isListening={isListening}
        setIsListening={setIsListening}
        onVoiceTranscript={handleVoiceInput}
      />
      
      {showFileUploader && <FileUploadPanel onFileSelect={handleFileSelect} />}
      
      <div className={styles.inputContainer}>
        <div className={styles.inputBox}>
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
            className={uploadButtonClasses} 
            onClick={handleToggleFileUploader}
            title="Upload files"
            aria-label="Upload files"
          >
            <AnimatedPlusIcon isActive={showFileUploader} />
            {uploadedFiles.length > 0 && (
              <span className={styles.fileCount}>{uploadedFiles.length}</span>
            )}
          </button>
          
          <button 
            className={sendButtonClasses} 
            onClick={handleSubmitMessage} 
            disabled={isLoading || (!userInput.trim() && uploadedFiles.length === 0) || isListening || isSpeaking}
          >
            {isLoading ? (
              <span className={styles.loadingSpinner}></span>
            ) : (
              <FiSend />
            )}
          </button>
        </div>
        
        {isLoading && <div className={styles.thinkingText}>AI is thinking...</div>}
        
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