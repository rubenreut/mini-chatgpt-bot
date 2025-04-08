# Mini ChatGPT Bot Style Guide

This document outlines the coding standards and style conventions to be used in the Mini ChatGPT Bot codebase.

## TypeScript Component Patterns

### Component Definition

Use function components with explicit return type annotations:

```typescript
interface ComponentProps {
  // Props definition
  someProp: string;
  handleEvent: () => void;
}

const Component = ({ someProp, handleEvent }: ComponentProps): JSX.Element => {
  // Implementation
  return (
    <div>{someProp}</div>
  );
};

export default React.memo(Component);
```

### Naming Conventions

#### Components and Files

- Use **PascalCase** for component names and their files: `MessageList.tsx`
- Use **kebab-case** for CSS modules: `message-list.module.css`

#### Event Handlers

- Use the `handle` prefix for all event handler functions:
  ```typescript
  const handleClick = () => { /* ... */ };
  const handleSubmit = (e: FormEvent) => { /* ... */ };
  ```

- For props that accept handlers, use the `handle` prefix as well:
  ```typescript
  interface ButtonProps {
    handleClick: () => void;
  }
  ```

#### Boolean States and Props

- Use the `is` prefix for boolean state variables and props:
  ```typescript
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  ```

- Props should follow the same convention:
  ```typescript
  interface ModalProps {
    isOpen: boolean;
    isFullscreen?: boolean;
  }
  ```

## Project Structure

```
src/
├── features/                # Feature-based organization
│   ├── auth/                # Authentication-related components
│   ├── chat/                # Chat-related components
│   ├── conversation/        # Conversation management
│   ├── file-handling/       # File upload and processing
│   ├── theme/               # Theme-related components
│   └── voice/               # Voice recognition and synthesis
├── shared/                  # Shared utilities and types
│   ├── types/               # TypeScript interfaces and types
│   ├── utils/               # Shared utilities
│   └── components/          # Shared components
└── workers/                 # Web Workers
```

## CSS Styling

Use CSS modules for component styling:

```typescript
// Component.tsx
import styles from './Component.module.css';

const Component = (): JSX.Element => {
  return (
    <div className={styles.container}>
      <button className={styles.button}>Click me</button>
    </div>
  );
};
```

```css
/* Component.module.css */
.container {
  padding: 1rem;
}

.button {
  background-color: var(--primary-color);
}
```

## Error Handling

Use the standardized error handling utilities from `shared/utils/errorHandling.ts`:

```typescript
import { handleApiError, withErrorHandling } from '../../shared/utils/errorHandling';

// Try-catch pattern
try {
  await fetchData();
} catch (error) {
  const apiError = handleApiError(error);
  // Handle the typed error
}

// Using the withErrorHandling utility
const result = await withErrorHandling(
  async () => await fetchData(),
  (error) => {
    // Optional error handler
    console.error(error.message);
  }
);
```

## State Management

Use hooks for localized state, and context for application-wide state:

```typescript
// Local component state
const [inputValue, setInputValue] = useState('');

// Application state
const { messages, sendMessage } = useChatContext();
```

## Code Comments

- Add comments for complex logic
- Use JSDoc comments for functions and interfaces:

```typescript
/**
 * Processes a message before sending it to the API
 * @param message The raw message to process
 * @returns The processed message ready for API submission
 */
const processMessage = (message: string): FormattedMessage => {
  // Implementation
};
```

## Imports Organization

```typescript
// External dependencies
import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';

// Project imports - types and utilities
import { Message, ApiError } from '../../../shared/types';
import { handleApiError } from '../../../shared/utils/errorHandling';

// Project imports - components
import Button from '../../shared/components/Button';
import Spinner from '../../shared/components/Spinner';

// Styles
import styles from './Component.module.css';
```

## React Component Memoization

Use `React.memo` for components that don't need to re-render often:

```typescript
export default React.memo(Component);
```

Use `useCallback` for functions passed to child components:

```typescript
const handleSubmit = useCallback(() => {
  // Implementation
}, [dependency1, dependency2]);
```

Use `useMemo` for expensive computations:

```typescript
const sortedItems = useMemo(() => {
  return items.slice().sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```