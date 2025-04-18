import React, { useState, useRef, useEffect } from 'react';
import VoiceInput from './VoiceInput';
import AnimatedPlusIcon from './AnimatedPlusIcon';
import { useChatContext } from '../context/ChatContext';
import { debounce } from '../utils/debounce';
import { MessageData } from '../shared/types';

interface ChatInputProps {
  onSendMessage: (messageData: MessageData) => void;
  loading: boolean;
}

interface ProcessedFile extends File {
  fileName: string;
  lineCount: number | null;
  id: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, loading }) => {
  const [userInput, setUserInput] = useState<string>('');
  const [showFileUploader, setShowFileUploader] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<ProcessedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { 
    isListening, 
    setIsListening, 
    handleVoiceInput, 
    voiceEnabled, 
    toggleVoiceFeatures,
    isSpeaking,
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
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

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

  // Improved file upload with optimized processing and web workers if available
  const handleFileUpload = (newFiles: File[]) => {
    // Show file uploader and process files asynchronously
    const processFiles = async () => {
      // Process files in batches using Promise.all
      const batchSize = 3; // Process 3 files at a time
      const batches = [];
      
      // Create batches of files
      for (let i = 0; i < newFiles.length; i += batchSize) {
        batches.push(newFiles.slice(i, i + batchSize));
      }
      
      const processedFiles: ProcessedFile[] = [];
      
      // Process each batch sequentially to avoid overwhelming the browser
      for (const batch of batches) {
        const batchResults = await Promise.all(batch.map(async (file) => {
          // Get just the filename without path
          const fileName = file.name.split('\\').pop()?.split('/').pop() || file.name;
          
          // Calculate lines of code for text files
          let lineCount: number | null = null;
          
          if (
            file.type.startsWith('text/') || 
            file.type === 'application/json' || 
            file.name.endsWith('.md') || 
            file.name.endsWith('.txt') ||
            file.name.endsWith('.csv')
          ) {
            lineCount = await new Promise<number | null>(resolve => {
              const reader = new FileReader();
              reader.onload = (e) => {
                // Use a more efficient way to count lines
                const content = e.target?.result as string;
                if (content) {
                  const lines = (content.match(/\n/g) || []).length + 1;
                  resolve(lines);
                } else {
                  resolve(null);
                }
              };
              reader.onerror = () => resolve(null);
              
              // Only read the first megabyte for very large files
              if (file.size > 1024 * 1024) {
                reader.readAsText(file.slice(0, 1024 * 1024));
              } else {
                reader.readAsText(file);
              }
            });
          }
          
          return {
            ...file,
            fileName,
            lineCount,
            id: Date.now() + Math.random().toString(36).substr(2, 9) // Unique ID
          } as ProcessedFile;
        }));
        
        processedFiles.push(...batchResults);
        
        // Update state incrementally for better UX with many files
        setUploadedFiles(prev => [...prev, ...batchResults]);
        
        // Small delay between batches to keep UI responsive
        if (batches.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
    };
    
    // Start processing files and hide uploader
    processFiles();
    setShowFileUploader(false);
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
    const messageData: MessageData = {
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
        <div className="upload-options-menu">
          <div className="upload-option" onClick={() => document.getElementById('file-input')?.click()}>
            <span role="img" aria-hidden="true" style={{ fontSize: '1.4rem' }}>📄</span>
            <span>Upload a file</span>
            <input 
              id="file-input"
              type="file" 
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileUpload(Array.from(e.target.files));
                }
              }}
            />
          </div>
          <div className="upload-option">
            <span role="img" aria-hidden="true" style={{ fontSize: '1.4rem' }}>🐙</span>
            <span>Add from GitHub</span>
          </div>
          <div className="upload-option">
            <span role="img" aria-hidden="true" style={{ fontSize: '1.4rem' }}>📁</span>
            <span>Add from Google Drive</span>
          </div>
        </div>
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
          <div className="files-summary">
            <div className="file-attachments">
              {uploadedFiles.map((file) => (
                <div className="file-attachment" key={file.id}>
                  <div className="file-attachment-header">
                    <div className="file-attachment-name" title={file.fileName || file.name || "File"}>
                      {file.fileName || file.name || "File"}
                    </div>
                  </div>
                  <div className="file-attachment-content">
                    <div className="file-lines-count">
                      {file.lineCount ? `${file.lineCount} lines` : ''}
                    </div>
                    <div className="file-attachment-icon">
                      {file.type && file.type.startsWith('image/') ? (
                        '🖼️'
                      ) : file.type && file.type.includes('pdf') ? (
                        '📄'
                      ) : (file.type && file.type.includes('spreadsheet')) || (file.name && file.name.endsWith('.csv')) ? (
                        '📊'
                      ) : (file.type && file.type.includes('javascript')) || (file.name && file.name.endsWith('.js')) ? (
                        '📜'
                      ) : file.type && file.type.includes('html') ? (
                        '🌐'
                      ) : (
                        '📝'
                      )}
                    </div>
                  </div>
                  <div className="file-attachment-details">
                    <div className="file-attachment-type">
                      {file.name ? 
                        file.name.includes('.') ? 
                          `.${file.name.split('.').pop()}` : 
                          (file.type ? `.${file.type.split('/')[1]}` : '')
                        : 
                        (file.type ? `.${file.type.split('/')[1]}` : '')}
                    </div>
                  </div>
                  <button 
                    className="file-attachment-remove"
                    onClick={() => {
                      setUploadedFiles(files => files.filter(f => f.id !== file.id));
                    }}
                    aria-label="Remove file"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            {uploadedFiles.length > 0 && (
              <button className="clear-attachments" onClick={clearFiles}>
                <span>×</span> Clear all attachments
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ChatInput);