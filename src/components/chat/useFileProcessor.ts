import { useState, useCallback } from 'react';
import { FileData } from '../../types';

export interface UseFileProcessorOptions {
  batchSize?: number;
  maxSizeBytes?: number;
}

export const useFileProcessor = (options: UseFileProcessorOptions = {}) => {
  const { 
    batchSize = 3,          // Process 3 files at a time by default
    maxSizeBytes = 1048576  // 1MB by default
  } = options;
  
  const [files, setFiles] = useState<FileData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Process uploaded files in batches
  const processFiles = useCallback(async (rawFiles: File[]): Promise<FileData[]> => {
    setIsProcessing(true);
    
    try {
      // Create batches of files
      const batches: File[][] = [];
      for (let i = 0; i < rawFiles.length; i += batchSize) {
        batches.push(rawFiles.slice(i, i + batchSize));
      }
      
      const processedFiles: FileData[] = [];
      
      // Process each batch sequentially to avoid overwhelming the browser
      for (const batch of batches) {
        const batchResults = await Promise.all(batch.map(async (file) => {
          // Process file and create a FileData object
          const fileData: FileData = {
            name: file.name,
            type: file.type,
            size: file.size
          };
          
          // For text files, try to read content
          if (
            file.type.startsWith('text/') || 
            file.type === 'application/json' || 
            file.name.endsWith('.md') || 
            file.name.endsWith('.txt') ||
            file.name.endsWith('.csv')
          ) {
            try {
              const content = await readFileAsText(file, maxSizeBytes);
              fileData.content = content;
            } catch (error) {
              console.error(`Error reading file ${file.name}:`, error);
            }
          }
          
          return fileData;
        }));
        
        processedFiles.push(...batchResults);
        
        // Update state incrementally for better UX with many files
        setFiles(prev => [...prev, ...batchResults]);
        
        // Small delay between batches to keep UI responsive
        if (batches.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      return processedFiles;
    } finally {
      setIsProcessing(false);
    }
  }, [batchSize, maxSizeBytes]);

  // Add new files to the current list
  const addFiles = useCallback(async (rawFiles: File[]) => {
    const newFiles = await processFiles(rawFiles);
    setFiles(prev => [...prev, ...newFiles]);
    return newFiles;
  }, [processFiles]);
  
  // Reset file list
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);
  
  // Remove a single file by name
  const removeFile = useCallback((fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
  }, []);

  return {
    files,
    isProcessing,
    processFiles,
    addFiles,
    clearFiles,
    removeFile
  };
};

// Helper to read file content as text
const readFileAsText = (file: File, maxSizeBytes: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file content'));
      }
    };
    
    reader.onerror = () => reject(reader.error);
    
    // For large files, limit reading to specified max size
    if (file.size > maxSizeBytes) {
      reader.readAsText(file.slice(0, maxSizeBytes));
    } else {
      reader.readAsText(file);
    }
  });
};

export default useFileProcessor;