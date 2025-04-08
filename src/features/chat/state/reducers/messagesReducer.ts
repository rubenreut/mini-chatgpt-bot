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
      return { ...state, messages: [...state.messages, action.payload] };
      
    case ActionType.SET_LOADING:
      return { ...state, loading: action.payload };
      
    case ActionType.SET_ACTIVE_CONVERSATION:
      return { ...state, messages: action.payload.messages };
      
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