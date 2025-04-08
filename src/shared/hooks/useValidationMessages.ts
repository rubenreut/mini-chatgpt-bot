// Reusable validation message utility
export const useValidationMessages = () => {
  const messages = {
    required: (field: string) => `${field} is required`,
    min: (field: string, min: number) => `${field} must be at least ${min} characters`,
    max: (field: string, max: number) => `${field} cannot exceed ${max} characters`,
    pattern: (field: string) => `${field} is invalid`,
    email: () => 'Please enter a valid email address',
    url: () => 'Please enter a valid URL',
    numeric: () => 'Please enter a numeric value',
    minValue: (min: number) => `Value must be greater than or equal to ${min}`,
    maxValue: (max: number) => `Value must be less than or equal to ${max}`,
    fileType: (types: string) => `Only ${types} files are allowed`,
    fileSize: (size: string) => `File size cannot exceed ${size}`,
    passwordMatch: () => 'Passwords do not match',
    apiKey: () => 'Invalid API key format',
  };

  return messages;
};

export default useValidationMessages;