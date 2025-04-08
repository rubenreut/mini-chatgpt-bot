import React, { FormEvent } from 'react';

interface ApiKeyModalProps {
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  showModal: boolean;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ apiKey, setApiKey, onSubmit, showModal }) => {
  if (!showModal) return null;
  
  return (
    <div className="api-key-overlay">
      <div className="api-key-container">
        <h2 className="api-key-title">Enter your OpenAI API Key</h2>
        <form className="api-key-form" onSubmit={onSubmit}>
          <input
            type="password"
            className="api-key-input"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            autoFocus
            autoComplete="off"
            aria-label="OpenAI API Key"
          />
          <button type="submit" className="api-key-button" disabled={!apiKey.trim().startsWith('sk-')}>
            Save API Key
          </button>
        </form>
        <p className="api-key-help">
          Your API key is stored locally in your browser and is never sent to our servers.
          <br />
          Don't have an API key? Get one from{" "}
          <a 
            href="https://platform.openai.com/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Get API key from OpenAI website"
          >
            OpenAI's website
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default React.memo(ApiKeyModal);