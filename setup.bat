@echo off
REM Development setup script for Prompt Assistant (Windows)

echo 🚀 Setting up Prompt Assistant development environment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo [INFO] Node.js found ✓

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Docker is not installed. You'll need to set up PostgreSQL and Redis manually.
) else (
    echo [INFO] Docker found ✓
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo [INFO] Creating .env file from template...
    copy .env.example .env
    echo [WARNING] Please edit .env file with your actual API keys and secrets
) else (
    echo [INFO] .env file already exists ✓
)

REM Install root dependencies
echo [INFO] Installing root dependencies...
npm install

REM Install backend dependencies
echo [INFO] Installing backend dependencies...
cd backend
npm install
cd ..

REM Install frontend dependencies
echo [INFO] Installing frontend dependencies...
cd frontend
npm install
cd ..

REM Setup database with Docker
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [INFO] Starting database containers...
    docker-compose up -d postgres redis
    
    REM Wait for database to be ready
    echo [INFO] Waiting for database to be ready...
    timeout /t 10 /nobreak >nul
    
    REM Run database migrations
    echo [INFO] Running database migrations...
    cd backend
    npx prisma generate
    npx prisma migrate dev --name init
    cd ..
) else (
    echo [WARNING] Docker not available. Please setup PostgreSQL and Redis manually.
    echo [WARNING] Database URL: postgresql://postgres:postgres123@localhost:5432/prompt_assistant
    echo [WARNING] Redis URL: redis://localhost:6379
)

echo [INFO] ✅ Setup complete!
echo.
echo 📝 Next steps:
echo 1. Edit .env file with your API keys
echo 2. Start development: npm run dev
echo 3. Open http://localhost:3000 for frontend
echo 4. Open http://localhost:3001/api/docs for API docs
echo.
echo 🐳 Docker commands:
echo - Start all services: docker-compose up
echo - Stop all services: docker-compose down
echo - View database: npm run db:studio

pause
