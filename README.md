# Voice Shopping List

A simple React component for creating shopping lists using voice input. Speak your shopping items, and this component will convert your speech to text and organize it into a neat bullet-point list.

## Features

- 🎤 Voice recording with browser's Web Speech API
- 📝 Automatic conversion of speech to text
- 🗂️ Smart formatting of recognized items into bullet points
- 📱 Responsive design that works on desktop and mobile
- ✅ Ability to edit, delete, and mark items as complete
- 💾 Local storage to save your lists

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
    <div className="App">
      <h1>My Shopping List</h1>
      <VoiceShoppingList />
    </div>
  );
}

export default App;
```

## Development

To develop locally:

1. Clone this repository
2. Install dependencies with `npm install` or `yarn`
3. Start the development server with `npm run dev` or `yarn dev`
4. Build for production with `npm run build` or `yarn build`

## Browser Support

This component uses the Web Speech API, which is supported in:
- Chrome (desktop & Android)
- Edge
- Safari (desktop & iOS)
- Firefox (limited support)

## License

MIT
