#!/bin/bash
# installation.sh - Installs and configures the voice-shopping-list component

# ---------------------
# Color settings for messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ---------------------
# Message functions
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

warn_msg() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

# ---------------------
# Function to check if a command exists
check_command() {
    command -v "$1" >/dev/null 2>&1 || error_exit "$1 is required but not installed."
}

# ---------------------
# Function to check Node.js version
verify_node_version() {
    local version
    version=$(node --version | cut -d'v' -f2)
    local major
    major=$(echo "$version" | cut -d'.' -f1)
    if [ "$major" -lt 16 ]; then
        error_exit "Node.js version must be 16.x or higher (current: $version)"
    fi
    success_msg "Node.js version $version verified"
}

# ---------------------
# Function to check pnpm version
verify_pnpm_version() {
    local version
    version=$(pnpm --version)
    success_msg "pnpm version $version verified"
}

# ---------------------
# Function to check if server is running
check_server() {
    local server_url="$1"
    
    echo "🔍 Checking if server is running at $server_url/health..."
    
    # Try to access the health endpoint
    if curl --output /dev/null --silent --head --fail "$server_url/health"; then
        success_msg "Server is running at $server_url"
        return 0
    else
        warn_msg "Server is not accessible at $server_url"
        
        read -p "Do you want to continue anyway? [y/N]: " continue_anyway
        if [[ "$continue_anyway" =~ ^[Yy]$ ]]; then
            warn_msg "Continuing without server. Some features may not work correctly."
            return 0
        else
            error_exit "Please start the server before running this script."
        fi
    fi
}

# ---------------------
# Function to create .env file if it doesn't exist
create_env_file() {
    if [ ! -f ".env" ]; then
        echo "Creating .env file..."
        cp .env.example .env || error_exit "Failed to create .env file"
        success_msg "Created .env file from template"
    else
        success_msg ".env file already exists"
    fi
}

# ---------------------
# Main execution

echo "🔍 Checking prerequisites..."
check_command node
check_command pnpm
verify_node_version
verify_pnpm_version

# Check if the server is running on default port
DEFAULT_SERVER_URL="http://localhost:3001"
check_server "$DEFAULT_SERVER_URL"

# Create .env.example if it doesn't exist
if [ ! -f ".env.example" ]; then
    echo "Creating .env.example file..."
    cat > .env.example << 'EOL'
# API endpoints - uncomment and configure the one you're using

# Local vistacare.node server (default)
VITE_API_URL=http://localhost:3001

# Remote vistacare.node server
# VITE_API_URL=http://your-remote-ip:3001

# OpenAI Whisper API 
# VITE_USE_OPENAI_API=true
# VITE_OPENAI_API_KEY=your-api-key-here
# VITE_OPENAI_API_URL=https://api.openai.com/v1/audio/transcriptions
EOL
    success_msg "Created .env.example file"
fi

# Create .env from .env.example if it doesn't exist
create_env_file

echo "🚀 Installing dependencies..."
pnpm install || error_exit "Failed to install dependencies"
success_msg "Dependencies installed successfully"

echo "🌟 Running tests..."
pnpm test || warn_msg "Tests failed, but continuing with installation"

echo "🧪 Creating development build..."
pnpm build || error_exit "Failed to build project"
success_msg "Build completed successfully"

echo -e "${GREEN}Installation completed successfully!${NC}"
echo "You can now run the project with: pnpm dev"
echo "See INSTALLATION.md for more configuration options"
