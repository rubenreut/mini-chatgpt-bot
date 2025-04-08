# Changelog

## [Unreleased]

### Added
- Command Palette (⌘K) for quick navigation and actions
  - Accessible via Cmd/Ctrl+K keyboard shortcut
  - Provides searchable list of all available commands
  - Grouped by categories (Conversation, Interface, Help)
  - Shows keyboard shortcuts for each command
- Keyboard shortcuts for common actions
  - Alt+N: New Chat
  - Alt+E: Export Chat
  - Alt+T: Toggle Theme
  - Alt+L: Toggle Conversation List
  - Alt+P: Edit System Prompt
  - ?: Show Keyboard Shortcuts Help
- Keyboard Shortcuts Help modal showing all available shortcuts
- Virtualized Message List for performance optimization
  - Efficiently renders only the visible messages
  - Dynamic height measurement with ResizeObserver
  - Maintains smooth scrolling experience even with hundreds of messages
- Performance measurement utilities
  - Tools for measuring rendering performance
  - Memory usage monitoring
  - Throttle and debounce utilities

### Changed
- Enhanced Message component to support virtualization
- Added animation effects for improved user experience
- Integrated keyboard shortcuts with existing UI controls
- Enhanced error handling with fallback UI components

### Fixed
- Fixed TypeScript errors in API client
- Improved focus management in modal dialogs
- Fixed CSS issues with dark/light theme transitions

## [0.1.0] - 2023-04-08

### Added
- Initial release with core chat functionality
- Chat interface with message list and input
- API key security
- Conversation management
- Theme toggle (dark/light)
- System prompt configuration
- Basic file handling