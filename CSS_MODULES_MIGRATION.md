# CSS Modules Migration

This document describes the migration strategy from global CSS to CSS Modules and outlines best practices for using CSS Modules in the application.

## What are CSS Modules?

CSS Modules are CSS files in which all class names and animation names are scoped locally by default. This means that:

- Class names are automatically scoped to the component
- No class name collisions across components
- More maintainable styling with component-scoped CSS
- Better developer experience with type-checking for styles

## Migration Progress

### Completed Components

The following components have been migrated to CSS Modules:

- App (main container)
- VoiceInput
- FileAttachments
- Message
- MessageList
- ModelSelector
- SystemPromptEditor
- ChatInput
- MessageComposer
- ToolbarControls
- ConversationTitle
- ConversationList
- LoadingSpinner

### Components To Be Migrated

The following components still need to be migrated:

- ConversationControls
- Header
- ApiKeyModal

## Migration Strategy

### 1. Create the CSS Module File

For each component, create a corresponding `.module.css` file with the same base name:

```
ComponentName.tsx       # Component file
ComponentName.module.css # CSS Module file
```

### 2. Extract Styles from Global CSS

Move relevant styles from the global CSS file (`App.css`) to the component-specific module.

### 3. Update Class Names in JSX

Replace global class names with imported styles:

**Before:**
```jsx
<div className="component-container">
  <h2 className="component-title">Title</h2>
  <button className="component-button">Click Me</button>
</div>
```

**After:**
```jsx
import styles from './Component.module.css';

<div className={styles.container}>
  <h2 className={styles.title}>Title</h2>
  <button className={styles.button}>Click Me</button>
</div>
```

### 4. Handle Conditional Classes

Use a utility function or the filter/join pattern for conditional classes:

```jsx
// Method 1: Array filter and join
const buttonClasses = [
  styles.button,
  disabled ? styles.disabled : '',
  size === 'large' ? styles.large : ''
].filter(Boolean).join(' ');

// Method 2: Template literals for simple cases
const buttonClasses = `${styles.button} ${disabled ? styles.disabled : ''}`;
```

## CSS Modules Best Practices

### 1. Use Semantic Class Names

Name classes based on their purpose, not their visual appearance:

```css
/* Good */
.container { /* ... */ }
.navigation { /* ... */ }
.userAvatar { /* ... */ }

/* Bad */
.blueBox { /* ... */ }
.largeText { /* ... */ }
.leftFloated { /* ... */ }
```

### 2. Follow Component Structure

Your CSS structure should follow the component hierarchy:

```css
.container { /* Container styles */ }
.header { /* Header styles */ }
.header .title { /* Nested element */ }
.content { /* Content area */ }
.footer { /* Footer */ }
```

### 3. Use Design Tokens via CSS Variables

Always reference design tokens through CSS variables for consistency:

```css
.button {
  background-color: var(--primary-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
}
```

### 4. Avoid Excessive Nesting

Keep nesting to a minimum to improve readability and performance:

```css
/* Good */
.container { /* ... */ }
.title { /* ... */ }
.button { /* ... */ }

/* Avoid - Too much nesting */
.container .wrapper .content .buttonGroup .button { /* ... */ }
```

### 5. Use Composition for Common Patterns

Extract common patterns into their own classes and compose them:

```css
/* Common patterns */
.flexRow {
  display: flex;
  align-items: center;
}

/* Specific component styles */
.header {
  composes: flexRow;
  justify-content: space-between;
}

.toolbar {
  composes: flexRow;
  gap: var(--spacing-sm);
}
```

### 6. Responsive Design

Use media queries at the component level:

```css
.container {
  padding: var(--spacing-md);
}

@media (max-width: 768px) {
  .container {
    padding: var(--spacing-sm);
  }
}
```

## CSS Variables Management

The application uses a system of CSS variables to maintain consistency across components. These variables are defined in the root stylesheet and include:

- Color system (primary, secondary, etc.)
- Spacing scale
- Typography scale
- Border radius values
- Shadow values
- Animation timings

Always use these variables instead of hardcoded values to maintain consistency throughout the application.