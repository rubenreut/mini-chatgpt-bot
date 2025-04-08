import { ActionType } from '../actionTypes';
import { Message } from '../../../../shared/types';

export interface MessagesState {
  messages: Message[];
  loading: boolean;
}

type MessagesAction = 
  | { type: ActionType.SET_MESSAGES; payload: Message[] }
  | { type: ActionType.ADD_MESSAGE; payload: Message }
  | { type: ActionType.SET_LOADING; payload: boolean }
  | { type: ActionType.SET_SYSTEM_PROMPT; payload: string }
  | { type: ActionType.SET_ACTIVE_CONVERSATION; payload: { messages: Message[]; id: string; title: string; systemPrompt: string } };

/**
 * Reducer for managing chat messages
 */
export const messagesReducer = (
  state: MessagesState,
  action: MessagesAction
): MessagesState => {
  switch (action.type) {
    case ActionType.SET_MESSAGES:
      return { ...state, messages: action.payload };
      
    case ActionType.ADD_MESSAGE:
      const addedMessages = [...state.messages, action.payload];
      console.log("Added message, now have", addedMessages.length, "messages");
      return { ...state, messages: addedMessages };
      
    case ActionType.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ActionType.SET_ACTIVE_CONVERSATION:
      // Make sure we properly load conversation messages including the system prompt
      const conversationMessages = [...action.payload.messages]; // Create a copy to ensure immutability
      console.log("Loading conversation with", conversationMessages.length, "messages");
      
      // Make sure we have at least a system message
      const hasSystemMsg = conversationMessages.some(msg => msg.role === 'system');
      if (!hasSystemMsg && action.payload.systemPrompt) {
        conversationMessages.unshift({
          role: 'system',
          content: action.payload.systemPrompt
        });
      }
      
      return { ...state, messages: conversationMessages };
      
    case ActionType.SET_SYSTEM_PROMPT:
      // Update system prompt and messages
      const hasSystem = state.messages.some(msg => msg.role === 'system');
      
      if (hasSystem) {
        // Create properly typed updated messages
        const updatedMessages: Message[] = state.messages.map(msg => 
          msg.role === 'system' ? { ...msg, content: action.payload } : msg
        );
        return { ...state, messages: updatedMessages };
      } else {
        // Create a properly typed system message
        const systemMessage: Message = { role: 'system', content: action.payload };
        return { ...state, messages: [systemMessage, ...state.messages] };
      }
      
    default:
      return state;
  }
};