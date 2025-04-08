import { ActionType } from '../actionTypes';

export interface VoiceState {
  voiceEnabled: boolean;
  isListening: boolean;
  isSpeaking: boolean;
}

type VoiceAction = 
  | { type: ActionType.TOGGLE_VOICE_ENABLED; payload: boolean }
  | { type: ActionType.SET_LISTENING; payload: boolean }
  | { type: ActionType.SET_SPEAKING; payload: boolean };

/**
 * Reducer for managing voice features
 */
export const voiceReducer = (
  state: VoiceState,
  action: VoiceAction
): VoiceState => {
  switch (action.type) {
    case ActionType.TOGGLE_VOICE_ENABLED:
      return { ...state, voiceEnabled: action.payload };
      
    case ActionType.SET_LISTENING:
      return { ...state, isListening: action.payload };
      
    case ActionType.SET_SPEAKING:
      return { ...state, isSpeaking: action.payload };
      
    default:
      return state;
  }
};