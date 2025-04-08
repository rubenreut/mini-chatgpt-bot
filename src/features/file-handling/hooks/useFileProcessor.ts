import { useCallback } from 'react';
import { FileWithPreview } from '../../../shared/types';

interface FileProcessorOptions {
  batchSize?: number;
  maxSizeBytes?: number;
  onProgress?: (processedCount: number, totalCount: number) => void;
}

/**
 * Custom hook for efficient file processing
 */
export const useFileProcessor = (options: FileProcessorOptions = {}) => {
  const { 
    batchSize = 3,
    maxSizeBytes = 1048576, // 1MB default
    onProgress
  } = options;

  /**
   * Create a preview for a file
   */
  const createFilePreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else {
        // For non-image files, use a generic icon or file type icon
        resolve(`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23888" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1 5 5h-5V3zM6 20V4h6v5h5v11H6z"/></svg>`);
      }
    });
  }, []);

  /**
   * Process a single file
   */
  const processFile = useCallback(async (file: File): Promise<FileWithPreview> => {
    if (file.size > maxSizeBytes) {
      throw new Error(`File size exceeds maximum limit of ${maxSizeBytes / 1024 / 1024}MB`);
    }
    
    const preview = await createFilePreview(file);
    
    return {
      file,
      preview,
      name: file.name,
      size: file.size,
      type: file.type
    };
  }, [createFilePreview, maxSizeBytes]);

  /**
   * Process multiple files in batches
   */
  const processFiles = useCallback(async (files: File[]): Promise<FileWithPreview[]> => {
    const results: FileWithPreview[] = [];
    const fileArray = Array.from(files);
    const totalFiles = fileArray.length;
    
    // Process files in batches to avoid overwhelming the browser
    for (let i = 0; i < totalFiles; i += batchSize) {
      const batch = fileArray.slice(i, i + batchSize);
      
      // Process each batch concurrently
      const batchResults = await Promise.all(
        batch.map(file => processFile(file).catch(error => {
          console.error(`Error processing file ${file.name}:`, error);
          // Return null for failed files
          return null;
        }))
      );
      
      // Filter out null results from failed processing
      const validResults = batchResults.filter(Boolean) as FileWithPreview[];
      results.push(...validResults);
      
      // Report progress if callback provided
      if (onProgress) {
        onProgress(Math.min(i + batchSize, totalFiles), totalFiles);
      }
    }
    
    return results;
  }, [batchSize, processFile, onProgress]);

  return { processFiles };
};

export default useFileProcessor;