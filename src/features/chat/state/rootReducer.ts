import { messagesReducer, MessagesState } from './reducers/messagesReducer';
import { apiReducer, ApiState } from './reducers/apiReducer';
import { conversationReducer, ConversationState } from './reducers/conversationReducer';
import { voiceReducer, VoiceState } from './reducers/voiceReducer';
import { ActionType } from './actionTypes';

// Combine all state interfaces
export interface ChatState extends 
  MessagesState, 
  ApiState, 
  ConversationState, 
  VoiceState {}

// Action type for all possible actions
export type Action = 
  | { type: ActionType.SET_MESSAGES; payload: any[] }
  | { type: ActionType.ADD_MESSAGE; payload: any }
  | { type: ActionType.SET_LOADING; payload: boolean }
  | { type: ActionType.SET_API_KEY; payload: string }
  | { type: ActionType.TOGGLE_API_KEY_MODAL; payload: boolean }
  | { type: ActionType.SET_MODEL; payload: string }
  | { type: ActionType.UPDATE_CONVERSATIONS; payload: any[] }
  | { type: ActionType.SET_CONVERSATION_LIST_VISIBILITY; payload: boolean }
  | { type: ActionType.SET_ACTIVE_CONVERSATION; payload: { id: string; messages: any[]; title: string; systemPrompt: string } }
  | { type: ActionType.SET_CONVERSATION_TITLE; payload: string }
  | { type: ActionType.TOGGLE_SYSTEM_PROMPT_EDITOR; payload: boolean }
  | { type: ActionType.SET_SYSTEM_PROMPT; payload: string }
  | { type: ActionType.TOGGLE_VOICE_ENABLED; payload: boolean }
  | { type: ActionType.SET_LISTENING; payload: boolean }
  | { type: ActionType.SET_SPEAKING; payload: boolean };

/**
 * Root reducer that combines all sub-reducers
 * Each sub-reducer handles its own slice of state
 */
export function rootReducer(state: ChatState, action: Action): ChatState {
  // Extract slices of state for each sub-reducer
  const messagesState: MessagesState = {
    messages: state.messages,
    loading: state.loading
  };
  
  const apiState: ApiState = {
    apiKey: state.apiKey,
    showApiKeyModal: state.showApiKeyModal,
    model: state.model
  };
  
  const conversationState: ConversationState = {
    conversations: state.conversations,
    activeConversationId: state.activeConversationId,
    showConversationList: state.showConversationList,
    conversationTitle: state.conversationTitle,
    systemPrompt: state.systemPrompt,
    showSystemPromptEditor: state.showSystemPromptEditor
  };
  
  const voiceState: VoiceState = {
    voiceEnabled: state.voiceEnabled,
    isListening: state.isListening,
    isSpeaking: state.isSpeaking
  };
  
  // Apply each sub-reducer to its slice of state
  return {
    ...messagesReducer(messagesState, action as any),
    ...apiReducer(apiState, action as any),
    ...conversationReducer(conversationState, action as any),
    ...voiceReducer(voiceState, action as any)
  };
}