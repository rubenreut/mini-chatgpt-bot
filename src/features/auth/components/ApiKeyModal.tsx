import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Button, Card, FormField } from '../../../shared/components';
import { useValidationMessages } from '../../../shared/hooks';
import { useStorage, useErrorHandler } from '../../../shared/utils';
import styles from './ApiKeyModal.module.css';

interface ApiKeyForm {
  apiKey: string;
}

interface ApiKeyModalProps {
  apiKey: string;
  setApiKey: (apiKey: string) => void;
  onSubmit: (apiKey: string) => void;
  showModal: boolean;
  onCancel?: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ 
  apiKey, 
  setApiKey, 
  onSubmit, 
  showModal,
  onCancel
}) => {
  const validationMessages = useValidationMessages();
  const storage = useStorage();
  const { handleError } = useErrorHandler();
  
  const methods = useForm<ApiKeyForm>({
    defaultValues: {
      apiKey: apiKey || ''
    },
    mode: 'onChange'
  });
  
  const { handleSubmit, formState: { isValid, isSubmitting } } = methods;
  
  const handleFormSubmit = (data: ApiKeyForm) => {
    try {
      // Store the API key in localStorage for persistence
      storage.set('apiKey', data.apiKey);
      
      // Update state and notify parent component
      setApiKey(data.apiKey);
      onSubmit(data.apiKey);
      
      return data.apiKey;
    } catch (error) {
      handleError(error, {
        context: { action: 'save_api_key' }
      });
    }
  };
  
  if (!showModal) return null;
  
  return (
    <div className={styles.overlay}>
      <Card className={styles.container}>
        <h2 className={styles.title}>Enter your OpenAI API Key</h2>
        <p className={styles.subtitle}>
          To use this application, you need to provide your own OpenAI API key. 
          This allows you to use your own quota and manage your costs directly.
        </p>
        
        <FormProvider {...methods}>
          <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
            <FormField
              name="apiKey"
              label="API Key"
              type="password"
              placeholder="sk-..."
              autoFocus
              autoComplete="off"
              rules={{
                required: validationMessages.required('API key'),
                pattern: {
                  value: /^sk-[a-zA-Z0-9]{32,}$/,
                  message: validationMessages.apiKey()
                }
              }}
              helperText="Your key will be stored securely in your browser's local storage"
            />
            
            <div className={styles.formFooter}>
              {onCancel && (
                <Button 
                  type="button" 
                  variant="text" 
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              
              <Button 
                type="submit" 
                variant="primary"
                disabled={!isValid}
                isLoading={isSubmitting}
              >
                Save API Key
              </Button>
            </div>
          </form>
        </FormProvider>
        
        <p className={styles.help}>
          Your API key is stored locally in your browser and is never sent to our servers.
          <br />
          Don't have an API key? Get one from{" "}
          <a 
            className={styles.link}
            href="https://platform.openai.com/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Get API key from OpenAI website"
          >
            OpenAI's website
          </a>
          .
        </p>
      </Card>
    </div>
  );
};

export default React.memo(ApiKeyModal);