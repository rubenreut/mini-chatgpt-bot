import React, { useState, useRef, useCallback } from 'react';
import { FiSend, FiPaperclip, FiX } from 'react-icons/fi';
import { MessageData } from '../../../shared/types';

interface ChatInputProps {
  handleSendMessage: (messageData: MessageData) => Promise<void>;
  isLoading: boolean;
}

const ChatInput = ({ 
  handleSendMessage, 
  isLoading 
}: ChatInputProps): React.ReactNode => {
  const [userInput, setUserInput] = useState<string>('');
  const [isFileUploaderVisible, setIsFileUploaderVisible] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Automatically resize the textarea as content grows
  const handleTextareaResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  // Handle input changes and adjust textarea size
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setUserInput(e.target.value);
    handleTextareaResize();
  };

  // Handle key presses (Enter to send)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitMessage();
    }
  };

  // Toggle file uploader visibility
  const handleToggleFileUploader = (): void => {
    setIsFileUploaderVisible(!isFileUploaderVisible);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Remove a file from the uploaded list
  const handleRemoveFile = (index: number): void => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Submit the message with any uploaded files
  const handleSubmitMessage = async (): Promise<void> => {
    if ((!userInput.trim() && uploadedFiles.length === 0) || isLoading) return;

    try {
      await handleSendMessage({
        text: userInput.trim(),
        files: uploadedFiles
      });
      
      // Reset state after sending
      setUserInput('');
      setUploadedFiles([]);
      setIsFileUploaderVisible(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="chat-input-container">
      {/* File preview area */}
      {uploadedFiles.length > 0 && (
        <div className="file-preview-area">
          <h3>Attached Files:</h3>
          <ul className="file-list">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="file-item">
                <span className="file-name">{file.name}</span>
                <span className="file-size">({Math.round(file.size / 1024)} KB)</span>
                <button 
                  className="remove-file-button"
                  onClick={() => handleRemoveFile(index)}
                  aria-label={`Remove file ${file.name}`}
                >
                  <FiX />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* File uploader */}
      {isFileUploaderVisible && (
        <div className="file-uploader">
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            id="file-upload"
            className="file-input"
          />
          <label htmlFor="file-upload" className="file-upload-label">
            Select files or drop them here
          </label>
        </div>
      )}

      {/* Message input area */}
      <div className="input-area">
        <button
          className={`attachment-button ${isFileUploaderVisible ? 'active' : ''}`}
          onClick={handleToggleFileUploader}
          title="Attach files"
          aria-label="Attach files"
        >
          <FiPaperclip />
        </button>

        <textarea
          ref={textareaRef}
          className="message-input"
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={isLoading}
        />

        <button
          className="send-button"
          onClick={handleSubmitMessage}
          disabled={(!userInput.trim() && uploadedFiles.length === 0) || isLoading}
          title="Send message"
          aria-label="Send message"
        >
          {isLoading ? <div className="loader-small"></div> : <FiSend />}
        </button>
      </div>
    </div>
  );
};

export default React.memo(ChatInput);