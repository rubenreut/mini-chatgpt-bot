import { apiClient, ApiEndpoint } from './client';
import { Message, FileWithPreview } from '../../shared/types';

export interface ChatCompletionRequest {
  messages: Message[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  files?: Array<FileWithPreview>;
}

export interface ChatCompletionStreamOptions {
  onChunk: (chunk: Message) => void;
  onComplete: (message: Message) => void;
  onError: (error: any) => void;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: Message;
    finish_reason: string;
  }[];
}

/**
 * Enhanced chat service with better API interactions:
 * - Request validation
 * - File preprocessing for context
 * - Streaming support
 * - Request cancellation
 */
class ChatService {
  private abortController: AbortController | null = null;

  /**
   * Process files to enhance chat messages
   */
  private processFiles(messages: Message[], files: FileWithPreview[]): Message[] {
    if (!files.length) return messages;

    // Get the last user message
    const lastUserMsgIndex = messages.findIndex(m => m.role === 'user');
    if (lastUserMsgIndex === -1) return messages;

    const enhancedMessages = [...messages];
    const userMsg = messages[lastUserMsgIndex];
    
    // Create file information to add to user message
    const fileList = files.map(file => 
      `- ${file.name} (${file.type}, ${(file.size / 1024).toFixed(1)} KB)`
    ).join('\n');
    
    let fileContents = '';
    for (const file of files) {
      if (file.preview && !file.type.startsWith('image/')) {
        fileContents += `\n\n--------- CONTENT OF FILE: ${file.name} ---------\n`;
        fileContents += file.preview;
        fileContents += '\n----------- END OF FILE CONTENT -----------';
      } else {
        fileContents += `\n\n[${file.type.startsWith('image/') ? 'Image' : 'File'}: ${file.name}]`;
      }
    }
    
    // Add file information to the user message
    enhancedMessages[lastUserMsgIndex] = {
      ...userMsg,
      content: `${userMsg.content}\n\nAttached files:\n${fileList}${fileContents}`,
    };
    
    return enhancedMessages;
  }

  /**
   * Send a chat completion request
   */
  async sendChatCompletion(request: ChatCompletionRequest): Promise<Message> {
    // Validate API key
    const apiKey = apiClient.getApiKey();
    if (!apiKey) {
      throw new Error('No API key provided. Please enter your OpenAI API key.');
    }
    
    // Process request and handle files
    const enhancedMessages = this.processFiles(request.messages, request.files || []);
    
    // Build request payload
    const payload = {
      model: request.model,
      messages: enhancedMessages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens,
      stream: false,
    };
    
    // Cancel any existing request
    this.cancelRequest();
    
    // Make the API request
    const response = await apiClient.post<ChatCompletionResponse>(
      ApiEndpoint.CHAT_COMPLETIONS,
      payload,
      {
        retry: 2,
        cache: {
          // Only cache when there are no files (as they might contain dynamic content)
          enabled: !request.files?.length,
          // Generate a key based on messages and model only (ignoring temperature etc)
          key: `chat:${request.model}:${JSON.stringify(enhancedMessages)}`,
        },
      }
    );
    
    return response.choices[0].message;
  }

  /**
   * Stream chat completion response
   */
  async streamChatCompletion(
    request: ChatCompletionRequest, 
    options: ChatCompletionStreamOptions
  ): Promise<void> {
    // Validate API key
    const apiKey = apiClient.getApiKey();
    if (!apiKey) {
      throw new Error('No API key provided. Please enter your OpenAI API key.');
    }
    
    // Process request and handle files
    const enhancedMessages = this.processFiles(request.messages, request.files || []);
    
    // Build request payload
    const payload = {
      model: request.model,
      messages: enhancedMessages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens,
      stream: true,
    };
    
    // Create abort controller for cancellation
    this.cancelRequest();
    this.abortController = new AbortController();
    
    try {
      // Make streaming request (manually, not through apiClient)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: this.abortController.signal,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error streaming response');
      }
      
      // Process the SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get response reader');
      
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let completeMessage: Message = { role: 'assistant', content: '' };
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Process lines in the buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last (potentially incomplete) line
        
        for (const line of lines) {
          // Skip empty lines or [DONE]
          if (!line.trim() || line === 'data: [DONE]') continue;
          
          // Parse the SSE data
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            try {
              const data = JSON.parse(dataStr);
              if (data.choices && data.choices[0]?.delta) {
                const { role, content } = data.choices[0].delta;
                
                // Update the complete message
                if (role) completeMessage.role = role;
                if (content) completeMessage.content += content;
                
                // Send the chunk to callback
                if (content) {
                  options.onChunk({ role: 'assistant', content });
                }
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
      
      // Finalize the streaming
      options.onComplete(completeMessage);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream request cancelled');
      } else {
        options.onError(error);
      }
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Get available models
   */
  async getModels() {
    return apiClient.get(ApiEndpoint.MODELS, undefined, {
      cache: { ttl: 24 * 60 * 60 * 1000 } // Cache for 24 hours
    });
  }

  /**
   * Cancel the current request
   */
  cancelRequest(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

// Create and export singleton
export const chatService = new ChatService();

export default chatService;