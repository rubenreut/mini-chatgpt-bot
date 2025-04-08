import React, { useState, useEffect } from 'react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
}

// Define a type for our speech recognition instance
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
  item(index: number): SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult;
  item(index: number): SpeechRecognitionResult;
  length: number;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, isListening, setIsListening }) => {
  const [transcript, setTranscript] = useState<string>('');
  const [recognition, setRecognition] = useState<SpeechRecognitionInstance | null>(null);
  const [error, setError] = useState<string>('');

  // Initialize speech recognition on component mount
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // Use the appropriate speech recognition implementation
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition() as SpeechRecognitionInstance;
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        onTranscript(currentTranscript);
      };
      
      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setError(`Error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        if (isListening) {
          recognitionInstance.start();
        }
      };
      
      setRecognition(recognitionInstance);
    } else {
      setError('Speech recognition is not supported in this browser.');
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Handle changes to isListening state
  useEffect(() => {
    if (!recognition) return;
    
    if (isListening) {
      try {
        recognition.start();
        setError('');
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setError('Failed to start voice recognition');
      }
    } else {
      recognition.stop();
      setTranscript('');
    }
    
    return () => {
      if (recognition && isListening) {
        recognition.stop();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, recognition]);

  return (
    <button 
      className={`voice-input-button ${isListening ? 'listening' : ''} ${error ? 'error' : ''}`}
      onClick={() => setIsListening(!isListening)}
      title={error || (isListening ? 'Stop listening' : 'Start voice input')}
      disabled={!!error}
      aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
    >
      {isListening ? (
        <span className="listening-indicator">🎤</span>
      ) : (
        <span role="img" aria-hidden="true">🎤</span>
      )}
    </button>
  );
};

export default React.memo(VoiceInput);