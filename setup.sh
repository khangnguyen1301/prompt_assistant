#!/bin/bash
# Development setup script for Prompt Assistant

echo "🚀 Setting up Prompt Assistant development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Node.js version $REQUIRED_VERSION or higher is required. Current version: $NODE_VERSION"
    exit 1
fi

print_status "Node.js version: $NODE_VERSION ✓"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed. You'll need to set up PostgreSQL and Redis manually."
else
    print_status "Docker found ✓"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp .env.example .env
    print_warning "Please edit .env file with your actual API keys and secrets"
else
    print_status ".env file already exists ✓"
fi

# Install root dependencies
print_status "Installing root dependencies..."
npm install

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Setup database with Docker
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    print_status "Starting database containers..."
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Run database migrations
    print_status "Running database migrations..."
    cd backend
    npx prisma generate
    npx prisma migrate dev --name init
    cd ..
else
    print_warning "Docker not available. Please setup PostgreSQL and Redis manually."
    print_warning "Database URL: postgresql://postgres:postgres123@localhost:5432/prompt_assistant"
    print_warning "Redis URL: redis://localhost:6379"
fi

print_status "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Start development: npm run dev"
echo "3. Open http://localhost:3000 for frontend"
echo "4. Open http://localhost:3001/api/docs for API docs"
echo ""
echo "🐳 Docker commands:"
echo "- Start all services: docker-compose up"
echo "- Stop all services: docker-compose down"
echo "- View database: npm run db:studio"
