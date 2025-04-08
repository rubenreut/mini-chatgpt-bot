/**
 * Utility for managing conversation data in local storage
 */

class ConversationManager {
  constructor() {
    this.storageKey = 'mini_chatgpt_conversations';
    this.currentConversationKey = 'mini_chatgpt_current_conversation';
    this.maxConversations = 50; // Limit to prevent excessive storage usage
  }

  // Get all stored conversations
  getAllConversations() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving conversations:', error);
      return [];
    }
  }

  // Get a specific conversation by ID
  getConversation(id) {
    const conversations = this.getAllConversations();
    return conversations.find(convo => convo.id === id) || null;
  }

  // Get the active conversation ID
  getCurrentConversationId() {
    try {
      return localStorage.getItem(this.currentConversationKey) || null;
    } catch (error) {
      console.error('Error retrieving current conversation ID:', error);
      return null;
    }
  }

  // Set the active conversation ID
  setCurrentConversationId(id) {
    localStorage.setItem(this.currentConversationKey, id);
  }

  // Save a new conversation or update an existing one
  saveConversation(conversation) {
    try {
      const conversations = this.getAllConversations();
      const index = conversations.findIndex(c => c.id === conversation.id);
      
      if (index >= 0) {
        // Update existing conversation
        conversations[index] = {
          ...conversation,
          lastUpdated: new Date().toISOString()
        };
      } else {
        // Add new conversation
        conversations.unshift({
          ...conversation,
          id: conversation.id || this._generateId(),
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
        
        // Limit the number of stored conversations
        if (conversations.length > this.maxConversations) {
          conversations.pop();
        }
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(conversations));
      return conversations[index >= 0 ? index : 0].id;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return null;
    }
  }

  // Delete a conversation by ID
  deleteConversation(id) {
    try {
      let conversations = this.getAllConversations();
      conversations = conversations.filter(c => c.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(conversations));
      
      // If we deleted the current conversation, clear that reference
      const currentId = this.getCurrentConversationId();
      if (currentId === id) {
        localStorage.removeItem(this.currentConversationKey);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  // Create a new empty conversation
  createNewConversation(systemPrompt = 'You are a helpful assistant.') {
    const newConversation = {
      id: this._generateId(),
      title: 'New Conversation',
      messages: [
        { role: 'system', content: systemPrompt }
      ]
    };
    
    const id = this.saveConversation(newConversation);
    this.setCurrentConversationId(id);
    return newConversation;
  }

  // Update conversation title
  updateTitle(id, title) {
    const conversation = this.getConversation(id);
    if (conversation) {
      conversation.title = title;
      this.saveConversation(conversation);
      return true;
    }
    return false;
  }

  // Update system prompt for a conversation
  updateSystemPrompt(id, systemPrompt) {
    const conversation = this.getConversation(id);
    if (conversation) {
      // Find and update the system message
      const hasSystemMessage = conversation.messages.some(msg => msg.role === 'system');
      
      if (hasSystemMessage) {
        conversation.messages = conversation.messages.map(msg => 
          msg.role === 'system' ? { ...msg, content: systemPrompt } : msg
        );
      } else {
        conversation.messages.unshift({ role: 'system', content: systemPrompt });
      }
      
      this.saveConversation(conversation);
      return true;
    }
    return false;
  }

  // Generate a unique ID
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }
}

const conversationManager = new ConversationManager();
export default conversationManager;
