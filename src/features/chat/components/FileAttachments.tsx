import React from 'react';
import { FiX } from 'react-icons/fi';
import { FileWithPreview } from '../../../shared/types';

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
  if (files.length === 0) return null;

  return (
    <div className="files-summary">
      <div className="file-attachments">
        {files.map((file) => (
          <div className="file-attachment" key={file.id}>
            <div className="file-attachment-header">
              <div className="file-attachment-name" title={file.name}>
                {file.name}
              </div>
            </div>
            <div className="file-attachment-content">
              <div className="file-attachment-icon">
                {file.type && file.type.startsWith('image/') ? (
                  '🖼️'
                ) : file.type && file.type.includes('pdf') ? (
                  '📄'
                ) : (file.type && file.type.includes('spreadsheet')) || (file.name.endsWith('.csv')) ? (
                  '📊'
                ) : (file.type && file.type.includes('javascript')) || (file.name.endsWith('.js')) ? (
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
                {file.name.includes('.') ? 
                  `.${file.name.split('.').pop()}` : 
                  (file.type ? `.${file.type.split('/')[1]}` : '')}
              </div>
              <div className="file-attachment-size">
                {Math.round(file.size / 1024)} KB
              </div>
            </div>
            <button 
              className="file-attachment-remove"
              onClick={() => onRemoveFile(file.id)}
              aria-label="Remove file"
            >
              <FiX />
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