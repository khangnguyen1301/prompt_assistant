#!/bin/bash

# CI Environment Setup Script
echo "Setting up CI environment..."

# Set Node.js environment
export NODE_ENV=production
export CI=true
export NEXT_TELEMETRY_DISABLED=1
export SKIP_ENV_VALIDATION=1

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Ensure clean state
echo "Cleaning previous builds..."
rm -rf frontend/.next frontend/node_modules backend/dist backend/node_modules

# Install root dependencies first
echo "Installing root dependencies..."
npm ci --prefer-offline --no-audit

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
rm -f package-lock.json
npm install --prefer-offline --no-audit --legacy-peer-deps
cd ..

# Install backend dependencies  
echo "Installing backend dependencies..."
cd backend
npm install --prefer-offline --no-audit
cd ..

echo "✅ Environment setup complete!"
