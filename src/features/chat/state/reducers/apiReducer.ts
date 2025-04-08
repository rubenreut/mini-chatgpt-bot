import { ActionType } from '../actionTypes';

export interface ApiState {
  apiKey: string;
  showApiKeyModal: boolean;
  model: string;
}

type ApiAction = 
  | { type: ActionType.SET_API_KEY; payload: string }
  | { type: ActionType.TOGGLE_API_KEY_MODAL; payload: boolean }
  | { type: ActionType.SET_MODEL; payload: string };

/**
 * Reducer for managing API and model settings
 */
export const apiReducer = (
  state: ApiState,
  action: ApiAction
): ApiState => {
  switch (action.type) {
    case ActionType.SET_API_KEY:
      return { ...state, apiKey: action.payload };
      
    case ActionType.TOGGLE_API_KEY_MODAL:
      return { ...state, showApiKeyModal: action.payload };
      
    case ActionType.SET_MODEL:
      return { ...state, model: action.payload };
      
    default:
      return state;
  }
};