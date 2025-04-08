# Mini ChatGPT Bot

A lightweight, responsive React-based chat interface that connects to OpenAI's API for a ChatGPT-like experience right in your browser.

## Features

- 💬 Simple, clean chat interface with dark/light mode
- 🔐 Client-side API key storage (your key never leaves your device)
- 📝 Markdown and code syntax highlighting
- 📱 Mobile-friendly responsive design
- 📚 Multi-conversation support and management
- 🔄 Model selection (GPT-4/GPT-3.5 Turbo)
- 🎮 System prompt customization
- 📎 Enhanced file upload support with previews and validation
- 🗣️ Voice input and text-to-speech capabilities
- 💾 Chat history persistence
- 📤 Export conversation feature
- ⌨️ Command palette (⌘K) and keyboard shortcuts
- 📊 Performance optimizations with virtualization
- 🔍 Type safety with TypeScript
- ✅ Comprehensive tests with Jest and Cypress

## Setup

1. Clone this repository
2. Install dependencies:
```bash
npm install --legacy-peer-deps
```
3. Start the development server:
```bash
npm start
```
4. Open http://localhost:3000 in your browser

## Usage

1. When you first open the app, you'll be prompted to enter your OpenAI API key
2. Get an API key from [OpenAI API keys](https://platform.openai.com/api-keys) if you don't have one
3. Start chatting with the model!

## Advanced Features

### Conversation Management
- **Multiple Conversations**: Maintain separate chat threads for different topics
- **Conversation History**: All chats are saved in browser storage
- **Editable Titles**: Rename conversations for better organization
- **Export**: Save your conversation as a text file

### Model & System Prompt
- **Model Selection**: Choose between GPT-4 (more powerful) and GPT-3.5 Turbo (faster responses)
- **Custom System Prompts**: Customize the AI's behavior with system instructions

### Enhanced File Handling
- **File Upload**: Attach PDFs, images, CSVs, and other files to your messages
- **Drag & Drop**: Easy file uploading with drag and drop interface
- **Multiple Files**: Support for attaching multiple files at once
- **File Previews**: Preview text and image files before sending
- **File Validation**: Validate file types and sizes
- **Large File Handling**: Efficient processing of large files

### Voice Features
- **Voice Input**: Speak your messages instead of typing (browser support required)
- **Text-to-Speech**: Have the AI read responses aloud
- **Voice Toggle**: Easily enable/disable voice features

### UI Customization
- **Theme Toggle**: Switch between light and dark themes
- **Mobile Responsive**: Works well on all devices
- **Command Palette**: Press ⌘K (or Ctrl+K) to access commands quickly
- **Keyboard Shortcuts**: Efficiency shortcuts for common actions
  - Alt+N: New chat
  - Alt+E: Export conversation
  - Alt+T: Toggle theme
  - Alt+L: Toggle conversation list
  - Alt+P: Edit system prompt
  - ?: Show keyboard shortcuts help

## Development Features

### TypeScript Integration
- Full TypeScript support with type definitions
- Interface definitions for better developer experience
- Type-safe components and hooks

### State Management
- React Query for API state management
- React Context API for global state
- React useReducer for complex state logic

### Testing
- Jest and React Testing Library for unit tests
- Cypress for end-to-end and component tests
- Test scripts in package.json

```bash
# Run Jest unit tests
npm test

# Run Cypress tests
npm run cy:open     # Interactive mode
npm run test:e2e    # Headless mode
npm run test:component # Component tests
```

### Performance Optimizations
- Virtualized message list for handling large conversations
- Memoized components to prevent unnecessary re-renders
- Async file processing with batching
- Efficient request handling with React Query

## Project Structure

- `/components` - Reusable UI components (written in TypeScript)
- `/context` - React context for state management
- `/hooks` - Custom React hooks
- `/utils` - Utility functions and helper tools
- `/cypress` - End-to-end and component tests
- `/src/**/*.test.tsx` - Unit tests

## Technologies Used

- React with TypeScript
- React Query for API state management
- React Hook Form for form handling
- React Testing Library and Cypress for testing
- Axios for API requests
- react-markdown with remark-gfm
- Prism.js for syntax highlighting
- React Window for virtualization
- Web Speech API for voice features

## Security Notes

This application stores your OpenAI API key in browser localStorage and uses it for API requests directly from your browser to OpenAI. For enhanced security:

- We never send your API key to any server besides OpenAI
- Consider implementing a server-side proxy in production to avoid exposing API keys
- All data is processed locally in your browser

## Browser Compatibility

- Chrome (desktop and mobile)
- Edge
- Safari (desktop and iOS)
- Firefox

Voice features require a modern browser with Web Speech API support.

## Future Improvements

- Server-side proxy for API requests
- OIDC/OAuth authentication
- More extensive file type support
- Streaming responses
- Collaborative features
- Mobile app wrapper (React Native)

---

For any questions or issues, please open an issue in this repository.