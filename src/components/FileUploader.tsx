import React, { useState, useRef, useCallback, useEffect } from 'react';

// Supported file types
const SUPPORTED_FILE_TYPES = {
  'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  'document': ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'code': ['text/javascript', 'text/typescript', 'text/html', 'text/css', 'application/json', 'text/markdown'],
  'data': ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

// Max file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface FileUploaderProps {
  onFileUpload: (files: FileWithPreview[]) => void;
  loading: boolean;
  maxFiles?: number;
  maxSizePerFile?: number;
  allowedFileTypes?: string[];
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileUpload,
  loading,
  maxFiles = 5,
  maxSizePerFile = MAX_FILE_SIZE,
  allowedFileTypes,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSizePerFile) {
      return `File too large (max ${formatFileSize(maxSizePerFile)})`;
    }
    
    // Check file type if restrictions are provided
    if (allowedFileTypes && allowedFileTypes.length > 0) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type.toLowerCase();
      
      const matchesAllowedType = allowedFileTypes.some(type => {
        // Check if it's a category like 'image' or 'document'
        if (SUPPORTED_FILE_TYPES[type as keyof typeof SUPPORTED_FILE_TYPES]) {
          return SUPPORTED_FILE_TYPES[type as keyof typeof SUPPORTED_FILE_TYPES].includes(mimeType);
        }
        // Or check direct extension or mime type
        return (
          mimeType === type || 
          `.${fileExtension}` === type ||
          fileExtension === type.replace('.', '')
        );
      });
      
      if (!matchesAllowedType) {
        return `File type not supported`;
      }
    }
    
    return null;
  }, [allowedFileTypes, maxSizePerFile]);

  const generatePreview = useCallback(async (file: File): Promise<FileWithPreview> => {
    // Generate a unique ID for the file
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Clean filename from path information
    const fileName = file.name.split('\\').pop()?.split('/').pop() || file.name;
    
    // Create base file object with metadata
    const fileWithPreview: FileWithPreview = {
      ...file,
      id,
      fileName,
      preview: '',
    };
    
    // Add preview and line count based on file type
    if (file.type.startsWith('image/')) {
      // Create image thumbnail
      try {
        const preview = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
        
        fileWithPreview.preview = preview;
      } catch (error) {
        console.error('Error generating image preview:', error);
      }
    } else if (
      file.type.startsWith('text/') || 
      file.type === 'application/json' || 
      file.name.endsWith('.md') || 
      file.name.endsWith('.txt') ||
      file.name.endsWith('.js') ||
      file.name.endsWith('.ts') ||
      file.name.endsWith('.css') ||
      file.name.endsWith('.html') ||
      file.name.endsWith('.csv')
    ) {
      // Calculate line count for text files
      try {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string || '');
          reader.onerror = (e) => reject(e);
          
          // For large files, limit reading to first few KB for preview
          if (file.size > 100 * 1024) { // 100KB
            reader.readAsText(file.slice(0, 5 * 1024)); // Read first 5KB for preview
          } else {
            reader.readAsText(file);
          }
        });
        
        // Calculate line count
        const lines = content.split('\n');
        fileWithPreview.lineCount = lines.length;
        
        // Create preview for text content
        fileWithPreview.preview = lines.slice(0, 10).join('\n') + 
          (lines.length > 10 ? '\n...' : '');
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
      }
    } else if (file.type === 'application/pdf') {
      fileWithPreview.preview = 'PDF document';
    }
    
    return fileWithPreview;
  }, []);

  const handleFiles = useCallback(async (fileList: FileList) => {
    if (files.length >= maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    setIsGeneratingPreviews(true);
    const errors: Record<string, string> = {};
    const processedFiles: FileWithPreview[] = [];
    const newFiles = Array.from(fileList);
    
    // Limit to max files
    const filesToProcess = newFiles.slice(0, maxFiles - files.length);
    
    // Process files in batches
    const batchSize = 3; // Process 3 files at a time
    
    for (let i = 0; i < filesToProcess.length; i += batchSize) {
      const batch = filesToProcess.slice(i, i + batchSize);
      
      // Process batch in parallel
      const batchResults = await Promise.all(batch.map(async (file) => {
        const error = validateFile(file);
        
        if (error) {
          errors[file.name] = error;
          return null;
        }
        
        try {
          return await generatePreview(file);
        } catch (err) {
          console.error(`Error processing ${file.name}:`, err);
          errors[file.name] = 'Error processing file';
          return null;
        }
      }));
      
      // Add valid files from batch
      processedFiles.push(...batchResults.filter(Boolean) as FileWithPreview[]);
    }
    
    setFileErrors(errors);
    setFiles(prevFiles => [...prevFiles, ...processedFiles]);
    
    if (processedFiles.length > 0) {
      onFileUpload(processedFiles);
    }
    
    setIsGeneratingPreviews(false);
  }, [files.length, maxFiles, onFileUpload, validateFile, generatePreview]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = useCallback((id: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
  }, []);

  const clearAllFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const handleButtonClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Remove files when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview && file.preview.startsWith('blob:')) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const acceptedFileTypesMessage = (() => {
    if (!allowedFileTypes || allowedFileTypes.length === 0) {
      return 'PDFs, images, text files, and more';
    }
    
    const categories = allowedFileTypes.filter(type => 
      SUPPORTED_FILE_TYPES[type as keyof typeof SUPPORTED_FILE_TYPES]
    );
    
    const extensions = allowedFileTypes.filter(type => 
      !SUPPORTED_FILE_TYPES[type as keyof typeof SUPPORTED_FILE_TYPES]
    );
    
    const parts = [];
    
    if (categories.includes('image')) parts.push('images');
    if (categories.includes('document')) parts.push('documents');
    if (categories.includes('code')) parts.push('code files');
    if (categories.includes('data')) parts.push('data files');
    
    if (extensions.length > 0) {
      parts.push(extensions.join(', '));
    }
    
    return parts.join(', ');
  })();

  return (
    <div className="file-uploader">
      <div 
        className={`file-drop-area ${dragActive ? 'active' : ''} ${loading || isGeneratingPreviews ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={(loading || isGeneratingPreviews) ? undefined : handleDrop}
        onClick={(loading || isGeneratingPreviews) ? undefined : handleButtonClick}
        aria-disabled={loading || isGeneratingPreviews}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleChange}
          disabled={loading || isGeneratingPreviews}
          className="file-input"
          aria-label="File input"
        />
        <div className="file-drop-message">
          <div className="upload-icon-container">
            {isGeneratingPreviews ? (
              <div className="loading-spinner" aria-label="Processing files"></div>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#2ea44f"/>
                <path d="M12 7v10M7 12h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
          <div className="drop-text">
            <h3>Upload files</h3>
            <p>Drag and drop files here or click to browse</p>
            <span className="file-types">{acceptedFileTypesMessage}</span>
            {maxFiles && (
              <span className="file-limit">Maximum {maxFiles} files</span>
            )}
          </div>
        </div>
      </div>
      
      {Object.keys(fileErrors).length > 0 && (
        <div className="file-errors">
          <h4>File upload issues:</h4>
          <ul>
            {Object.entries(fileErrors).map(([fileName, error]) => (
              <li key={fileName}>
                <span className="file-error-name">{fileName}:</span> {error}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {files.length > 0 && (
        <div className="file-list">
          <div className="file-list-header">
            <h4>Attached Files ({files.length})</h4>
            <button 
              className="clear-all-button" 
              onClick={clearAllFiles}
              disabled={loading || isGeneratingPreviews}
              aria-label="Remove all files"
            >
              Remove all
            </button>
          </div>
          <ul>
            {files.map(file => (
              <li key={file.id} className="file-item">
                <div className="file-icon">
                  {file.type.startsWith('image/') ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" fill="currentColor"/>
                    </svg>
                  ) : file.type.includes('pdf') ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm12 6V9c0-.55-.45-1-1-1h-2v5h2c.55 0 1-.45 1-1zm-2-3h1v3h-1V9zm4 2h1v-1h-1V9h1V8h-2v5h1v-1zm-8 0h1c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1H9v5h1v-2zm0-2h1v1h-1V9z" fill="currentColor"/>
                    </svg>
                  ) : file.type.includes('csv') || file.type.includes('spreadsheet') ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H7v-2h4v2zm0-4H7v-2h4v2zm0-4H7V7h4v2zm8 8h-6v-2h6v2zm0-4h-6v-2h6v2zm0-4h-6V7h6v2z" fill="currentColor"/>
                    </svg>
                  ) : file.name.endsWith('.js') || file.name.endsWith('.ts') || file.name.endsWith('.jsx') || file.name.endsWith('.tsx') ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" fill="currentColor"/>
                    </svg>
                  )}
                </div>
                <div className="file-info">
                  <span className="file-name">{file.fileName}</span>
                  <div className="file-details">
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    {file.lineCount !== undefined && (
                      <span className="file-lines">{file.lineCount} {file.lineCount === 1 ? 'line' : 'lines'}</span>
                    )}
                  </div>
                </div>
                <button 
                  className="file-remove" 
                  onClick={() => removeFile(file.id)}
                  disabled={loading || isGeneratingPreviews}
                  aria-label={`Remove ${file.fileName}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
                  </svg>
                </button>
                
                {file.preview && file.type.startsWith('image/') && (
                  <div className="file-preview image-preview">
                    <img src={file.preview} alt={file.fileName} />
                  </div>
                )}
                
                {file.preview && !file.type.startsWith('image/') && file.preview.length > 0 && (
                  <div className="file-preview text-preview">
                    <pre>{file.preview}</pre>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default React.memo(FileUploader);