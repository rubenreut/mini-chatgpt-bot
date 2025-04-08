/**
 * A utility for text-to-speech functionality using the Web Speech API
 */

class SpeechSynthesisHelper {
  constructor() {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.voiceMap = new Map(); // Cache voices by name
    this.preferredVoice = null;
  }

  // Initialize and load available voices
  init() {
    return new Promise((resolve) => {
      // Some browsers need a small delay before voices are available
      if (this.synth.getVoices().length > 0) {
        this._setupVoices();
        resolve();
      } else {
        this.synth.onvoiceschanged = () => {
          this._setupVoices();
          resolve();
        };
      }
    });
  }

  // Internal method to setup voices
  _setupVoices() {
    const voices = this.synth.getVoices();
    this.voiceMap.clear();
    
    voices.forEach(voice => {
      this.voiceMap.set(voice.name, voice);
    });
    
    // Try to find a good default voice (preferring natural-sounding ones)
    const preferredVoiceNames = [
      'Google UK English Female',
      'Microsoft Libby Online (Natural)',
      'Samantha',
      'Google US English',
      'Microsoft David',
    ];
    
    for (const name of preferredVoiceNames) {
      if (this.voiceMap.has(name)) {
        this.preferredVoice = this.voiceMap.get(name);
        break;
      }
    }
    
    // Fallback to the first English voice if no preferred voice is found
    if (!this.preferredVoice) {
      this.preferredVoice = voices.find(voice => voice.lang.includes('en-'));
    }
    
    // Ultimate fallback to the first voice
    if (!this.preferredVoice && voices.length > 0) {
      this.preferredVoice = voices[0];
    }
  }

  // Speak the given text
  speak(text, options = {}) {
    // Cancel any ongoing speech
    this.stop();
    
    if (!text) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice (use preferred or specified)
    if (options.voiceName && this.voiceMap.has(options.voiceName)) {
      utterance.voice = this.voiceMap.get(options.voiceName);
    } else if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }
    
    // Set other options
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    
    // Handle events
    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;
    
    // Store the utterance reference to be able to cancel it
    this.utterance = utterance;
    
    // Start speaking
    this.synth.speak(utterance);
  }

  // Stop speaking
  stop() {
    this.synth.cancel();
    this.utterance = null;
  }

  // Pause speaking
  pause() {
    this.synth.pause();
  }

  // Resume speaking
  resume() {
    this.synth.resume();
  }

  // Get the list of available voices
  getVoices() {
    return Array.from(this.voiceMap.values());
  }

  // Check if the browser supports speech synthesis
  isSupported() {
    return 'speechSynthesis' in window;
  }

  // Check if currently speaking
  isSpeaking() {
    return this.synth.speaking;
  }
}

// Create a singleton instance
const speechSynthesis = new SpeechSynthesisHelper();
export default speechSynthesis;
