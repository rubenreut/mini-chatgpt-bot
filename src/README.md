# Mini ChatGPT Bot - Code Structure

This application has been restructured to follow a feature-based architecture for better organization and maintainability. The main features are:

## Project Structure

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

### 1. Authentication
- API key management with secure storage

### 2. Chat Interface
- Message composition and display
- File attachments
- Voice input/output

### 3. Conversation Management
- Multiple conversations
- Import/Export functionality
- System prompt customization

### 4. Theme Management
- Dark/Light mode toggle
- System preference detection

## Custom Hooks
The application uses several custom hooks to separate logic from UI:

- `useChatService`: Manages API communication with OpenAI
- `useConversationManager`: Handles conversation state
- `useFileProcessor`: Processes file uploads efficiently

## TypeScript Implementation
The entire application has been migrated to TypeScript for better type safety and developer experience.

## React Query
API state management is handled with React Query for better caching, loading states, and error handling.

## Getting Started
1. `npm install` - Install dependencies
2. `npm start` - Start the development server
3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser