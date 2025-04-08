import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';
import { ChatProvider } from './features/chat/context/ChatContext';
import { ThemeProvider } from './features/theme/context/ThemeContext';
import { ToastProvider } from './shared/contexts/ToastContext';
import { CommandPaletteProvider } from './context/commandPalette/CommandPaletteContext';
import ErrorBoundary from './utils/ErrorBoundary';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

// Create a client with defaults optimized for chat applications
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus for chat applications
      refetchOnWindowFocus: false,
      // Keep data fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Retry failed queries 3 times
      retry: 3,
      // Use exponential backoff for retries
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
    },
    mutations: {
      // Retry failed mutations 2 times
      retry: 2,
      // Use exponential backoff for retries
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ToastProvider position="top-right">
            <CommandPaletteProvider>
              <ChatProvider>
                <App />
              </ChatProvider>
            </CommandPaletteProvider>
          </ToastProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register service worker for offline capabilities
serviceWorker.register({
  onSuccess: () => {
    console.log('App is available offline.');
  },
  onUpdate: registration => {
    console.log('New version available, refresh to update.');
    // Here you could notify the user with a toast
  }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();