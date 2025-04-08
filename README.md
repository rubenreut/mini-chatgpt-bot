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
- 📎 File upload support (PDFs, images, CSVs, etc.)
- 🗣️ Voice input and text-to-speech capabilities
- 💾 Chat history persistence
- 📤 Export conversation feature

## Setup

1. Clone this repository
2. Install dependencies:
```bash
npm install
```
3. Set up your API key in the `.env` file:
```
REACT_APP_OPENAI_API_KEY=your-openai-api-key
```
4. Start the development server:
```bash
npm start
```
5. Open http://localhost:3000 in your browser

## Usage

1. The app uses the API key from your .env file
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

### File Handling
- **File Upload**: Attach PDFs, images, CSVs, and other files to your messages
- **Drag & Drop**: Easy file uploading with drag and drop interface
- **Multiple Files**: Support for attaching multiple files at once

### Voice Features
- **Voice Input**: Speak your messages instead of typing (browser support required)
- **Text-to-Speech**: Have the AI read responses aloud
- **Voice Toggle**: Easily enable/disable voice features

### UI Customization
- **Theme Toggle**: Switch between light and dark themes
- **Mobile Responsive**: Works well on all devices

## Project Structure

- `/components` - Reusable UI components
- `/context` - React context for state management
- `/utils` - Utility functions and helper tools

## Technologies Used

- React with Context API
- Axios for API requests
- react-markdown with remark-gfm
- Prism.js for syntax highlighting
- Web Speech API for voice features

## Security Notes

This application uses your OpenAI API key from the .env file. The key is included in API requests made directly from your browser to OpenAI. For security:

- Keep your .env file out of version control (.gitignore)
- Don't share your built application with others without removing the API key
- For production deployment, consider using a server-side proxy to keep your API key secure

## Browser Compatibility

Voice features require a modern browser with Web Speech API support. This includes:
- Chrome (desktop and mobile)
- Edge
- Safari (desktop and iOS)
- Firefox (partial support)

---

For any questions or issues, please open an issue in this repository.