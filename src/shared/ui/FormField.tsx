import React from 'react';
import { useFormContext, Controller, RegisterOptions } from 'react-hook-form';
import { Input, InputProps } from './Input';
import { Textarea, TextareaProps } from './Textarea';
import styles from './FormField.module.css';

// Define which HTML input types will use the Input component vs other components
const TEXT_INPUT_TYPES = [
  'text', 'email', 'password', 'search', 'tel', 'url', 'number', 'date',
  'datetime-local', 'month', 'time', 'week', 'color'
];

export type FormFieldProps = {
  name: string;
  label?: string;
  helperText?: string;
  rules?: RegisterOptions;
  className?: string;
  containerClassName?: string;
} & (
  | ({ type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number' |
       'date' | 'datetime-local' | 'month' | 'time' | 'week' | 'color' } & Omit<InputProps, 'error'>)
  | ({ type: 'textarea' } & Omit<TextareaProps, 'error'>)
  | ({ type: 'custom'; component: React.ComponentType<any> } & Record<string, any>)
);

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  helperText,
  rules,
  className,
  containerClassName,
  ...rest
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name]?.message as string | undefined;
  const type = (rest as any).type || 'text';

  // Determine if we're using a custom component
  const isCustom = type === 'custom';
  // Determine if we're using an Input component
  const isInputField = !isCustom && TEXT_INPUT_TYPES.includes(type);
  // Determine if we're using a Textarea component
  const isTextareaField = type === 'textarea';

  return (
    <div className={`${styles.container} ${containerClassName || ''}`}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => {
          if (isCustom) {
            const { component: Component, ...customProps } = rest as any;
            return (
              <Component
                {...field}
                {...customProps}
                label={label}
                helperText={helperText}
                error={error}
                className={className}
              />
            );
          }
          
          if (isTextareaField) {
            return (
              <Textarea
                {...field}
                {...(rest as Omit<TextareaProps, 'error'>)}
                label={label}
                helperText={helperText}
                error={error}
                className={className}
              />
            );
          }
          
          // Default to Input for all other field types
          return (
            <Input
              {...field}
              {...(rest as Omit<InputProps, 'error'>)}
              label={label}
              helperText={helperText}
              error={error}
              className={className}
            />
          );
        }}
      />
    </div>
  );
};

export default FormField;