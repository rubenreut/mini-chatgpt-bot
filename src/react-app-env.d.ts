/// <reference types="react-scripts" />

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  error?: boolean;
  errorType?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

interface FileWithPreview extends File {
  id: string;
  fileName: string;
  lineCount?: number | null;
  preview?: string;
}

// Speech synthesis types
interface SpeechOptions {
  onEnd?: () => void;
  onError?: () => void;
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

// Add global window properties
interface Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
  handleVoiceTranscript?: ((text: string) => void) | undefined;
}