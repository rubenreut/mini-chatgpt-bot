import React from 'react';

interface FileUploadPanelProps {
  onFileSelect: (files: FileList) => void;
}

const FileUploadPanel: React.FC<FileUploadPanelProps> = ({ onFileSelect }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
    }
  };
  
  return (
    <div className="upload-options-menu">
      <div className="upload-option" onClick={() => document.getElementById('file-input')?.click()}>
        <span role="img" aria-hidden="true" style={{ fontSize: '1.4rem' }}>📄</span>
        <span>Upload a file</span>
        <input 
          id="file-input"
          type="file" 
          multiple
          style={{ display: 'none' }}
          onChange={handleFileChange}
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
  );
};

export default React.memo(FileUploadPanel);