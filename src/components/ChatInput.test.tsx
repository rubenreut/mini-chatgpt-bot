import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatInput from './ChatInput';
import { ChatProvider } from '../context/ChatContext';
import { ThemeProvider } from '../context/ThemeContext';

// Mock context values
jest.mock('../context/ChatContext', () => ({
  useChatContext: () => ({
    isListening: false,
    setIsListening: jest.fn(),
    handleVoiceInput: jest.fn(),
    voiceEnabled: true,
    toggleVoiceFeatures: jest.fn(),
    isSpeaking: false,
    systemPrompt: 'You are a helpful assistant.',
    setShowSystemPromptEditor: jest.fn(),
  }),
  ChatProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../context/ThemeContext', () => ({
  useThemeContext: () => ({
    darkMode: false,
    toggleDarkMode: jest.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ChatInput Component', () => {
  const mockSendMessage = jest.fn();
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  test('renders input field and send button', () => {
    render(<ChatInput onSendMessage={mockSendMessage} loading={false} />);
    
    // Check if input field and send button are rendered
    expect(screen.getByPlaceholderText(/Type your message here/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });
  
  test('send button should be disabled when input is empty', () => {
    render(<ChatInput onSendMessage={mockSendMessage} loading={false} />);
    
    // Send button should be disabled initially
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });
  
  test('send button should be enabled when input has text', () => {
    render(<ChatInput onSendMessage={mockSendMessage} loading={false} />);
    
    // Type something in the input
    const input = screen.getByPlaceholderText(/Type your message here/i);
    fireEvent.change(input, { target: { value: 'Hello AI!' } });
    
    // Send button should be enabled
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).not.toBeDisabled();
  });
  
  test('should call onSendMessage when send button is clicked', () => {
    render(<ChatInput onSendMessage={mockSendMessage} loading={false} />);
    
    // Type something in the input
    const input = screen.getByPlaceholderText(/Type your message here/i);
    fireEvent.change(input, { target: { value: 'Hello AI!' } });
    
    // Click send button
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    // Check if onSendMessage was called with the right arguments
    expect(mockSendMessage).toHaveBeenCalledWith({
      text: 'Hello AI!',
      files: []
    });
    
    // Input should be cleared after sending
    expect(input).toHaveValue('');
  });
  
  test('send button should be disabled when loading', () => {
    render(<ChatInput onSendMessage={mockSendMessage} loading={true} />);
    
    // Type something in the input
    const input = screen.getByPlaceholderText(/Type your message here/i);
    fireEvent.change(input, { target: { value: 'Hello AI!' } });
    
    // Send button should still be disabled when loading
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });
  
  test('should show loading indicator when loading', () => {
    render(<ChatInput onSendMessage={mockSendMessage} loading={true} />);
    
    // Should show loading indicator
    expect(screen.getByText(/AI is thinking/i)).toBeInTheDocument();
  });
});