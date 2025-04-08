import React, { useState, useEffect } from 'react';

// Use types from globals.d.ts for Web Speech API

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onTranscript, 
  isListening, 
  setIsListening 
}) => {
  // transcript state is used internally but may appear unused
  const [transcript, setTranscript] = useState<string>('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [error, setError] = useState<string>('');

  // Initialize speech recognition on component mount
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError('Speech recognition is not available in this browser.');
        return;
      }
      
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        
        // Call the provided callback
        onTranscript(currentTranscript);
        
        // Also call the global handler if available (for compatibility)
        if (window.handleVoiceTranscript) {
          window.handleVoiceTranscript(currentTranscript);
        }
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