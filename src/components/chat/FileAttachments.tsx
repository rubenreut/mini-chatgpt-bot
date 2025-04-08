import React from 'react';
import { FileWithPreview } from '../../hooks/useFileProcessor';

interface FileAttachmentsProps {
  files: FileWithPreview[];
  onRemoveFile: (fileId: string) => void;
  onClearAll: () => void;
}

const FileAttachments: React.FC<FileAttachmentsProps> = ({
  files,
  onRemoveFile,
  onClearAll
}) => {
  if (files.length === 0) {
    return null;
  }

  const getFileIcon = (file: FileWithPreview): string => {
    if (file.type && file.type.startsWith('image/')) {
      return '🖼️';
    } else if (file.type && file.type.includes('pdf')) {
      return '📄';
    } else if ((file.type && file.type.includes('spreadsheet')) || (file.name && file.name.endsWith('.csv'))) {
      return '📊';
    } else if ((file.type && file.type.includes('javascript')) || (file.name && file.name.endsWith('.js'))) {
      return '📜';
    } else if (file.type && file.type.includes('html')) {
      return '🌐';
    } else {
      return '📝';
    }
  };

  const getFileExtension = (file: FileWithPreview): string => {
    if (file.name) {
      if (file.name.includes('.')) {
        return `.${file.name.split('.').pop()}`;
      } else if (file.type) {
        return `.${file.type.split('/')[1]}`;
      }
    } else if (file.type) {
      return `.${file.type.split('/')[1]}`;
    }
    return '';
  };

  return (
    <div className="files-summary">
      <div className="file-attachments">
        {files.map((file) => (
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
                {getFileIcon(file)}
              </div>
            </div>
            <div className="file-attachment-details">
              <div className="file-attachment-type">
                {getFileExtension(file)}
              </div>
            </div>
            <button 
              className="file-attachment-remove"
              onClick={() => onRemoveFile(file.id)}
              aria-label="Remove file"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      <button className="clear-attachments" onClick={onClearAll}>
        <span>×</span> Clear all attachments
      </button>
    </div>
  );
};

export default React.memo(FileAttachments);