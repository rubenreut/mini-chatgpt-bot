import { useState, useCallback, useEffect, useRef } from 'react';
import { FileWithPreview } from '../../../shared/types';

interface FileWorkerOptions {
  maxSizeBytes?: number;
  onProgress?: (processedCount: number, totalCount: number) => void;
}

interface WorkerResult {
  status: 'complete' | 'error' | 'validated';
  fileId: string;
  result?: Omit<FileWithPreview, 'file'> & { 
    file: { name: string; size: number; type: string; };
    metadata?: Record<string, any>;
  };
  error?: string;
}

/**
 * Custom hook that processes files using a Web Worker
 * This moves heavy file processing off the main thread for better performance
 */
export const useFileWorker = (options: FileWorkerOptions = {}) => {
  const { 
    maxSizeBytes = 1048576, // 1MB default
    onProgress 
  } = options;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processedFiles, setProcessedFiles] = useState<FileWithPreview[]>([]);
  
  // Keep a ref to the worker to avoid recreating it on each render
  const workerRef = useRef<Worker | null>(null);
  
  // Mapping of file IDs to original File objects
  const fileMapRef = useRef<Map<string, File>>(new Map());
  
  // Processing status for each file
  const [processingStatus, setProcessingStatus] = useState<Record<string, {
    status: 'pending' | 'processing' | 'complete' | 'error';
    error?: string;
  }>>({});
  
  // Initialize the worker
  useEffect(() => {
    if (typeof Worker === 'undefined') {
      console.error('Web Workers are not supported in this browser');
      return;
    }
    
    // Create the worker
    const worker = new Worker('/src/workers/fileProcessor.ts');
    
    // Handle messages from the worker
    worker.onmessage = (e: MessageEvent<WorkerResult>) => {
      const { status, fileId, result, error } = e.data;
      
      // Update processing status
      setProcessingStatus(prev => ({
        ...prev,
        [fileId]: { 
          status: status === 'complete' ? 'complete' : status === 'error' ? 'error' : 'processing',
          error
        }
      }));
      
      // Handle completed file processing
      if (status === 'complete' && result) {
        // Get the original File object
        const originalFile = fileMapRef.current.get(fileId);
        
        if (originalFile) {
          // Generate a unique ID for the file
          const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Add processed file to results
          setProcessedFiles(prev => [...prev, {
            id,
            file: originalFile,
            preview: result.preview,
            name: result.file.name,
            size: result.file.size,
            type: result.file.type
          }]);
        }
      } 
      // Handle errors
      else if (status === 'error' && error) {
        console.error(`Error processing file ${fileId}:`, error);
        setError(error);
      }
    };
    
    // Handle worker errors
    worker.onerror = (e) => {
      console.error('Worker error:', e);
      setError('An error occurred while processing files');
    };
    
    workerRef.current = worker;
    
    // Clean up worker on unmount
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);
  
  // Process files using the worker
  const processFiles = useCallback(async (files: File[]): Promise<FileWithPreview[]> => {
    if (!workerRef.current) {
      throw new Error('Web Workers are not supported in this browser');
    }
    
    setLoading(true);
    setError(null);
    setProcessedFiles([]);
    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;
    let completedCount = 0;
    
    // Reset processing status
    const initialStatus: Record<string, { status: 'pending' | 'processing' | 'complete' | 'error' }> = {};
    fileArray.forEach(file => {
      const fileId = file.name + '_' + Date.now();
      fileMapRef.current.set(fileId, file);
      initialStatus[fileId] = { status: 'pending' };
    });
    
    setProcessingStatus(initialStatus);
    
    // Process each file in sequence to avoid overwhelming the worker
    for (const file of fileArray) {
      const fileId = file.name + '_' + Date.now();
      
      try {
        // First validate the file
        workerRef.current.postMessage({
          file,
          type: 'validate',
          maxSizeBytes
        });
        
        // Update status to processing
        setProcessingStatus(prev => ({
          ...prev,
          [fileId]: { status: 'processing' }
        }));
        
        // Then process the file
        workerRef.current.postMessage({
          file,
          type: 'process'
        });
        
        // Report progress
        completedCount++;
        if (onProgress) {
          onProgress(completedCount, totalFiles);
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        setProcessingStatus(prev => ({
          ...prev,
          [fileId]: { 
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }));
      }
    }
    
    // Wait for all files to be processed
    const checkCompletion = () => {
      const allComplete = Object.values(processingStatus).every(
        status => status.status === 'complete' || status.status === 'error'
      );
      
      if (allComplete) {
        setLoading(false);
        return processedFiles;
      }
      
      // Check again in 100ms
      return new Promise<FileWithPreview[]>(resolve => {
        setTimeout(() => resolve(checkCompletion()), 100);
      });
    };
    
    return checkCompletion();
  }, [maxSizeBytes, onProgress, processingStatus, processedFiles]);
  
  return {
    processFiles,
    loading,
    error,
    processingStatus,
    processedFiles
  };
};

export default useFileWorker;