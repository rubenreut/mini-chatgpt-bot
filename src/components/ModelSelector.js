import React from 'react';

const ModelSelector = ({ selectedModel, onModelChange }) => {
  const models = [
    { id: 'gpt-4', name: 'GPT-4 (Powerful)' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Fast)' },
  ];

  return (
    <div className="model-selector">
      <label htmlFor="model-select">Model:</label>
      <select 
        id="model-select" 
        value={selectedModel} 
        onChange={(e) => onModelChange(e.target.value)}
        className="model-select-dropdown"
      >
        {models.map(model => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default React.memo(ModelSelector);
