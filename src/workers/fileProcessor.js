/**
 * Web Worker for processing files
 * This allows file processing to happen off the main thread
 */

// Handle messages from main thread
self.onmessage = function(e) {
  const { file, type, maxSizeBytes = 1048576 } = e.data;
  
  try {
    if (type === 'validate') {
      // Check file size
      if (file.size > maxSizeBytes) {
        self.postMessage({
          status: 'error',
          fileId: file.id || file.name,
          error: `File size exceeds maximum limit of ${Math.round(maxSizeBytes / 1024 / 1024)}MB`,
        });
        return;
      }
      
      // Validate file successfully
      self.postMessage({
        status: 'validated',
        fileId: file.id || file.name,
      });
    } 
    else if (type === 'process') {
      // Process file based on type
      if (file.type.startsWith('image/')) {
        processImageFile(file);
      } else {
        processGenericFile(file);
      }
    }
  } catch (error) {
    self.postMessage({
      status: 'error',
      fileId: file.id || file.name,
      error: error.message || 'Error processing file',
    });
  }
};

/**
 * Process an image file - create preview and extract metadata
 */
function processImageFile(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    const preview = e.target.result;
    
    // Create a new image to get dimensions
    const img = new Image();
    img.onload = function() {
      self.postMessage({
        status: 'complete',
        fileId: file.id || file.name,
        result: {
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
          preview: preview,
          metadata: {
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height,
          }
        }
      });
    };
    
    img.onerror = function() {
      self.postMessage({
        status: 'error',
        fileId: file.id || file.name,
        error: 'Failed to load image dimensions',
      });
    };
    
    img.src = preview;
  };
  
  reader.onerror = function() {
    self.postMessage({
      status: 'error',
      fileId: file.id || file.name,
      error: 'Failed to read file',
    });
  };
  
  reader.readAsDataURL(file);
}

/**
 * Process a generic (non-image) file
 */
function processGenericFile(file) {
  // Generate a generic file icon based on file type
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
  const genericPreview = createGenericFilePreview(fileExtension, file.type);
  
  self.postMessage({
    status: 'complete',
    fileId: file.id || file.name,
    result: {
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
      preview: genericPreview,
      metadata: {
        extension: fileExtension,
      }
    }
  });
}

/**
 * Create a generic file preview based on file type
 */
function createGenericFilePreview(extension, mimeType) {
  let iconType = 'document';
  
  // Determine icon type based on file extension or MIME type
  if (['pdf'].includes(extension) || mimeType === 'application/pdf') {
    iconType = 'pdf';
  } else if (['doc', 'docx'].includes(extension) || mimeType.includes('word')) {
    iconType = 'word';
  } else if (['xls', 'xlsx'].includes(extension) || mimeType.includes('excel')) {
    iconType = 'excel';
  } else if (['ppt', 'pptx'].includes(extension) || mimeType.includes('presentation')) {
    iconType = 'powerpoint';
  } else if (['zip', 'rar', 'tar', 'gz'].includes(extension) || mimeType.includes('archive')) {
    iconType = 'archive';
  } else if (['txt', 'rtf', 'md'].includes(extension) || mimeType.includes('text')) {
    iconType = 'text';
  } else if (['html', 'htm', 'css', 'js'].includes(extension) || mimeType.includes('html')) {
    iconType = 'code';
  }
  
  // SVG icons for common file types
  const icons = {
    document: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23888" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1 5 5h-5V3zM6 20V4h6v5h5v11H6z"/></svg>`,
    pdf: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23e74c3c" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1 5 5h-5V3zm-2 14c-2.5 0-3.5-1.3-3.5-2.5 0-1.3 1-2.5 3.5-2.5 2.7 0 3.5 1.7 3.5 2.5 0 .8-.7 2.5-3.5 2.5zM14 10H7v2h7v-2z"/></svg>`,
    word: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%232b579a" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1 5 5h-5V3zm-3 11v-2h5v2h-5zm0 2h5v2h-5v-2zm-2-4h1v6H8v-6z"/></svg>`,
    excel: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23217346" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1 5 5h-5V3zm-8 7h3v2H5v-2zm0 4h3v2H5v-2zm0 4h3v2H5v-2zm5-8h4v2h-4v-2zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2z"/></svg>`,
    powerpoint: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23d24726" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1 5 5h-5V3zm-3 9c1.1 0 2-.9 2-2s-.9-2-2-2H7v8h2v-3h1c1.1 0 2-.9 2-2s-.9-2-2-2h-1v1z"/></svg>`,
    archive: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23ffa000" d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2zm0 4h4v2h-4V8zm0 3h4v2h-4v-2zm0 3h4v2h-4v-2z"/></svg>`,
    text: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23607d8b" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1 5 5h-5V3zM6 20V4h6v5h5v11H6zm2-4h8v2H8v-2zm0-2h8v-2H8v2zm0-4h8V8H8v2z"/></svg>`,
    code: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%233f51b5" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1 5 5h-5V3zM9 16.2L6.8 14l2.2-2.2-1.4-1.4L4 14l3.6 3.6L9 16.2zm6.6-1.4L18.2 14l-2.6-2.6 1.4-1.4L21 14l-4 4-1.4-1.4z"/></svg>`
  };
  
  return icons[iconType] || icons.document;
}