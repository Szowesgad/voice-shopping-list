# Voice Shopping List

A React component for creating shopping lists using voice input. This component provides a seamless way to create and manage shopping lists using speech recognition, with fallback to a remote speech-to-text API.

## Features

- **Voice Input**: Record your shopping items using your voice
- **Text Input**: Traditional text input as an alternative
- **Audio File Upload**: Upload audio recordings for transcription
- **Multiple Speech Recognition Methods**:
  - Browser's Web Speech API for local processing
  - Vista API for server-side processing (`http://178.183.101.202:3001`)
  - Automatic fallback if one method isn't available
- **Voice Visualization**: Real-time audio visualization during recording
- **Transcript Preview**: See what's being transcribed in real-time
- **List Management**:
  - Add, edit, delete items
  - Mark items as complete
  - Clear completed items
  - Clear all items
- **Command Recognition**: Special voice commands like "clear list", "delete last item"
- **Local Storage**: Persist lists between sessions
- **Download Options**: Download list in various formats (TXT, CSV, JSON, HTML)

## Installation

```bash
npm install voice-shopping-list
# or
yarn add voice-shopping-list
```

## Usage

```jsx
import React from 'react';
import { VoiceShoppingList } from 'voice-shopping-list';

function App() {
  return (
    <div className="container mx-auto p-4">
      <VoiceShoppingList 
        title="Grocery List"
        language="en-US"
        enableStorage={true}
      />
    </div>
  );
}

export default App;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | "Shopping List" | Title for the shopping list |
| `placeholder` | string | "Add an item..." | Placeholder text for the input field |
| `language` | string | "en-US" | Language for speech recognition |
| `maxItems` | number | 100 | Maximum number of items to keep in history |
| `storageKey` | string | "voice-shopping-list" | Local storage key for persisting the list |
| `enableStorage` | boolean | true | Enable or disable local storage persistence |
| `className` | string | "" | Custom CSS class for the component |
| `onListChange` | function | undefined | Event handler for when the list changes |

## Voice Commands

The component recognizes the following voice commands:

- "Clear list", "Clear the list", "Start over" - Clears the entire list
- "Delete last", "Remove last", "Undo last" - Removes the last added item
- "Mark all as done", "Complete all", "Check all" - Marks all items as completed

## Server API Integration

By default, the component tries to use the browser's Web Speech API. If that's not available, it falls back to the Vista API endpoint at `http://178.183.101.202:3001`.

## Browser Compatibility

The Web Speech API is supported in:
- Chrome
- Edge
- Safari (limited support)
- Firefox (limited support)

For browsers without Web Speech API support, the component falls back to using the Vista API endpoint.

## Development

To build the component locally:

```bash
# Clone the repo
git clone https://github.com/Szowesgad/voice-shopping-list.git
cd voice-shopping-list

# Install dependencies
npm install

# Start development server
npm run dev
```

## License

MIT © [div0.space](https://github.com/Szowesgad)
