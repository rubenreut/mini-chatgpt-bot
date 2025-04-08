import { useCallback } from 'react';
import { FileData } from '../types';

export interface FileWithPreview extends File {
  id: string;
  fileName?: string;
  lineCount?: number | null;
  preview?: string;
}

interface FileProcessorOptions {
  batchSize?: number;
  maxSizeBytes?: number;
}

export const useFileProcessor = (options: FileProcessorOptions = {}) => {
  const { 
    batchSize = 3,          // Process 3 files at a time by default
    maxSizeBytes = 1048576  // 1MB by default
  } = options;

  const processFiles = useCallback(async (files: File[]): Promise<FileWithPreview[]> => {
    // Process files in batches
    const batches: File[][] = [];
    
    // Create batches of files
    for (let i = 0; i < files.length; i += batchSize) {
      batches.push(files.slice(i, i + batchSize));
    }
    
    const processedFiles: FileWithPreview[] = [];
    
    // Process each batch sequentially
    for (const batch of batches) {
      const batchResults = await Promise.all(batch.map(async (file) => {
        // Get just the filename without path
        const fileName = file.name.split('\\').pop()?.split('/').pop() || file.name;
        
        // Calculate lines of code for text files
        let lineCount = null;
        let preview = '';
        
        if (
          file.type.startsWith('text/') || 
          file.type === 'application/json' || 
          file.name.endsWith('.md') || 
          file.name.endsWith('.txt') ||
          file.name.endsWith('.csv')
        ) {
          try {
            const content = await readFileContent(file, maxSizeBytes);
            const lines = (content.match(/\n/g) || []).length + 1;
            lineCount = lines;
            
            // Create a short preview
            preview = content.length > 200 
              ? content.substring(0, 200) + '...' 
              : content;
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
          }
        } else if (file.type.startsWith('image/')) {
          try {
            preview = await createImagePreview(file);
          } catch (error) {
            console.error(`Error creating image preview for ${file.name}:`, error);
          }
        }
        
        return {
          ...file,
          fileName,
          lineCount,
          preview,
          id: Date.now() + Math.random().toString(36).substring(2, 9) // Unique ID
        } as FileWithPreview;
      }));
      
      processedFiles.push(...batchResults);
      
      // Small delay between batches to keep UI responsive
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return processedFiles;
  }, [batchSize, maxSizeBytes]);

  return { processFiles };
};

// Helper function to read file content
const readFileContent = (file: File, maxSizeBytes: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    
    // Only read the first maxSizeBytes for very large files
    if (file.size > maxSizeBytes) {
      reader.readAsText(file.slice(0, maxSizeBytes));
    } else {
      reader.readAsText(file);
    }
  });
};

// Helper function to create image preview
const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => reject(new Error("Failed to create image preview"));
    reader.readAsDataURL(file);
  });
};

export default useFileProcessor;