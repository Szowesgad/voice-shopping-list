# Installation Guide

This guide will walk you through the complete setup process for the Voice Shopping List component, including the required server components for speech recognition.

## 🌟 Quick Start: The Magic 3-Step Sequence

For the most efficient setup, follow these three steps in order:

```bash
# Step 1: Initialize the Whisper model (downloads model & builds whisper.cpp)
cd server
chmod +x model_init.sh
./model_init.sh

# Step 2: Start the transcription server
chmod +x server_init.sh
./server_init.sh

# Step 3: In a new terminal, install and run the frontend component
cd ..
chmod +x installation.sh
./installation.sh
```

This sequence ensures that:
1. The Whisper model is properly downloaded and compiled
2. The transcription server is running correctly
3. The frontend component is installed with the proper configuration

## Prerequisites

- Node.js 18.x for server, 16.x+ for frontend
- pnpm 8.x or later (recommended) or npm/yarn
- git, cmake, and curl (for model_init.sh)
- 2GB+ free disk space for model files
- Basic understanding of terminal/command-line operations

## Detailed Installation Steps

### Step 1: Initialize Whisper Model

The `model_init.sh` script performs several important tasks:
- Checks prerequisites (node, pnpm, curl, git, cmake)
- Verifies that Node.js version is 18.x for server compatibility
- Creates required directories: uploads, models, build
- Downloads your selected Whisper model (small, medium, or large)
- Builds and installs whisper.cpp with proper library handling

```bash
cd server
chmod +x model_init.sh
./model_init.sh
```

During this process, you'll be asked to:
1. Select which model to download (small, medium, large)
2. Confirm building whisper.cpp from source

> 💡 **Tip**: The large model (1.6GB) provides the best accuracy, but the medium model (800MB) offers a good balance of speed and accuracy.

### Step 2: Start the Transcription Server

The `server_init.sh` script:
- Installs server dependencies using pnpm
- Starts the server in development mode

```bash
chmod +x server_init.sh
./server_init.sh
```

You should see output confirming:
- Model file found
- Whisper binary ready
- Server running at http://0.0.0.0:3001

> ⚠️ **Important**: Keep this terminal window open and server running. You'll need to open a new terminal for the next step.

### Step 3: Install and Run the Frontend

In a new terminal window, navigate back to the project root and run:

```bash
cd ..  # Return to project root (if you're still in the server directory)
chmod +x installation.sh
./installation.sh
```

The `installation.sh` script:
- Checks for Node.js and pnpm
- Verifies the server is running
- Creates an environment configuration (.env)
- Installs frontend dependencies
- Builds and starts the development server

When complete, you can access the component at http://localhost:3000.

## Environment Configuration

The installation creates a `.env` file with sensible defaults. You can customize these settings:

```
# API endpoints - uncomment and configure as needed

# Local vistacare.node server (default)
VITE_API_URL=http://localhost:3001

# Remote vistacare.node server - use for team environments
# VITE_API_URL=http://your-remote-ip:3001

# OpenAI Whisper API - alternative to running your own server
# VITE_USE_OPENAI_API=true
# VITE_OPENAI_API_KEY=your-api-key-here
```

## Troubleshooting

### Model Download Issues

If you encounter problems downloading the model:
- Ensure you have a stable internet connection
- Try a smaller model if disk space is limited
- Check the `models` directory for partial downloads and remove them

### Server Won't Start

If the server fails to start:
- Ensure Node.js 18.x is active (`node --version`)
- Check that model_init.sh completed successfully
- Verify the whisper model and binary exist in the `models` directory

### Frontend Connection Issues

If the frontend can't connect to the server:
- Ensure the server is running at http://localhost:3001
- Verify your `.env` file has the correct `VITE_API_URL`
- Check if your firewall is blocking local connections

## Alternative: Manual Installation

If you prefer to install components individually:

### Server Setup

```bash
cd server
pnpm install
# Download model manually from HuggingFace: https://huggingface.co/ggerganov/whisper.cpp
# Place model in server/models directory
# Clone and build whisper.cpp following instructions at: https://github.com/ggerganov/whisper.cpp
pnpm dev
```

### Frontend Setup

```bash
pnpm install
# Create .env file manually with VITE_API_URL=http://localhost:3001
pnpm dev
```

## Going to Production

For production deployment:
1. Build the server component separately
2. Configure the frontend to point to your deployed server
3. Build the frontend for production with `pnpm build`

See the README for more details on component configuration and usage.
