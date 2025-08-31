#!/bin/bash

# Environment setup script for deployment
# Domain: prompt-assistant.dukang.online

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔧 Setting up environment for prompt-assistant.dukang.online..."

# Production domain configuration
PRODUCTION_FRONTEND_URL="https://prompt-assistant.dukang.online"
PRODUCTION_BACKEND_URL="https://prompt-assistant.dukang.online/api"
PRODUCTION_API_BASE_URL="https://prompt-assistant.dukang.online/api"
PRODUCTION_CORS_ORIGIN="https://prompt-assistant.dukang.online"

# Function to create env file with proper domain
create_env_file() {
    local target_file=$1
    local env_type=${2:-production}
    
    echo "Creating $target_file for $env_type environment..."
    
    cat > "$target_file" << EOF
# ================================
# DOMAIN CONFIGURATION
# ================================
EOF

    if [ "$env_type" = "development" ]; then
        cat >> "$target_file" << EOF
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
API_BASE_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
EOF
    else
        cat >> "$target_file" << EOF
FRONTEND_URL=$PRODUCTION_FRONTEND_URL
BACKEND_URL=$PRODUCTION_BACKEND_URL
API_BASE_URL=$PRODUCTION_API_BASE_URL
CORS_ORIGIN=$PRODUCTION_CORS_ORIGIN
NODE_ENV=production
EOF
    fi

    cat >> "$target_file" << EOF

# ================================
# DATABASE CONFIGURATION
# ================================
DATABASE_URL="postgresql://prompt_assistant_user:TrMemorim917Ebgmg3shnUVRjUg45EfG@dpg-d2ndcj0gjchc7392nmd0-a.singapore-postgres.render.com/prompt_assistant"
REDIS_URL="redis-18674.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com:18674"

# ================================
# CLERK AUTHENTICATION
# ================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_MxcZhxjNULhEmeDlDvvPpGIzMtEC1c16XhdGgH1X2z"
CLERK_SECRET_KEY="sk_test_MxcZhxjNULhEmeDlDvvPpGIzMtEC1c16XhdGgH1X2z"
CLERK_WEBHOOK_SECRET="your-clerk-webhook-secret"

# Clerk Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/chat"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/chat"

# ================================
# AI SERVICES
# ================================
GEMINI_API_KEY="AIzaSyAhMbHTPlH8J8yoUos8nxSeaWEz9gQabXs"

# ================================
# CLOUDINARY CONFIGURATION
# ================================
CLOUDINARY_CLOUD_NAME="shopdevbydk"
CLOUDINARY_API_KEY="634991545129918"
CLOUDINARY_API_SECRET="ixFKtkraEE0UhQPuZ2AH4hk77Lw"

# ================================
# APPLICATION SETTINGS
# ================================
PORT=3001
FRONTEND_PORT=3000
BACKEND_PORT=3001

# ================================
# SECURITY
# ================================
JWT_SECRET="VD8j2Kx9mN3QpR7sT1uY5wZ8aB4cE6fH9iL2mP5qS8v"
JWT_EXPIRES_IN="7d"
HELMET_ENABLED=true

# ================================
# FILE UPLOAD
# ================================
MAX_FILE_SIZE=10485760
UPLOAD_DIR="./uploads"

# ================================
# RATE LIMITING
# ================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ================================
# LOGGING
# ================================
LOG_LEVEL="info"
LOG_FORMAT="combined"
EOF
    
    # Set secure permissions
    chmod 600 "$target_file"
    echo "✅ Created $target_file"
}

