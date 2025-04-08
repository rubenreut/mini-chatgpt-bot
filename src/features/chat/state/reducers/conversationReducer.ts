import { ActionType } from '../actionTypes';
import { Conversation } from '../../../../shared/types';

export interface ConversationState {
  conversations: Conversation[];
  activeConversationId: string | null;
  showConversationList: boolean;
  conversationTitle: string;
  systemPrompt: string;
  showSystemPromptEditor: boolean;
}

type ConversationAction = 
  | { type: ActionType.UPDATE_CONVERSATIONS; payload: Conversation[] }
  | { type: ActionType.SET_CONVERSATION_LIST_VISIBILITY; payload: boolean }
  | { type: ActionType.SET_ACTIVE_CONVERSATION; payload: { id: string; messages: any[]; title: string; systemPrompt: string } }
  | { type: ActionType.SET_CONVERSATION_TITLE; payload: string }
  | { type: ActionType.TOGGLE_SYSTEM_PROMPT_EDITOR; payload: boolean }
  | { type: ActionType.SET_SYSTEM_PROMPT; payload: string };

/**
 * Reducer for managing conversations
 */
export const conversationReducer = (
  state: ConversationState,
  action: ConversationAction
): ConversationState => {
  switch (action.type) {
    case ActionType.UPDATE_CONVERSATIONS:
      return { ...state, conversations: action.payload };
      
    case ActionType.SET_CONVERSATION_LIST_VISIBILITY:
      return { ...state, showConversationList: action.payload };
      
    case ActionType.SET_ACTIVE_CONVERSATION:
      return { 
        ...state, 
        activeConversationId: action.payload.id,
        conversationTitle: action.payload.title,
        systemPrompt: action.payload.systemPrompt
      };
      
    case ActionType.SET_CONVERSATION_TITLE:
      return { ...state, conversationTitle: action.payload };
      
    case ActionType.TOGGLE_SYSTEM_PROMPT_EDITOR:
      return { ...state, showSystemPromptEditor: action.payload };
      
    case ActionType.SET_SYSTEM_PROMPT:
      return { ...state, systemPrompt: action.payload };
      
    default:
      return state;
  }
};