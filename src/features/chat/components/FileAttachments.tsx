import React from 'react';
import { FiX } from 'react-icons/fi';
import { FileWithPreview } from '../../../shared/types';
import styles from './FileAttachments.module.css';

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
    <div className={styles.filesSummary}>
      <div className={styles.fileAttachments}>
        {files.map((file) => (
          <div className={styles.fileAttachment} key={file.id}>
            <div className={styles.fileAttachmentHeader}>
              <div className={styles.fileAttachmentName} title={file.name}>
                {file.name}
              </div>
            </div>
            <div className={styles.fileAttachmentContent}>
              <div className={styles.fileAttachmentIcon}>
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
            <div className={styles.fileAttachmentDetails}>
              <div className={styles.fileAttachmentType}>
                {file.name.includes('.') ? 
                  `.${file.name.split('.').pop()}` : 
                  (file.type ? `.${file.type.split('/')[1]}` : '')}
              </div>
              <div className={styles.fileAttachmentSize}>
                {Math.round(file.size / 1024)} KB
              </div>
            </div>
            <button 
              className={styles.fileAttachmentRemove}
              onClick={() => onRemoveFile(file.id)}
              aria-label="Remove file"
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
      
      <button className={styles.clearAttachments} onClick={onClearAll}>
        <span>×</span> Clear all attachments
      </button>
    </div>
  );
};

export default React.memo(FileAttachments);