# Function to validate required environment variables
validate_env_file() {
    local env_file=$1
    
    echo "🔍 Validating $env_file..."
    
    # Check for required variables
    local required_vars=(
        "FRONTEND_URL"
        "BACKEND_URL"
        "DATABASE_URL"
        "JWT_SECRET"
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
        "CLERK_SECRET_KEY"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file" || grep -q "^${var}=your_" "$env_file"; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo "⚠️  Warning: The following required variables need to be configured:"
        printf "   - %s\n" "${missing_vars[@]}"
        echo ""
        echo "Please edit $env_file and set proper values."
        return 1
    fi
    
    echo "✅ Environment file validation passed"
    return 0
}

# Main execution
main() {
    local environment=${1:-production}
    
    echo "Setting up environment for: $environment"
    echo "Domain: prompt-assistant.dukang.online"
    
    # Create main .env file
    create_env_file "$PROJECT_ROOT/.env" "$environment"
    
    # Create environment files for frontend and backend
    mkdir -p "$PROJECT_ROOT/frontend"
    mkdir -p "$PROJECT_ROOT/backend"
    
    # For development: create actual copies
    # For production: create symlinks if supported
    if [ "$environment" = "development" ]; then
        cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/frontend/.env.local"
        cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/backend/.env"
        echo "✅ Created development environment files"
    else
        # Production: create symlinks if supported
        if command -v ln >/dev/null 2>&1; then
            # Remove existing files
            [ -f "$PROJECT_ROOT/frontend/.env.local" ] && rm "$PROJECT_ROOT/frontend/.env.local"
            [ -f "$PROJECT_ROOT/backend/.env" ] && rm "$PROJECT_ROOT/backend/.env"
            
            # Create symlinks
            ln -s "../.env" "$PROJECT_ROOT/frontend/.env.local"
            ln -s "../.env" "$PROJECT_ROOT/backend/.env"
            
            echo "✅ Created production environment symlinks"
        else
            # Fallback: copy files
            cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/frontend/.env.local"
            cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/backend/.env"
            
            echo "✅ Created production environment files (copied)"
        fi
    fi
    
    # Validate environment file
    if [ "$environment" != "template" ]; then
        validate_env_file "$PROJECT_ROOT/.env" || true
    fi
    
    echo ""
    echo "🎉 Environment setup completed for prompt-assistant.dukang.online!"
    echo ""
    echo "Configuration:"
    echo "  Frontend: https://prompt-assistant.dukang.online"
    echo "  Backend:  https://prompt-assistant.dukang.online/api"
    echo ""
    echo "Files created:"
    echo "  - .env"
    echo "  - frontend/.env.local"
    echo "  - backend/.env"
    echo ""
    echo "Next steps:"
    echo "1. Test the application: npm run dev"
    echo "2. For production: ensure SSL certificate is configured"
    echo "3. Update Nginx configuration with provided config"
}

# Show usage if no arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 [environment]"
    echo ""
    echo "Environments:"
    echo "  development  - Setup for local development"
    echo "  production   - Setup for prompt-assistant.dukang.online"
    echo ""
    echo "Examples:"
    echo "  $0 development"
    echo "  $0 production"
    echo ""
    exit 1
fi

main "$@"

# Function to validate required environment variables
validate_env_file() {
    local env_file=$1
    
    echo "🔍 Validating $env_file..."
    
    # Check for required variables
    local required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
        "CLERK_SECRET_KEY"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file" || grep -q "^${var}=your_" "$env_file"; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        echo "⚠️  Warning: The following required variables need to be configured:"
        printf "   - %s\n" "${missing_vars[@]}"
        echo ""
        echo "Please edit $env_file and set proper values."
        return 1
    fi
    
    echo "✅ Environment file validation passed"
    return 0
}

# Main execution
main() {
    local environment=${1:-development}
    
    echo "Setting up environment for: $environment"
    
    # Create main .env file
    create_env_file "$PROJECT_ROOT/.env.template" "$PROJECT_ROOT/.env" "$environment"
    
    # Create symlinks for frontend and backend
    if [ "$environment" = "development" ]; then
        # Development: create actual copies
        mkdir -p "$PROJECT_ROOT/frontend"
        mkdir -p "$PROJECT_ROOT/backend"
        
        cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/frontend/.env.local"
        cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/backend/.env"
        
        echo "✅ Created development environment files"
    else
        # Production: create symlinks if supported
        if command -v ln >/dev/null 2>&1; then
            mkdir -p "$PROJECT_ROOT/frontend"
            mkdir -p "$PROJECT_ROOT/backend"
            
            # Remove existing files
            [ -f "$PROJECT_ROOT/frontend/.env.local" ] && rm "$PROJECT_ROOT/frontend/.env.local"
            [ -f "$PROJECT_ROOT/backend/.env" ] && rm "$PROJECT_ROOT/backend/.env"
            
            # Create symlinks
            ln -s "../.env" "$PROJECT_ROOT/frontend/.env.local"
            ln -s "../.env" "$PROJECT_ROOT/backend/.env"
            
            echo "✅ Created production environment symlinks"
        else
            # Fallback: copy files
            cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/frontend/.env.local"
            cp "$PROJECT_ROOT/.env" "$PROJECT_ROOT/backend/.env"
            
            echo "✅ Created production environment files (copied)"
        fi
    fi
    
    # Validate environment file
    if [ "$environment" != "template" ]; then
        validate_env_file "$PROJECT_ROOT/.env" || true
    fi
    
    echo ""
    echo "🎉 Environment setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your actual values"
    echo "2. Test the application: npm run dev"
    echo "3. For production: ensure all secrets are properly configured"
}

# Show usage if no arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 [environment]"
    echo ""
    echo "Environments:"
    echo "  development  - Setup for local development"
    echo "  production   - Setup for production deployment"
    echo ""
    echo "Examples:"
    echo "  $0 development"
    echo "  $0 production"
    echo ""
    exit 1
fi

main "$@"
