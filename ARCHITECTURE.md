# Mini ChatGPT Bot Architecture

## Overview

This application is a lightweight ChatGPT-like interface built with React and TypeScript. It features multiple conversations, file uploads, voice capabilities, and theme switching, all while maintaining good component separation and a responsive UI design.

## Project Structure

The project follows a feature-based directory structure to improve organization and maintainability:

```
src/
  /features
    /auth - Authentication related components (API key management)
    /chat - Chat interface components and logic
    /conversation - Conversation management components and logic
    /file-handling - File upload and processing utilities
    /theme - Theme switching and management
    /voice - Voice input and output capabilities
  /shared
    /components - Shared UI components used across features
    /hooks - Shared custom hooks
    /types - TypeScript type definitions
  App.tsx - Main application component
```

## Key Features

### 1. Theme Management

- Dark/Light mode toggle
- System preference detection
- Local storage persistence

### 2. Authentication

- API key management with local storage
- Secure input handling

### 3. Chat Interface

- Message composition
- File attachments
- Voice input/output
- Markdown rendering with syntax highlighting

### 4. Conversation Management

- Multiple conversations
- Conversation history
- Import/Export functionality
- System prompt customization

### 5. Error Handling

- API error management
- Retry logic with exponential backoff
- User-friendly error messages

## Technical Stack

- **React 18+**: UI library
- **TypeScript**: Type safety and developer experience
- **React Query**: API state management
- **Local Storage**: Data persistence
- **Web Speech API**: Voice input and output
- **Markdown rendering**: Enhanced message display

## Best Practices Implemented

1. **Custom Hooks**: Logic separation from UI components
2. **TypeScript**: Strong typing throughout the application
3. **Memoization**: Performance optimization with React.memo
4. **Context API**: Global state management
5. **Error Boundaries**: Graceful error handling
6. **Responsive Design**: Mobile-friendly UI
7. **Accessibility**: ARIA attributes and semantic HTML
8. **Feature-based Architecture**: Organized code structure