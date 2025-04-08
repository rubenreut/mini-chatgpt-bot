import React from 'react';
import { Model } from '../../../shared/types';
import styles from './ModelSelector.module.css';

interface ModelSelectorProps {
  selectedModel: string;
  handleModelChange: (modelId: string) => void;
}

const ModelSelector = ({ selectedModel, handleModelChange }: ModelSelectorProps): React.ReactNode => {
  const models: Model[] = [
    { id: 'gpt-4', name: 'GPT-4 (Powerful)' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Fast)' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    handleModelChange(e.target.value);
  };

  return (
    <div className={styles.modelSelector}>
      <label htmlFor="model-select">Model:</label>
      <select 
        id="model-select" 
        value={selectedModel} 
        onChange={handleChange}
        className={styles.selectDropdown}
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