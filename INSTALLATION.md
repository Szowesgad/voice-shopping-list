# Installation Guide

This guide will help you set up and run the Voice Shopping List component in your project.

## Prerequisites

- Node.js 18.x or later
- pnpm 8.x or later (recommended) or npm/yarn
- Access to a Whisper API service (optional)
  - Local server (vistacare.node) 
  - OpenAI Whisper API
  - Other compatible API

## Quick Installation

For the simplest setup, you can use the provided installation script:

```bash
# Make the script executable
chmod +x installation.sh

# Run the script
./installation.sh
```

The script will:
1. Check prerequisites
2. Verify the server is running (if using local server)
3. Install dependencies
4. Set up environment variables

## Manual Installation

If you prefer to install manually, follow these steps:

### 1. Install dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Using npm
npm install

# Using yarn
yarn install
```

### 2. Configure environment variables

Create a `.env` file in the root of your project:

```
# API endpoints - uncomment and configure the one you're using

# Local vistacare.node server (default)
VITE_API_URL=http://localhost:3001

# Remote vistacare.node server
# VITE_API_URL=http://your-remote-ip:3001

# OpenAI Whisper API 
# VITE_USE_OPENAI_API=true
# VITE_OPENAI_API_KEY=your-api-key-here
# VITE_OPENAI_API_URL=https://api.openai.com/v1/audio/transcriptions
```

### 3. Start the development server

```bash
# Using pnpm
pnpm dev

# Using npm
npm run dev

# Using yarn
yarn dev
```

## Server Configuration

### Local Server (vistacare.node)

If you're using the local vistacare.node server:

1. Make sure the server is running before starting the frontend
2. The server should be accessible at http://localhost:3001
3. Verify server health with: `curl http://localhost:3001/health`

### OpenAI Whisper API

If you're using the OpenAI Whisper API:

1. Sign up for an API key at [OpenAI](https://platform.openai.com/)
2. Set the environment variables:
   - `VITE_USE_OPENAI_API=true`
   - `VITE_OPENAI_API_KEY=your-api-key-here`

## Troubleshooting

### Server Connection Issues

If you're having trouble connecting to the server:

1. Verify the server is running with: `curl http://localhost:3001/health`
2. Check your firewall settings if using a remote server
3. Ensure the correct URL is set in your `.env` file

### React Hook Errors

If you encounter errors about invalid hook calls:

1. Make sure you're using React 16.8 or later
2. Verify you don't have multiple versions of React in your project
3. Ensure the component is only used within React function components

### Speech Recognition Not Working

1. Check browser compatibility (Chrome and Edge have best support)
2. Verify microphone permissions are granted
3. Ensure server is accessible if using API-based recognition

## Additional Configuration

See the `README.md` file for detailed information on component props and customization options.
