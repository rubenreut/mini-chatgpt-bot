import { useState, useRef, useCallback, useEffect } from 'react';
import { debounce } from '../utils/debounce';
import { useChatContext } from '../context/ChatContext';

export interface ChatInputProps {
  onSendMessage: (messageData: { text: string; files: FileWithPreview[] }) => void;
  loading: boolean;
}

export const useChatInput = ({ onSendMessage, loading }: ChatInputProps) => {
  const [userInput, setUserInput] = useState<string>('');
  const [showFileUploader, setShowFileUploader] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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

  // Update input when voice recognition provides a transcript
  useEffect(() => {
    if (isListening) {
      const handleTranscript = debounce((text: string) => {
        setUserInput(text);
      }, 300);
      
      // Add voice transcript handler to window object
      // Cast the debounced function to the correct type
      window.handleVoiceTranscript = (text: string) => handleTranscript(text);
      
      return () => {
        window.handleVoiceTranscript = undefined;
      };
    }
  }, [isListening, setUserInput]);

  // Improved file upload with optimized processing
  const handleFileUpload = useCallback((newFiles: FileList) => {
    // Process files asynchronously
    const processFiles = async () => {
      // Process files in batches using Promise.all
      const batchSize = 3; // Process 3 files at a time
      const batches = [];
      
      // Create batches of files
      for (let i = 0; i < newFiles.length; i += batchSize) {
        batches.push(Array.from(newFiles).slice(i, i + batchSize));
      }
      
      const processedFiles: FileWithPreview[] = [];
      
      // Process each batch sequentially
      for (const batch of batches) {
        const batchResults = await Promise.all(batch.map(async (file) => {
          // Get just the filename without path
          const fileName = file.name.split('\\').pop()?.split('/').pop() || file.name;
          
          // Calculate lines of code for text files
          let lineCount = null;
          
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
                const lines = (content.match(/\n/g) || []).length + 1;
                resolve(lines);
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
          } as FileWithPreview;
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
  }, []);

  const toggleFileUploader = useCallback(() => {
    setShowFileUploader(prev => !prev);
  }, []);

  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, []);

  const sendMessage = useCallback(() => {
    if ((!userInput.trim() && uploadedFiles.length === 0) || loading) return;
    
    // Create message data
    const messageData = {
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
  }, [userInput, uploadedFiles, loading, onSendMessage]);

  const handleButtonClick = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return {
    userInput,
    setUserInput,
    showFileUploader,
    toggleFileUploader,
    uploadedFiles,
    handleFileUpload,
    clearFiles,
    removeFile,
    textareaRef,
    handleKeyDown,
    sendMessage,
    handleButtonClick,
    isListening,
    setIsListening,
    handleVoiceInput,
    voiceEnabled,
    toggleVoiceFeatures,
    isSpeaking,
    systemPrompt,
    setShowSystemPromptEditor,
    loading
  };
};